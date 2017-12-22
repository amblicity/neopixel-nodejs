import express = require('express');
import NeopixelHelper = require('./NeopixelHelper');
import net = require('net');

class SocketAPI {
	static HOST = '0.0.0.0';
	static PORT = 6969;

	static CMD_INIT = "init";
	static CMD_RGB = "rgb";
	static CMD_FILL = "fill";
	static CMD_FADE = "fade";
	static CMD_BRIGHTNESS = "brightness";
	
	static CMDS = [SocketAPI.CMD_INIT, SocketAPI.CMD_RGB, SocketAPI.CMD_FILL, SocketAPI.CMD_FADE, SocketAPI.CMD_BRIGHTNESS];

	private socket;
	private jsonData;
	private arduino = new NeopixelHelper();

	private server;

	constructor() {
		this.server = net.createServer((socket) => {
			this.socket = socket;
			socket.on('data', (data) => this.onSocketData(data));
			socket.on('close', this.onSocketClosed);
		}).listen(SocketAPI.PORT, SocketAPI.HOST);
	}

	private onSocketData(data:object):void {
		let dataStr = data.toString();
		let commandID;

		try {
			this.jsonData = JSON.parse(dataStr);
			if(this.validateCommandID(this.jsonData.cmd)) this.runCommand(this.jsonData.cmd);
				else this.returnError('invalid command id');
		} catch(e) {
			this.returnError('invalid json');
		}		
	}

	private onSocketClosed():void {
		console.log('socket closed');
	}

	private validateCommandID(id:string):boolean {
		for (let entry of SocketAPI.CMDS) {
		    if(entry === id) return true;
		}

		return false;
	}

	private runCommand(id:string):void {
		this.jsonData['body'] = this.jsonData['data'];
		delete this.jsonData['data'];

		switch(id) {
			case SocketAPI.CMD_INIT:
				this.arduino.init(this.jsonData, null);
			break;

			case SocketAPI.CMD_RGB:
				this.arduino.setRGB(this.jsonData, null);
			break;

			case SocketAPI.CMD_FILL:
				this.arduino.setFill(this.jsonData, null);
			break;

			case SocketAPI.CMD_FADE:
				this.arduino.setFading(this.jsonData, null);
			break;
		}

	}

	private returnError(str:string):void {
		this.socket.write(str);
		throw new Error();
	}
}

const api = new SocketAPI();