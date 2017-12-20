#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h>
#endif

// arduino setup
#define PIN 6
#define STRIP_LENGTH 60
#define BAUD 128000

// command storing
#define COMMAND_LENGTH 7

int incByte;
int commandID;
int inData[COMMAND_LENGTH];   

// variables based on setup
// call /arduino/defaults to modify
int ledOffset = 13;
int maxLEDs = 60; 
int defaultBrightness = 80;
int defaultR = 0;
int defaultG = 0;
int defaultB = 10;

// method pointing
void (*func_ptr[4])();

Adafruit_NeoPixel strip = Adafruit_NeoPixel(STRIP_LENGTH, PIN, NEO_GRB + NEO_KHZ800);

void setup() {
  Serial.begin(BAUD);

  func_ptr[0] = setDefaults;
  func_ptr[1] = setRGB;
  func_ptr[2] = setIlluminance;

  for(int i = 0; i< COMMAND_LENGTH; i++)
  {
    inData[i] = 0;
  }

  incByte = 0;

  // artificial safety-net
  delay(100);

  while (Serial.available() > 0) {
    Serial.read();
  }

  strip.begin();
  strip.setBrightness(defaultBrightness);
  setDefaultAmbient();
}

void loop()
{
  readStream();
}

void readStream() {
  if (Serial.available()>0) {
    char c = Serial.read();
    inData[incByte] = c;
    incByte++;
    if (incByte == COMMAND_LENGTH-1) {
      checkCommandID(inData[0]);

      while (Serial.available()>0) {
        Serial.read();
      }
      
      incByte = 0;
    }
  }
}

void checkCommandID(char c) {
  commandID = int(c);
  runCommand();
}

void runCommand()
{
  (*func_ptr[commandID])();
}

void reset() {
  for (int c = 0; c < STRIP_LENGTH; c++) {
    strip.setPixelColor(c, 0, 0, 0);
  }
}

void setDefaults() {
  ledOffset = inData[1];
  maxLEDs = inData[2];
  
  setDefaultAmbient();
}

void setDefaultAmbient()
{
  reset();
  
  for (int c = ledOffset; c < maxLEDs; c++) {
    strip.setPixelColor(c, defaultR, defaultG, defaultB);
  }
  
  strip.show();
}

void setRGB()
{
  int startPixel = inData[1] + ledOffset;
  int endPixel = inData[2] < STRIP_LENGTH ? inData[2] : STRIP_LENGTH;
  endPixel += ledOffset;

  int r = inData[3];
  int g = inData[4];
  int b = inData[5];
  
  for (int c = startPixel; c < endPixel; c++) {
    strip.setPixelColor(c, inData[3], inData[4], inData[5]);
  }

  strip.show();
}

void setIlluminance() {
  int brightness = inData[1];
  strip.setBrightness(brightness);
  strip.show();
}




