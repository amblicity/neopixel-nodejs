import express = require('express');
import NeopixelHelper = require('./NeopixelHelper');

const bodyParser = require('body-parser');

const app = express();
const arduino = new NeopixelHelper();

app.use(bodyParser.json());

app.post('/arduino/init', (req, res) => 
	{
		arduino.init(req, res);
	}
);

app.post('/arduino/defaults', (req, res) => 
	{
		arduino.setDefaults(req, res);
	}
);

app.post('/arduino/rgb', (req, res) => 
	{
		arduino.setRGB(req, res);
	}
);

app.post('/arduino/fade', (req, res) => 
	{
		arduino.setFading(req, res);
	}
);

app.post('/arduino/fill', (req, res) => 
	{
		arduino.setFill(req, res);
	}
);


app.get('/arduino/brightness/:brightness', (req, res) => 
	{
		arduino.setIlluminance(req, res);
	}
);


app.listen(3000);
