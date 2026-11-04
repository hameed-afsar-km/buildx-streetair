# STREETAIR — Proposed API Contract & Integration Specification
**Status:** PROPOSED & FRONTEND INTEGRATED (Awaiting Backend Sign-Off)  
**Version:** 1.0.0-draft  
**Last Updated:** November 2026  
**Primary Demonstration Site:** B.S. Abdur Rahman Crescent Institute of Science and Technology, Vandalur, Tamil Nadu, India (`crescent-vandalur-01`)  
**Backend Architecture:** FastAPI + Firebase Auth + Firebase/Firestore & Timeseries Ingestion

---

## 1. Global Conventions & Architecture

### Base URL
- Local Development: `http://localhost:8000`
- Production / Staging: `https://api.streetair.io` (or cloud run / VM URL configured in `NEXT_PUBLIC_API_BASE_URL`)

### Authentication & Authorization
- Client uses **Firebase Authentication SDK** (Google OAuth / Email-Password) to authenticate.
- Frontend includes the Firebase ID Token in HTTP requests as:
  ```http
  Authorization: Bearer <FIREBASE_ID_TOKEN>
  ```
- Backend decodes and verifies the token using the Firebase Admin SDK, attaching user claims:
  - `uid`: string (Unique User ID)
  - `email`: string
  - `role`: `"citizen" | "analyst" | "org_admin" | "platform_admin"`
  - `org_id`: string | null (Multi-tenant isolation)

### Standard Response Envelope & Error Format
All endpoints return standard JSON envelopes.

#### Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2026-11-04T12:00:00Z",
    "version": "v1",
    "request_id": "req_abc123"
  }
}
```

#### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "The requested monitoring station does not exist.",
    "details": null
  },
  "metadata": {
    "timestamp": "2026-11-04T12:00:00Z",
    "request_id": "req_err456"
  }
}
```

Standard HTTP status codes:
- `200 OK`, `201 Created`
- `400 Bad Request` (Validation errors)
- `401 Unauthorized` (Missing or invalid Bearer token)
- `403 Forbidden` (Insufficient role/entitlements)
- `404 Not Found`
- `429 Too Many Requests` (Rate limit)
- `500 Internal Server Error`

---

## 2. Data Source & Status Taxonomy

Every reading, station, and intelligence output MUST carry clear origin metadata:
- **`source`**:
  - `"HARDWARE"`: Direct physical sensor telemetry (e.g., physical ESP32 + MQ-135/PMS5003).
  - `"SIMULATED"`: ESP32 or server-side simulation injector running one of the 9 scenarios.
  - `"DEMONSTRATION"`: Hackathon demonstration preset.
- **`data_status`**:
  - `"LIVE"`: Telemetry received within the last 120 seconds.
  - `"STALE"`: Telemetry older than 120 seconds without disconnect signal.
  - `"HISTORICAL"`: Retrieved from time-series storage.
  - `"FORECAST"`: Predictive model output from the AI engine.

### 9 Planned Demonstration Scenarios (ESP32 Keypad & Ingestion)
1. `scenario_1_normal`: Normal ambient coastal air quality (AQI 32, Good).
2. `scenario_2_traffic`: GST Road traffic congestion spike (AQI 168, Unhealthy, NO2 + PM2.5).
3. `scenario_3_construction`: Construction dust event (AQI 142, PM10 spike ~185 µg/m³).
4. `scenario_4_industrial`: Maraimalai Nagar / SIPCOT industrial emissions (AQI 235, SO2 + VOC).
5. `scenario_5_waste_burning`: Open plastic/biomass burning plume (AQI 310, Hazardous, PM2.5/PM10).
6. `scenario_6_humidity`: High morning humidity hygroscopic aerosol effect (AQI 72, Moderate).
7. `scenario_7_smoke`: Localized smoke/combustion event (AQI 265, Very Unhealthy, CO spike).
8. `scenario_8_dispersal`: Sea breeze or precipitation dispersal transition (AQI drops to 48).
9. `scenario_9_extreme`: Severe inversion episode (AQI 440, Hazardous, multi-pollutant accumulation).

---

## 3. REST Endpoints Specification

### 3.1 Authentication & Profile
- **`GET /api/v1/auth/me`**
  - Headers: `Authorization: Bearer <token>`
  - Response `data`:
    ```json
    {
      "uid": "usr_crescent_01",
      "email": "dr.ahmed@crescent.education",
      "display_name": "Dr. K. Ahmed",
      "role": "org_admin",
      "org_id": "org_crescent_institute",
      "org_name": "B.S. Abdur Rahman Crescent Institute",
      "plan": "enterprise",
      "created_at": "2026-01-15T09:00:00Z"
    }
    ```

### 3.2 Devices & Stations
- **`GET /api/v1/devices`**
  - Query Params:
    - `status`: `"online" | "offline" | "calibrating" | "all"` (optional)
    - `org_id`: string (optional, for tenant filtering)
  - Response `data`: Array of Station objects:
    ```json
    [
      {
        "id": "crescent-vandalur-01",
        "name": "Crescent Institute Campus Beacon",
        "location_name": "Vandalur, Chennai South, Tamil Nadu",
        "coordinates": { "lat": 12.8797, "lng": 80.0833 },
        "status": "online",
        "source": "SIMULATED",
        "scenario_active": "scenario_1_normal",
        "is_hardware_connected": false,
        "last_seen": "2026-11-04T12:00:00Z",
        "aqi": 34,
        "category": "Good",
        "dominant_pollutant": "PM2.5",
        "firmware_version": "esp32-v2.1.0-sim"
      }
    ]
    ```
- **`GET /api/v1/devices/{device_id}`**
  - Returns detailed station metadata, sensor health, and installation specs.

### 3.3 Readings
- **`GET /api/v1/readings/latest`**
  - Query Params:
    - `device_id`: string (optional, defaults to primary `crescent-vandalur-01`)
  - Response `data`:
    ```json
    {
      "reading_id": "rdg_991823",
      "device_id": "crescent-vandalur-01",
      "timestamp": "2026-11-04T12:01:30Z",
      "source": "SIMULATED",
      "data_status": "LIVE",
      "scenario": "scenario_1_normal",
      "aqi": 34,
      "category": "Good",
      "pollutants": {
        "pm25": { "value": 11.4, "unit": "µg/m³", "sub_index": 34 },
        "pm10": { "value": 24.2, "unit": "µg/m³", "sub_index": 24 },
        "no2": { "value": 14.8, "unit": "ppb", "sub_index": 18 },
        "so2": { "value": 4.1, "unit": "ppb", "sub_index": 8 },
        "co": { "value": 0.42, "unit": "ppm", "sub_index": 12 },
        "o3": { "value": 21.0, "unit": "ppb", "sub_index": 21 },
        "voc": { "value": 68.0, "unit": "ppb", "sub_index": null }
      },
      "weather": {
        "temperature": 29.5,
        "humidity": 68.0,
        "wind_speed": 14.2,
        "wind_direction": "ESE",
        "pressure": 1011.2
      }
    }
    ```
- **`GET /api/v1/readings/history`**
  - Query Params:
    - `device_id`: string (required)
    - `start_time`: ISO string (required)
    - `end_time`: ISO string (required)
    - `resolution`: `"1m" | "5m" | "1h" | "1d"` (default `"1h"`)
  - Response `data`: Array of timestamped reading points.

### 3.4 Alerts & Incidents
- **`GET /api/v1/alerts`**
  - Query Params:
    - `active_only`: boolean (default `true`)
    - `severity`: `"low" | "moderate" | "high" | "critical"`
  - Response `data`: List of alerts (e.g. "PM2.5 threshold exceeded at Vandalur Station").
- **`GET /api/v1/incidents`**
  - Response `data`: List of detected pollution incidents, linked anomalies, root-cause hypotheses, and resolution status (`detected`, `investigating`, `confirmed`, `resolved`).

### 3.5 Community Reports
- **`POST /api/v1/reports`**
  - Headers: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "category": "waste_burning" | "traffic_congestion" | "construction_dust" | "industrial_emissions" | "smoke" | "odour" | "other",
      "location": {
        "lat": 12.8795,
        "lng": 80.0830,
        "address": "Opposite Crescent College Gate 2"
      },
      "description": "Thick black smoke and pungent odor from open burning behind service road.",
      "image_url": "https://storage.googleapis.com/streetair-reports/rep_123.jpg" // optional
    }
    ```
  - Response `data`: Report confirmation with `report_id`, status `"submitted"`.
- **`GET /api/v1/reports`** (List user's reports or admin moderation list)
- **`GET /api/v1/reports/{report_id}`** (Track verification timeline)

### 3.6 Analytics & Intelligence
- **`GET /api/v1/analytics/overview`** (System metrics: avg AQI, compliance %, incident count)
- **`GET /api/v1/analytics/trends`** (Aggregated multi-pollutant trends)
- **`GET /api/v1/analytics/hotspots`** (Spatial clustering of high-AQI incidents in Chennai-Chengalpattu region)
- **`GET /api/v1/predictions`** (24h to 72h ahead Prophet / LSTM AQI forecast with uncertainty intervals)

### 3.7 AI Suite & Chat
- **`POST /api/v1/ai/chat`**
  - Body:
    ```json
    {
      "messages": [
        { "role": "user", "content": "Why did PM2.5 spike at Crescent station at 11 AM?" }
      ],
      "provider": "groq" | "ollama",
      "model": "llama-3.3-70b" | "llama-3-8b",
      "context": {
        "station_id": "crescent-vandalur-01",
        "include_rag": true,
        "include_web_search": true
      }
    }
    ```
  - Response `data`:
    ```json
    {
      "reply": "Analysis indicates a localized particulate spike consistent with traffic congestion and construction dust along GST Road...",
      "provider_used": "groq",
      "model_used": "llama-3.3-70b",
      "citations": [
        {
          "title": "CPCB National Ambient Air Quality Standards",
          "url": "https://cpcb.nic.in/air-quality-standards/",
          "source_type": "rag_document"
        },
        {
          "title": "Chennai Suburban Traffic Advisory — Vandalur Junction",
          "url": "https://news.example.com/chennai-traffic-vandalur",
          "source_type": "web_search"
        }
      ],
      "evidence": [
        {
          "type": "telemetry",
          "label": "Observed PM2.5: 84 µg/m³ (Baseline: 18 µg/m³)",
          "confidence": 0.94
        }
      ]
    }
    ```
- **`POST /api/v1/ai/scenarios`**
  - What-If simulator input: scenario parameters (e.g. `-30% traffic emissions`, `+20% green canopy`). Returns predicted AQI curve and impact delta.

### 3.8 Plans, Subscriptions & Usage
- **`GET /api/v1/plans`** (Returns Starter, Professional, Enterprise tier specs)
- **`GET /api/v1/subscriptions/current`** (Returns active org subscription, billing cycle, renewal)
- **`GET /api/v1/usage`** (Returns quota usage: API calls, active stations, storage, AI queries)

---

## 4. WebSocket Protocol `/ws/v1/live`

- **Endpoint:** `ws://localhost:8000/ws/v1/live` (or `wss://api.streetair.io/ws/v1/live`)
- **Protocol:**
  1. Client connects.
  2. Client sends subscription message:
     ```json
     {
       "action": "subscribe",
       "device_id": "crescent-vandalur-01",
       "token": "<optional_firebase_token>"
     }
     ```
  3. Server sends heartbeat ping every 30 seconds:
     ```json
     { "type": "ping", "timestamp": "2026-11-04T12:00:30Z" }
     ```
     Client replies: `{ "type": "pong" }`
  4. Server broadcasts telemetry updates on each new reading:
     ```json
     {
       "type": "reading_update",
       "device_id": "crescent-vandalur-01",
       "reading": {
         "timestamp": "2026-11-04T12:01:00Z",
         "source": "SIMULATED",
         "data_status": "LIVE",
         "scenario": "scenario_2_traffic",
         "aqi": 168,
         "category": "Unhealthy",
         "pollutants": { "pm25": 88.4, "pm10": 132.0, "no2": 62.5 }
       }
     }
     ```
  5. Server broadcasts scenario change notifications:
     ```json
     {
       "type": "scenario_triggered",
       "device_id": "crescent-vandalur-01",
       "scenario_key": "scenario_2_traffic",
       "scenario_name": "Traffic Congestion",
       "simulated_by": "ESP32_KEYPAD_INPUT"
     }
     ```

