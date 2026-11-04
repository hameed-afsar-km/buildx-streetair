# STREETAIR — Hardware Ingestion Protocol (ESP32 & MQTT)

This protocol specifies the communication format, authentication handshake, and data exchange conventions between physical ESP32 monitoring devices, the software simulator, and the STREETAIR backend.

---

## 1. Physical Hardware Specification

- **Microcontroller**: ESP32 DevKit v1 (Wi-Fi 802.11 b/g/n, 2.4 GHz).
- **Interface**:
  - 16x2 I2C Character LCD / 0.96" OLED display.
  - 4x4 matrix keypad or 3x3 scenario selection keys (1 to 9).
- **Sensors (Future / Real Hardware Mode)**:
  - PMS5003 / SDS011 Laser Particulate Sensor (PM1.0, PM2.5, PM10 via UART).
  - BME280 / DHT22 (Temperature, Relative Humidity, Barometric Pressure via I2C).
  - MQ-135 Gas Sensor (Analog ADC pin 34/35 — strictly labelled as un-calibrated raw ADC output).

---

## 2. Ingestion Paths

The backend provides two ingestion adapters that map to the identical canonical validation and persistence pipeline:

1. **HTTPS POST Ingestion (Initial / Demonstration Mode)**:
   - Endpoint: `POST https://<backend-host>/api/v1/ingest`
   - Content-Type: `application/json`
2. **MQTT Broker Ingestion (Future Hardware Deployment)**:
   - Broker Topic: `streetair/readings/{station_id}/readings`
   - Quality of Service: QoS 1 (At least once delivery)

---

## 3. Device Authentication & Handshake

To protect backend resources without requiring heavy TLS client certificates or exposing Firebase Admin tokens to hardware:

1. **Provisioning**: The device is provisioned via the admin route `POST /api/v1/devices/provision`. A unique `device_id` and shared secret key are generated.
2. **Per-Request Headers**:
   - `X-Device-ID`: e.g. `DEV-ESP32-CRESCENT`
   - `X-Device-Token`: HMAC-SHA256 hex string computed as:
     ```
     HMAC_SHA256(key = DEVICE_AUTH_SECRET, message = device_id)
     ```
3. **Replay & Skew Guards**: The backend rejects readings with timestamps skewed > 300s in the future or > 24 hours in the past.

---

## 4. Nine Demonstration Simulation Scenarios

Keypad keys 1–9 select one of the demonstration scenarios:

| Key | Scenario ID | Description |
|-----|-------------|-------------|
| 1 | `normal` | Campus baseline air quality |
| 2 | `traffic_congestion` | Highway / rush-hour traffic particulate spike |
| 3 | `construction_dust` | Campus construction coarse dust |
| 4 | `industrial_emissions` | Industrial plume dispersion |
| 5 | `waste_burning` | Heavy smoke and incomplete combustion |
| 6 | `high_humidity` | High relative humidity / morning mist |
| 7 | `smoke_event` | Localized biomass / smoke event |
| 8 | `pollution_dispersal` | High wind dispersion |
| 9 | `extreme_pollution` | Winter / inversion severe air pollution |

