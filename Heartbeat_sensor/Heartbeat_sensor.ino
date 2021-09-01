int const PULSE_SENSOR_PIN = 0;   // 'S' Signal pin connected to A0.
int const LED = 13;               // The on-board Arduino LED, close to pin 13.

int maxHeartRate = 220;           // The maximum heartrate to measure anything more than that is a sensory fault.
int UpperThreshold = 550;         // Upper threshold start of heart beat peak should measured.
int LowerThreshold = 550;         // Low threshold wich value indicates the end of the heart beat peak.
int sensorValue = 0;              // Contains the current sensorValue.
float BPM = 0.0;                  // Contains incoming beats per minute from the pulseSensor.

bool IgnoreReading = false;
bool FirstPulseDetected = false;
unsigned long FirstPulseTime = 0;
unsigned long SecondPulseTime = 0;
unsigned long PulseInterval = 0;


// Setup function prepares the arduino.
void setup() {
  Serial.begin(9600);           // Set comm speed for serial communication by default baudrate = 9600.
}

// Main loop.
void loop() {
  sensorValue = analogRead(PULSE_SENSOR_PIN);
  
     // Heart beat leading edge detected.
     if(sensorValue > UpperThreshold && IgnoreReading == false){
     if(FirstPulseDetected == false){
       FirstPulseTime = millis();
       FirstPulseDetected = true;
     }
     else{
       SecondPulseTime = millis();
       PulseInterval = SecondPulseTime - FirstPulseTime;
       FirstPulseTime = SecondPulseTime;
      }
     IgnoreReading = true;
     }

      // Heart beat trailing edge detected.
      if(sensorValue < LowerThreshold){
        IgnoreReading = false;
      }  

      // Calculate beats per minute.
      BPM = (1.0/PulseInterval) * 60.0 * 1000;

     if(BPM <= maxHeartRate){
       Serial.println(BPM);    
     }
     delay(20);
}
