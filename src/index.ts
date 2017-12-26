import express = require('express');
import NeopixelHelper = require('./NeopixelHelper');
import bodyParser = require('body-parser');

const app = express();
const arduino = new NeopixelHelper();

app.use(bodyParser.json());

app.post('/arduino/init', (req, res) => 
	{
		return res.json(arduino.init(req));
	}
);

app.post('/arduino/defaults', (req, res) => 
	{
		return res.json(arduino.setDefaults(req));
	}
);

app.post('/arduino/rgb', (req, res) => 
	{
		return res.json(arduino.setRGB(req));
	}
);

app.post('/arduino/fade', (req, res) => 
	{
		return res.json(arduino.setFading(req));
	}
);

app.post('/arduino/fill', (req, res) => 
	{
		return res.json(arduino.setFill(req));
	}
);


app.get('/arduino/brightness/:brightness', (req, res) => 
	{
		return res.json(arduino.setIlluminance(req));
	}
);


app.listen(3000);