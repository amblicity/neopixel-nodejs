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

	constructor() {
		net.createServer(this.onClientConnected.bind(this)).listen(SocketAPI.PORT, SocketAPI.HOST);
		console.log('Server listening on ' + SocketAPI.HOST +':'+ SocketAPI.PORT);
	}

	private onClientConnected(sock) {
		console.log("client connected");

		this.socket = sock;
		this.socket.on('data', this.onSocketData.bind(this));
		this.socket.on('close', this.onSocketClosed);
	}

	// usage: {"cmd":"rgb", "data":{"start":80, "end":144, "color":{"r":0, "g":80, "b":0}}}
	private onSocketData(data) {
		let dataStr = data.toString();
		let commandID;

		try {
			this.jsonData = JSON.parse(dataStr);
			if(this.validateCommandID(this.jsonData.cmd)) this.runCommand(this.jsonData.cmd);
				else this.returnError();
		} catch(e) {
			console.log("invalid json");
			this.socket.write("invalid json");
		}		
	}

	private onSocketClosed(data) {
		console.log('socket closed');
	}

	private validateCommandID(id) {
		for(var i=0; i<SocketAPI.CMDS.length; i++) {
			if(SocketAPI.CMDS[i] === id) return true;
		}

		return false;
	}

	private runCommand(id) {
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

			default:
				this.returnError();
		}

	}

	private returnError() {
		this.socket.write("missing id or data")
		throw new Error();
	}
}

const api = new SocketAPI();