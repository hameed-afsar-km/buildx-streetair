/* =========================================================================
   STREETAIR — ESP32 Simulated Environmental Monitoring Station Firmware
   Platform: ESP32 DevKit V1 (ESP32-WROOM-32)
   Framework: Arduino IDE
   
   Application:
   - Connects to Wi-Fi & synchronizes time via NTP (UTC).
   - Generates simulated environmental readings for 9 pollution scenarios.
   - Accepts scenario selections and commands via a 4x4 matrix membrane keypad.
   - Displays real-time status and readings on a 16x2 I2C LCD.
   - Transmits JSON telemetry to the STREETAIR FastAPI backend via HTTP POST.
   - Automatically resends active scenario readings every 15 seconds.

   NOTE: All readings generated are simulated and labelled data_source="simulated".
   ========================================================================= */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Keypad.h>
#include <LiquidCrystal_I2C.h>
#include <time.h>

// =========================================================================
// 1. USER CONFIGURATION — REPLACE WITH YOUR ENVIRONMENT DETAILS
// =========================================================================

// Wi-Fi Network Credentials (replace with your 2.4GHz Wi-Fi credentials)
const char* WIFI_SSID     = "Hackathon-Hall-2";
const char* WIFI_PASSWORD = "123456789";

// Backend API URL
// NOTE: Use your laptop/server LAN IP (e.g. 192.168.1.100). Do NOT use localhost.
const char* API_URL       = "http://192.168.1.100:8000/api/v1/ingest";

// Device and Station Identifiers
const char* DEVICE_ID     = "ST-001-DEVICE";
const char* STATION_ID    = "ST-001";

// Authentication Key (adjust header in sendData() to match FastAPI auth format)
const char* DEVICE_API_KEY = "streetair_secret_dev_key_2026";

// LCD I2C Address: 0x27 (PCF8574T) or 0x3F (PCF8574AT)
const uint8_t LCD_I2C_ADDR = 0x27;

// Automatic transmission interval in milliseconds (15 seconds)
const unsigned long SEND_INTERVAL_MS = 15000;

// NTP Server Settings (UTC standard time, no daylight offset)
const char* NTP_SERVER_PRIMARY   = "pool.ntp.org";
const char* NTP_SERVER_SECONDARY = "time.nist.gov";
const long  GMT_OFFSET_SEC       = 0;
const int   DAYLIGHT_OFFSET_SEC  = 0;

// =========================================================================
// 2. HARDWARE PIN DEFINITIONS (Single-side accessible GPIOs)
// =========================================================================

// 4x4 Matrix Keypad Configuration
const byte ROWS = 4;
const byte COLS = 4;

char keys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};

// Keypad GPIO Connections:
// Row 1 -> GPIO 23, Row 2 -> GPIO 19, Row 3 -> GPIO 18, Row 4 -> GPIO 17
byte rowPins[ROWS] = {23, 19, 18, 17};

// Col 1 -> GPIO 16, Col 2 -> GPIO 4, Col 3 -> GPIO 5, Col 4 -> GPIO 2
// CAUTION: GPIO 2 and GPIO 5 are strapping pins. Do NOT hold keypad keys down during boot!
byte colPins[COLS] = {16, 4, 5, 2};

// LCD Hardware I2C Pins: SDA -> GPIO 21, SCL -> GPIO 22
const uint8_t PIN_SDA = 21;
const uint8_t PIN_SCL = 22;

// =========================================================================
// 3. HARDWARE OBJECT INITIALIZATION
// =========================================================================

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
LiquidCrystal_I2C lcd(LCD_I2C_ADDR, 16, 2);

// =========================================================================
// 4. DATA STRUCTURES & 9 SIMULATED SCENARIOS
// =========================================================================

struct Scenario {
  const char* id;          // API slug
  const char* shortName;   // Formatted for 16x2 LCD Line 0 (e.g. "Normal Air")
  int         pm1;         // ug/m3
  int         pm25;        // ug/m3
  int         pm10;        // ug/m3
  int         mq135Raw;    // Raw ADC analog value (demonstration only)
  int         temperature; // deg C
  int         humidity;    // %
  int         pressure;    // hPa
};

// 9 Illustrative Demonstration Scenarios
// NOTE: These are simulated demonstration values, not calibrated sensor data.
const Scenario scenarios[9] = {
  { "normal",        "Normal Air",      8,  18,  28,  450, 29, 55, 1008 }, // Key 1
  { "traffic",       "Traffic Cong.",  22,  65, 110, 1100, 32, 48, 1007 }, // Key 2
  { "construction",  "Construction",   45, 105, 220, 1350, 34, 40, 1006 }, // Key 3
  { "industrial",    "Industrial Em.", 38, 125, 190, 1800, 36, 42, 1005 }, // Key 4
  { "waste_burning", "Waste Burning",  55, 180, 260, 2400, 37, 38, 1004 }, // Key 5
  { "high_humidity", "High Humidity",  12,  35,  55,  700, 28, 92, 1009 }, // Key 6
  { "smoke",         "Smoke Event",    70, 220, 310, 2800, 38, 35, 1003 }, // Key 7
  { "dispersal",     "Dispersal",      15,  30,  48,  650, 30, 52, 1008 }, // Key 8
  { "extreme",       "Extreme Poll.", 100, 300, 450, 3500, 40, 30, 1002 }  // Key 9
};

// =========================================================================
// 5. GLOBAL STATE VARIABLES
// =========================================================================

int           selectedScenarioIndex = 0;       // Default: 0 ("normal")
bool          scenarioActive        = true;
unsigned long lastSendTimestamp     = 0;
unsigned long lastWiFiRetryTime     = 0;
const unsigned long WIFI_RETRY_MS   = 10000;
bool          isTransmitting        = false;

// Non-blocking LCD message timer
unsigned long lcdMessageHoldUntil   = 0;
bool          isTemporaryMessage    = false;

// =========================================================================
// 6. LCD UTILITY FUNCTIONS (Flicker-Free Overwrites)
// =========================================================================

// Overwrites a 16-character line with trailing padding to avoid lcd.clear() flicker
void writeLcdLine(byte row, const String& text) {
  String buffer = text;
  if (buffer.length() > 16) {
    buffer = buffer.substring(0, 16);
  }
  while (buffer.length() < 16) {
    buffer += ' ';
  }
  lcd.setCursor(0, row);
  lcd.print(buffer);
}

// Displays the current scenario, scenario number, and simulated PM2.5 on LCD
void renderCurrentScenario() {
  if (isTemporaryMessage && millis() < lcdMessageHoldUntil) {
    return; // Hold temporary status message
  }
  isTemporaryMessage = false;

  const Scenario& s = scenarios[selectedScenarioIndex];
  
  // Line 0: S<num>: <Name> (e.g. "S1: Normal Air")
  String line0 = "S" + String(selectedScenarioIndex + 1) + ": " + String(s.shortName);
  
  // Line 1: Simulated PM2.5 and temperature
  String line1 = "PM:" + String(s.pm25) + " T:" + String(s.temperature) + "C [SIM]";
  
  writeLcdLine(0, line0);
  writeLcdLine(1, line1);
}

// Displays a temporary status message without blocking system operation
void renderStatusMessage(const String& line0, const String& line1, unsigned long holdDurationMs = 1500) {
  writeLcdLine(0, line0);
  writeLcdLine(1, line1);
  lcdMessageHoldUntil = millis() + holdDurationMs;
  isTemporaryMessage = true;
}

// =========================================================================
// 7. TIME & NTP SYNCHRONIZATION
// =========================================================================

// Returns ISO 8601 UTC timestamp string: "YYYY-MM-DDTHH:MM:SSZ"
// Returns empty string if clock is not yet synchronized.
String getUtcIsoTimestamp() {
  time_t now = time(nullptr);
  
  // ESP32 clock defaults to Jan 1 1970; reject any timestamp prior to Nov 2023
  if (now < 1700000000) {
    return "";
  }
  
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  
  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buf);
}

// =========================================================================
// 8. WI-FI MANAGEMENT
// =========================================================================

void initializeWiFi() {
  Serial.print(F("[WiFi] Connecting to: "));
  Serial.println(WIFI_SSID);
  
  writeLcdLine(0, "Connecting WiFi");
  writeLcdLine(1, String(WIFI_SSID).substring(0, 16));

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - startAttempt < 12000)) {
    delay(250);
    Serial.print('.');
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(F("[WiFi] Connected! IP: "));
    Serial.println(WiFi.localIP());

    writeLcdLine(0, "WiFi Connected");
    writeLcdLine(1, WiFi.localIP().toString());
    delay(1000);

    // Initialize NTP time sync in UTC
    Serial.println(F("[NTP] Initializing time synchronization (pool.ntp.org)..."));
    configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER_PRIMARY, NTP_SERVER_SECONDARY);
  } else {
    Serial.println(F("[WiFi] Connection failed. Will retry in background."));
    writeLcdLine(0, "WiFi Failed");
    writeLcdLine(1, "Press * to retry");
    delay(1200);
  }
}

// Non-blocking background Wi-Fi reconnect check
void maintainWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED && (millis() - lastWiFiRetryTime >= WIFI_RETRY_MS)) {
    lastWiFiRetryTime = millis();
    Serial.println(F("[WiFi] Reconnecting in background..."));
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }
}

// =========================================================================
// 9. JSON PAYLOAD GENERATION & HTTP TELEMETRY TRANSMISSION
// =========================================================================

// Builds strict JSON payload adhering to the STREETAIR ingestion contract
String buildJsonPayload() {
  const Scenario& s = scenarios[selectedScenarioIndex];
  String timestamp = getUtcIsoTimestamp();

  if (timestamp.length() == 0) {
    return ""; // Time synchronization required before transmission
  }

  // Exact contract format:
  // {
  //   "device_id": "ST-001-DEVICE",
  //   "station_id": "ST-001",
  //   "timestamp": "2026-11-04T16:57:00Z",
  //   "data_source": "simulated",
  //   "scenario_id": "normal",
  //   "readings": {
  //     "pm1": 8,
  //     "pm25": 18,
  //     "pm10": 28,
  //     "mq135_raw": 450,
  //     "temperature": 29,
  //     "humidity": 55,
  //     "pressure": 1008
  //   }
  // }

  String json = "{";
  json += "\"device_id\":\""   + String(DEVICE_ID)  + "\",";
  json += "\"station_id\":\""  + String(STATION_ID) + "\",";
  json += "\"timestamp\":\""   + timestamp          + "\",";
  json += "\"data_source\":\"simulated\",";
  json += "\"scenario_id\":\"" + String(s.id)       + "\",";
  json += "\"readings\":{";
  json += "\"pm1\":"         + String(s.pm1)         + ",";
  json += "\"pm25\":"        + String(s.pm25)        + ",";
  json += "\"pm10\":"        + String(s.pm10)        + ",";
  json += "\"mq135_raw\":"   + String(s.mq135Raw)    + ",";
  json += "\"temperature\":" + String(s.temperature) + ",";
  json += "\"humidity\":"    + String(s.humidity)    + ",";
  json += "\"pressure\":"    + String(s.pressure);
  json += "}}";

  return json;
}

// Transmits readings via HTTP POST to the backend
void transmitScenarioData() {
  if (isTransmitting) return;
  isTransmitting = true;

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[HTTP] Transmission aborted: WiFi offline"));
    renderStatusMessage("WiFi Offline", "Data not sent", 1500);
    isTransmitting = false;
    return;
  }

  String payload = buildJsonPayload();
  if (payload.length() == 0) {
    Serial.println(F("[HTTP] Transmission aborted: UTC time not synchronized yet"));
    renderStatusMessage("Time Not Ready", "Syncing NTP...", 1500);
    isTransmitting = false;
    return;
  }

  const Scenario& s = scenarios[selectedScenarioIndex];
  Serial.println(F("--------------------------------------------------"));
  Serial.print(F("[HTTP] Transmitting Scenario ["));
  Serial.print(selectedScenarioIndex + 1);
  Serial.print(F("] "));
  Serial.println(s.id);
  Serial.print(F("[HTTP] POST URL: "));
  Serial.println(API_URL);
  Serial.print(F("[HTTP] Payload: "));
  Serial.println(payload);

  writeLcdLine(0, "Sending S" + String(selectedScenarioIndex + 1) + " Data");
  writeLcdLine(1, String(s.id).substring(0, 16));

  HTTPClient http;
  http.setConnectTimeout(4000); // 4 seconds connect timeout
  http.setTimeout(7000);        // 7 seconds data timeout

  if (!http.begin(API_URL)) {
    Serial.println(F("[HTTP] Failed to parse API URL"));
    renderStatusMessage("HTTP Error", "Invalid URL", 1500);
    isTransmitting = false;
    return;
  }

  http.addHeader("Content-Type", "application/json");
  // Device authentication header (matches FastAPI backend contract)
  http.addHeader("X-Device-Key", DEVICE_API_KEY);

  int httpCode = http.POST(payload);

  Serial.print(F("[HTTP] Response code: "));
  Serial.println(httpCode);

  if (httpCode > 0) {
    String responseBody = http.getString();
    Serial.print(F("[HTTP] Response body: "));
    Serial.println(responseBody);

    if (httpCode >= 200 && httpCode < 300) {
      renderStatusMessage("Data Sent OK", "HTTP " + String(httpCode), 1200);
    } else {
      renderStatusMessage("Backend Error", "HTTP " + String(httpCode), 1500);
    }
  } else {
    String errStr = http.errorToString(httpCode);
    Serial.print(F("[HTTP] Connection failed: "));
    Serial.println(errStr);
    renderStatusMessage("Connect Error", errStr.substring(0, 16), 1500);
  }

  http.end();
  isTransmitting = false;
  lastSendTimestamp = millis();
}

// =========================================================================
// 10. KEYPAD INPUT HANDLER
// =========================================================================

void handleKeypadInput(char key) {
  Serial.print(F("[Keypad] Key pressed: '"));
  Serial.print(key);
  Serial.println(F("'"));

  // Keys 1 to 9: Select scenario and immediately transmit
  if (key >= '1' && key <= '9') {
    selectedScenarioIndex = key - '1';
    scenarioActive = true;
    
    Serial.print(F("[Keypad] Selected scenario: "));
    Serial.println(scenarios[selectedScenarioIndex].id);

    renderCurrentScenario();
    transmitScenarioData();
  }
  // Key 0: Resend currently active scenario
  else if (key == '0') {
    Serial.println(F("[Keypad] Resending active scenario"));
    transmitScenarioData();
  }
  // Key *: Force Wi-Fi Reconnect & NTP resync
  else if (key == '*') {
    Serial.println(F("[Keypad] Reconnect Wi-Fi requested"));
    initializeWiFi();
    renderCurrentScenario();
  }
  // Key #: Display Wi-Fi status and IP address
  else if (key == '#') {
    Serial.println(F("[Keypad] Wi-Fi status check"));
    if (WiFi.status() == WL_CONNECTED) {
      renderStatusMessage("WiFi: Connected", WiFi.localIP().toString(), 2500);
    } else {
      renderStatusMessage("WiFi: Offline", "Press * to reconnect", 2500);
    }
  }
}

// =========================================================================
// 11. ARDUINO SETUP
// =========================================================================

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n=========================================="));
  Serial.println(F("STREETAIR ESP32 Monitoring Station Starting"));
  Serial.println(F("=========================================="));

  // 1. Initialize I2C Bus for LCD
  Wire.begin(PIN_SDA, PIN_SCL);
  lcd.init();
  lcd.backlight();

  // 2. Configure Keypad Debounce
  keypad.setDebounceTime(50); // 50ms software debounce prevents key bounce

  // 3. Display Startup Splash
  writeLcdLine(0, "STREETAIR");
  writeLcdLine(1, "Starting up...");
  delay(1200);

  // 4. Connect to Wi-Fi & Start NTP
  initializeWiFi();

  // 5. Allow NTP up to 6 seconds to acquire initial time synchronization
  if (WiFi.status() == WL_CONNECTED) {
    writeLcdLine(0, "Syncing NTP...");
    writeLcdLine(1, "UTC Clock");
    unsigned long ntpStart = millis();
    while (getUtcIsoTimestamp().length() == 0 && (millis() - ntpStart < 6000)) {
      delay(250);
      Serial.print('.');
    }
    Serial.println();
  }

  // 6. Set Default Scenario to Normal Air (Key 1)
  selectedScenarioIndex = 0;
  scenarioActive = true;
  renderCurrentScenario();

  // 7. Initial Telemetry Transmission
  transmitScenarioData();
  lastSendTimestamp = millis();
}

// =========================================================================
// 12. ARDUINO MAIN LOOP (Non-Blocking)
// =========================================================================

void loop() {
  // A. Process Keypad Events
  char key = keypad.getKey();
  if (key) {
    handleKeypadInput(key);
  }

  // B. Restore Scenario Display if temporary status message timer expired
  if (isTemporaryMessage && millis() >= lcdMessageHoldUntil) {
    isTemporaryMessage = false;
    renderCurrentScenario();
  }

  // C. Background Wi-Fi Reconnection Check
  maintainWiFiConnection();

  // D. Automatic Periodic Transmission (every 15 seconds)
  if (scenarioActive && (millis() - lastSendTimestamp >= SEND_INTERVAL_MS)) {
    transmitScenarioData();
  }

  // Brief yield for RTOS task scheduling
  delay(10);
}
