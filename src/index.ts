import express = require('express');
import NeopixelHelper = require('./NeopixelHelper');
import bodyParser = require('body-parser');

const app = express();
const arduino = new NeopixelHelper();

app.use(bodyParser.json());

app.post('/arduino/init', (req, res) => 
	{
		return res.json(arduino.init(req, res));
	}
);

app.post('/arduino/defaults', (req, res) => 
	{
		return res.json(arduino.setDefaults(req, res));
	}
);

app.post('/arduino/rgb', (req, res) => 
	{
		return res.json(arduino.setRGB(req, res));
	}
);

app.post('/arduino/fade', (req, res) => 
	{
		return res.json(arduino.setFading(req, res));
	}
);

app.post('/arduino/fill', (req, res) => 
	{
		return res.json(arduino.setFill(req, res));
	}
);


app.get('/arduino/brightness/:brightness', (req, res) => 
	{
		return res.json(arduino.setIlluminance(req, res));
	}
);


app.listen(3000);