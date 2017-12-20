# neopixel-nodejs
Out of the box REST API to manipulate Adafruit Neopixels. Includes Arduino Sketch.

## Version 0.2.3
* Supports filling areas by providing four positions over a duration w/ rgb color

## Version 0.1.8
* Supports fading between two colors over a given time and area (start, end)
* Added easing to color-fading

## Version 0.1.3
* POST requests to ink each pixel on its own with RGB values (start, end, color)
* Supports chained requests to animate the strip (up to 60fps @1m/60)
* Basic Error handling
* Built with Node + Express + Typescript

![alt text](http://blog.unreal-mobile.com/pub/neopixel-nodejs.jpg "neopixel-nodejs")

## Usage 

#### Initialize your Arduino
```
POST /arduino/init
Host: localhost:3000
Content-Type: application/json

{"com":"COM5", "baud":128000}
```

#### Fade between two colors 
```
POST /arduino/fade 
Host: localhost:3000
Content-Type: application/json

{"start":0, "end":60, "duration":1500, "easing":"cubicInOut", 
	colorFrom":{"r":0, "g":0, "b":50}, "colorTo":{"r":50, "g":0, "b":0}}

```

#### Fill an area
```
POST /arduino/fill 
Host: localhost:3000
Content-Type: application/json

{"pixelFrom":{"start":0, "end":1}, "pixelTo":{"start":20, "end":50}, 
	"duration":1550, "color":{"r":0, "g":10, "b":10}}

```


#### Dye 10 pixels (5-15) with a slight orange
```
POST /arduino/rgb
Host: localhost:3000
Content-Type: application/json

{"start":5, "end":15, "colors":{"r":60, "g":20, "b":0}}
```


#### Set overall brightness
```
GET /arduino/brightness/150
Host: localhost:3000
```


#### Set offset / max visible LEDs
```
POST /arduino/defaults
Host: localhost:3000
Content-Type: application/json

{"offset":13, "maxleds":60}
```