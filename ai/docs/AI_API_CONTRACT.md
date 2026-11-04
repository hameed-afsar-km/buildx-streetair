# STREETAIR — AI Service Internal API Contract
**Version:** 1.0.0  
**Status:** Authoritative Specification  
**Service:** `streetair-ai` (Port: 8001)  
**Consumer:** Main Central Backend (FastAPI / Firebase Auth / Firestore)

---

## 1. Architectural Boundaries & Security

1. **Internal Service-to-Service Only:**  
   The AI service does **not** face the public internet or accept requests directly from the frontend. All incoming requests originate from the authenticated central backend.
2. **Authentication:**  
   Every request must include the header:
   ```http
   Authorization: Bearer <AI_INTERNAL_API_KEY>
   ```
   Unauthenticated calls return `HTTP 401 Unauthorized`. Invalid keys return `HTTP 403 Forbidden`.
3. **Multi-Tenancy & Authorization:**  
   The AI service never authorizes users, roles, or organization claims. The backend must scope the records, station IDs, and conversation context before transmitting.
4. **Data Provenance Rules:**  
   - Every reading must retain its `data_source` (`simulated` or `hardware`).
   - Simulated data is never presented as verified empirical measurement.
   - Raw `mq135_raw` values are sensor ADC levels, never gas concentrations or AQI inputs.

---

## 2. Shared Error Format

All error responses return `application/json` with the schema:

```json
{
  "request_id": "c1f0d481-9b43-4f9e-9d8a-6b8c9d1a2b3c",
  "timestamp": "2026-11-04T12:00:00Z",
  "status_code": 422,
  "error_code": "VALIDATION_ERROR",
  "message": "Request body validation failed",
  "details": []
}
```

Standard error codes:
- `VALIDATION_ERROR` (422)
- `INTERNAL_SCHEMA_ERROR` (500)
- `GROQ_PROVIDER_ERROR` (502)
- `OLLAMA_PROVIDER_ERROR` (502)
- `INSUFFICIENT_DATA` (400)
- `UNSUPPORTED_SCENARIO` (400)
- `TENANT_ISOLATION` (403)

---

## 3. Endpoints Specification

### 3.1. Health & Liveness
- **`GET /internal/v1/health`**
  - **Auth:** None (Liveness probe)
  - **Response 200:**
    ```json
    {
      "status": "healthy",
      "service": "streetair-ai",
      "version": "1.0.0",
      "environment": "development",
      "timestamp": 1793798400.0
    }
    ```

- **`GET /internal/v1/readiness`**
  - **Auth:** Required
  - **Response 200:** Returns provider connectivity statuses and vector store health.

---

### 3.2. Conversational Assistant
- **`POST /internal/v1/chat`**
  - **Description:** Grounded conversational air-quality assistant with intent routing, internal station data injection, RAG retrieval, and Tavily search citations.
  - **Request Body (`ChatRequest`):**
    ```json
    {
      "org_id": "org_chennai_central",
      "user_id": "usr_99812",
      "provider_preference": "groq",
      "messages": [
        {"role": "user", "content": "What is the latest PM2.5 level at Station ST-001 and what does it mean under CPCB rules?"}
      ],
      "station_context": {
        "station_id": "ST-001",
        "station_name": "Anna Salai Sensor Node",
        "data_source": "simulated",
        "readings": [
          {
            "device_id": "ESP32-DEV-01",
            "station_id": "ST-001",
            "timestamp": "2026-11-04T10:00:00Z",
            "data_source": "simulated",
            "pm25": 78.4,
            "pm10": 135.2,
            "temperature": 31.0,
            "humidity": 65.0,
            "mq135_raw": 1280
          }
        ]
      },
      "enable_web_search": false,
      "enable_rag": true
    }
    ```
  - **Response Body (`ChatResponse`):**
    ```json
    {
      "metadata": {
        "request_id": "uuid",
        "generated_at": "2026-11-04T10:00:01Z",
        "service_version": "1.0.0",
        "warnings": []
      },
      "answer": "At station ST-001, the latest recorded PM2.5 reading is 78.4 µg/m³ (simulated data). Under CPCB National AQI breakpoints, PM2.5 in the range of 61–90 µg/m³ corresponds to the 'Moderate' category.",
      "evidence_items": [
        {
          "evidence_type": "measurement",
          "summary": "1 readings from station ST-001",
          "source_label": "STREETAIR Station ST-001",
          "data_source": "simulated",
          "timestamp": "2026-11-04T10:00:00Z"
        }
      ],
      "rag_citations": [
        {
          "document_id": "doc_cpcb_01",
          "document_title": "CPCB NAQI Guidelines",
          "chunk_id": "chunk_2",
          "section": "AQI Categories and Health Impact Breakpoints"
        }
      ],
      "data_source_types": ["simulated"],
      "warnings": {
        "contains_simulated_data": true,
        "mq135_raw_not_calibrated": true
      },
      "provider": {
        "provider": "groq",
        "model": "llama-3.3-70b-versatile",
        "latency_ms": 420.5
      }
    }
    ```

---

### 3.3. Pollutant Forecasting
- **`POST /internal/v1/forecast`**
  - **Description:** Generates statistical pollutant forecast with holdout validation metrics and uncertainty intervals.
  - **Request Body (`ForecastRequest`):**
    ```json
    {
      "org_id": "org_chennai",
      "station_id": "ST-001",
      "target_variable": "pm25",
      "horizon_hours": 24,
      "readings": [ /* min 10 SensorReading objects */ ]
    }
    ```
  - **Response Body (`ForecastResponse`):**
    Returns `forecast_points` array with `timestamp`, `predicted_value`, `lower_bound`, `upper_bound`, `confidence_level`, and `evaluation` (MAE/RMSE).

---

### 3.4. Anomaly Detection
- **`POST /internal/v1/anomaly-detection`**
  - **Description:** Detects Z-score spikes, IQR outliers, and sensor flatlining.
  - **Request Body (`AnomalyDetectionRequest`):**
    ```json
    {
      "org_id": "org_chennai",
      "station_id": "ST-001",
      "readings": [ /* SensorReading array */ ],
      "target_variables": ["pm25", "pm10"]
    }
    ```
  - **Response Body (`AnomalyDetectionResponse`):**
    Returns `anomalies` list with `anomaly_id`, `is_data_quality_issue` (true for flatlines/sensor faults), `severity`, and `explanation`.

---

### 3.5. Spatial Hotspot Analysis
- **`POST /internal/v1/hotspots`**
  - **Description:** Evaluates spatial monitoring density and clusters elevated stations using Haversine distance clustering.
  - **Request Body (`HotspotRequest`):**
    ```json
    {
      "org_id": "org_chennai",
      "target_variable": "pm25",
      "percentile_threshold": 75.0,
      "readings": [ /* SensorReading objects with latitude & longitude */ ]
    }
    ```

---

### 3.6. What-If City Simulator
- **`POST /internal/v1/scenarios`**
  - **Description:** Deterministic mathematical scenario calculations.
  - **Supported Types:**
    - `traffic_reduction` (`reduction_percent`, `baseline_pm25`, `baseline_pm10`)
    - `construction_dust_control` (`control_effectiveness_percent`, `baseline_pm10`)
    - `open_burning_reduction` (`reduction_percent`, `baseline_pm25`)
    - `additional_monitoring_stations` (`station_count`, `area_km2`, `existing_stations`)
  - **Response:**
    Returns `results`, `comparison`, `assumptions`, `limitations`, and `model` version.

---

### 3.7. Community Report Classification
- **`POST /internal/v1/report-classification`**
  - **Description:** Triages citizen complaint text into standardized environmental categories and detects duplicate candidates.
  - **Request Body (`ReportClassificationRequest`):**
    ```json
    {
      "org_id": "org_chennai",
      "reports": [
        {
          "report_id": "REP-101",
          "submitted_at": "2026-11-04T09:30:00Z",
          "text_description": "Heavy black smoke and burning plastic smell coming from the waste dump near Guindy.",
          "location_name": "Guindy Industrial Area"
        }
      ]
    }
    ```

---

### 3.8. Pollution Detective / Incident Investigation
- **`POST /internal/v1/investigate`**
  - **Description:** Multi-source incident investigation correlating telemetry, anomalies, reference stations, and community reports.
  - **Response:**
    Returns `supporting_evidence`, `contradicting_evidence`, `summary` narrative, and `next_steps`.

