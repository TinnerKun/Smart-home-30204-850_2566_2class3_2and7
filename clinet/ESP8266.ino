#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <DHT.h>
#include <ArduinoJson.h>

const char *ssid = "";
const char *password = "";
const char* serverUrl = "";

const int MQ2_PIN = A0;
const int FLAME_PIN = D1;
const int DHT_PIN = 2; // D4

DHT dht(DHT_PIN, DHT22);

void setup() {
  Serial.begin(9600);
  pinMode(FLAME_PIN, INPUT);
  dht.begin();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("WiFi connected - IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) return;

  std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
  client->setInsecure();
  HTTPClient https;

  // Read data from MQ2 gas sensor (analog value)
  int gasValue = analogRead(MQ2_PIN);
  Serial.print("Gas Value: ");
  Serial.println(gasValue);

  // Read data from Flame sensor (digital value)
  int flameValue = digitalRead(FLAME_PIN);
  Serial.print("Flame Value: ");
  Serial.println(flameValue);

  // Read data from DHT22 sensor
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print(" °C, Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");

  // Prepare JSON data
  StaticJsonDocument<200> jsonDoc;
  jsonDoc["gas_value"] = gasValue;
  jsonDoc["flame_value"] = flameValue;
  jsonDoc["temperature"] = temperature;
  jsonDoc["humidity"] = humidity;

  String jsonString;
  serializeJson(jsonDoc, jsonString);

  // Perform HTTP POST request
  https.begin(*client, serverUrl);
  https.addHeader("Content-Type", "application/json");
  int httpCode = https.POST(jsonString);

  Serial.print("HTTP Response code: ");
  Serial.println(httpCode);

  if (httpCode > 0) {
    String response = https.getString();
    Serial.println("Response: " + response);
  } else {
    Serial.println("Error on HTTP request");
  }

  https.end();
  delay(1000);
}
