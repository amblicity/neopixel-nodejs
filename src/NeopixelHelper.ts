'use_strict';

import * as SerialPort from 'serialport';
import * as ColorTween from 'color-tween';
import { Tweenable } from 'shifty';
import * as dotenv from 'dotenv';


class NeopixelHelper { 
	static COMMAND_LENGTH = 7;

	static CMD_DEFAULTS = 0;
	static CMD_RGB = 1;
	static CMD_BRIGHTNESS = 2;
	
	private environment;
	private com;
	private buffer = new Buffer(NeopixelHelper.COMMAND_LENGTH);

	constructor() {
		this.environment = dotenv.config().parsed; 
		if(!this.environment.AUTO_INIT as boolean) return;

		this.com = new SerialPort(this.environment.DEFAULT_COM_PORT, {
		    baudRate: parseInt(this.environment.DEFAULT_BAUD_RATE),
		    databits: 8, 
		    parity: 'none' 
		});

		this.com.on('error', function(e) {
			console.log("SerialPortError: ", e.message);
		});
		
		this.com.on('open', function(e) {
			console.log("connected");
		});
	}

	public async testAsync(req, res) {
		
	}
	
	public init(req, res):any { 
		this.com = new SerialPort(req.body.com, {
		    baudRate: req.body.baud,
		    databits: 8, 
		    parity: 'none'
		});

 
		this.com.on('error', function(e) {
			return {status:'notok', msg:e.message};
		});
		
		this.com.on('open', function(e) {
			return {status:'ok'};
		});

		return {status:'cannot open serial'}
	}

	// ROUTE: /arduino/defaults
	// {"offset":30, "maxleds":40}
	public setDefaults(req, res):any {
		this.buffer[0] = NeopixelHelper.CMD_DEFAULTS;
		this.buffer[1] = req.body.offset; 
		this.buffer[2] = req.body.maxleds; 

		return this.fillBufferAndSend();
	}

	// ROUTE: /arduino/rgb
	// {"start":5, "end":15, "color":{"r":100, "g":20, "b":0}}
	public setRGB(req, res):any {
		this.buffer[0] = NeopixelHelper.CMD_RGB;
		this.buffer[1] = req.body.start; 
		this.buffer[2] = req.body.end; 
		this.buffer[3] = req.body.color.r; 
		this.buffer[4] = req.body.color.g; 
		this.buffer[5] = req.body.color.b;

		return this.fillBufferAndSend(); 
	}

	
	// ROUTE: arduino/brightness/150
	public setIlluminance(req, res):any {
		this.buffer[0] = NeopixelHelper.CMD_BRIGHTNESS;
		this.buffer[1] = req.params.brightness; 
		
		return this.fillBufferAndSend();
	}

	// ROUTE: /arduino/move
	// {"pixelFrom":{"start":5, "end":6}, "pixelTo":{"start":50, "end":51}, "fillBehind":true, "duration":2500 "color":{"r":100, "g":20, "b":0}}
	public setFill(req, res):any {
		this.buffer[0] = NeopixelHelper.CMD_RGB;
		this.buffer[3] = req.body.color.r; 
		this.buffer[4] = req.body.color.g; 
		this.buffer[5] = req.body.color.b;

		const tween = new Tweenable(); 

		// @todo: add onFinished to return status to express
		tween.setConfig({
			from: { pixelStart: req.body.pixelFrom.start,  pixelEnd: req.body.pixelFrom.end  },
			to: { pixelStart: req.body.pixelTo.start,  pixelEnd: req.body.pixelTo.end },
			duration: req.body.duration > 650 ? req.body.duration : 650,
			easing: 'easeOutQuad',
			step: state => this.processMovement(state, req.body.pixelTo.fillBehind)
		});

		tween.tween();
		
		return {status:'ok'};	
	}

	protected processMovement(step, fillBehind):void {
		this.buffer[1] = parseInt(step.pixelStart); 
		this.buffer[2] = parseInt(step.pixelEnd); 
		
		this.fillBufferAndSend();
	}

	// ROUTE: /arduino/fade
	// {"start":0, "end":60, "duration":2500, "easing":"cubicInOut", colorFrom":{"r":0, "g":0, "b":50}, "colorTo":{"r":50, "g":0, "b":0}}
	public setFading(req, res):any {
		this.buffer[0] = NeopixelHelper.CMD_RGB;
		this.buffer[1] = req.body.start; 
		this.buffer[2] = req.body.end; 

		function componentToHex(c) {
		    var hex = c.toString(16);
		    return hex.length == 1 ? "0" + hex : hex;
		}

		function rgbToHex(r, g, b) {
		    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
		}

		// @todo: add onFinished to return status to express
		let tween = new ColorTween(
			rgbToHex(req.body.colorFrom.r, req.body.colorFrom.g, req.body.colorFrom.b), 
			rgbToHex(req.body.colorTo.r, req.body.colorTo.g, req.body.colorTo.b))
			.easing(req.body.easing || 'cubicInOut')
			.duration(req.body.duration < 650 ? 650 : req.body.duration)
			.onUpdate(this.processColor.bind(this))
			.start(animate);

		function animate() {
		    if (tween.update()) {
		      setTimeout(animate, 20);
		    }
		}

		return {status:'ok'};	
	}

	protected processColor(color):void {
		let colors = color.rgb().color;
		this.buffer[3] = colors[0]; 
		this.buffer[4] = colors[1]; 
		this.buffer[5] = colors[2]; 
		this.fillBufferAndSend();
	}

	protected fillBufferAndSend():any {
		try {
			for(var i = this.buffer.length; i < NeopixelHelper.COMMAND_LENGTH; i++) {
				this.buffer[i] = 0;
			}
		
			this.com.write(this.buffer, (cb) => {
				console.log('written to arduino');
			});
		} catch(e) {
			return {status:'notok', msg:e.message};
		}

		console.log('returning status');
		return {status:'ok', sent:this.buffer};
	}
}

export = NeopixelHelper; 