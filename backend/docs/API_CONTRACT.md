# STREETAIR — Public Backend API Contract (v1.0.0)

This document establishes the canonical public API contract implemented by the STREETAIR FastAPI backend. All frontend clients, AI integration services, and hardware adapters must comply with the schemas and conventions detailed below.

---

## 1. Global Conventions

- **Base URL**: `http://<host>:<port>/api/v1`
- **Time Representation**: All timestamps are formatted as ISO 8601 strings in UTC (`YYYY-MM-DDTHH:MM:SS.ffffffZ`).
- **Standard Error Envelope**:
  ```json
  {
    "error_code": "STRING_ENUM",
    "message": "Human readable explanation",
    "request_id": "c138fd94-fa06-44ea-8610-85fbf8507ba9",
    "details": [
      {
        "field": "readings.pm25",
        "message": "Value must be positive"
      }
    ]
  }
  ```
- **Standard Pagination Envelope**:
  ```json
  {
    "items": [...],
    "total": 120,
    "next_cursor": "doc_id_xyz",
    "has_more": true,
    "limit": 20
  }
  ```

---

## 2. Authentication & Authorization

- **User Authentication**: Firebase ID Token passed in `Authorization: Bearer <id_token>`
- **Device Authentication**: Dual HMAC headers:
  - `X-Device-ID`: Provisioned unique device identifier
  - `X-Device-Token`: HMAC-SHA256 hex digest computed over `device_id` using the backend shared secret.
- **Roles Enforced**:
  - `anonymous / public`: Read-only access to registered stations, public health overview, and trends.
  - `registered`: Community report submission, personal history, public dashboard.
  - `org_member`: Access to tenant-isolated station analytics and organisation alerts.
  - `org_admin`: Manage organisation station associations and team memberships.
  - `platform_admin`: Hardware provisioning, report moderation, global user audits.

---

## 3. Endpoints Inventory

### Authentication
- `GET /api/v1/auth/me` — Retrieve caller's verified profile and role context.
- `PATCH /api/v1/auth/me` — Update caller preferences or display name.

### Devices & Stations
- `GET /api/v1/devices` — List monitoring stations (supports `organisation_id`, `limit`, `cursor`).
- `GET /api/v1/devices/{station_id}` — Get single monitoring station details and status.
- `POST /api/v1/devices/stations` — Register station (`platform_admin` or `org_admin`).
- `POST /api/v1/devices/provision` — Provision device and generate single-use device API key (`platform_admin`).
- `DELETE /api/v1/devices/{device_id}` — Revoke device credentials (`platform_admin`).

### Sensor Ingestion
- `POST /api/v1/ingest` — Ingest sensor readings (simulated or hardware).
  - Headers: `X-Device-ID`, `X-Device-Token`
  - Body: `IngestPayload`
  ```json
  {
    "device_id": "DEV-ESP32-CRESCENT",
    "station_id": "ST-CRESCENT-01",
    "timestamp": "2026-11-04T12:00:00Z",
    "data_source": "simulated",
    "scenario_id": "normal",
    "readings": {
      "pm1": 12.5,
      "pm25": 25.0,
      "pm10": 42.0,
      "mq135_raw": 1050,
      "temperature": 28.5,
      "humidity": 62.0,
      "pressure": 1012.0
    },
    "location": {
      "latitude": 12.8797,
      "longitude": 80.0805
    }
  }
  ```

### Readings & History
- `GET /api/v1/readings/latest?station_id={station_id}` — Latest reading, freshness, and station status.
- `GET /api/v1/readings/history?station_id={station_id}&start_time={iso}&end_time={iso}&limit={int}` — Historical readings time series.

### Alerts & Incidents
- `GET /api/v1/alerts` — Active threshold and offline alerts.
- `POST /api/v1/alerts/{alert_id}/acknowledge` — Acknowledge an alert.
- `POST /api/v1/alerts/{alert_id}/resolve` — Resolve an alert.
- `GET /api/v1/incidents` — List investigated incidents.
- `GET /api/v1/incidents/{incident_id}` — Get single incident details.
- `POST /api/v1/incidents` — File a new incident investigation.

### Community Pollution Reports
- `POST /api/v1/reports` — Citizen report submission.
- `GET /api/v1/reports` — List user reports or all reports for moderation.
- `GET /api/v1/reports/{report_id}` — Get report details.
- `POST /api/v1/reports/{report_id}/upload-url` — Request signed Firebase Storage upload URL for image attachment.

### Analytics
- `GET /api/v1/analytics/overview` — Dashboard summary metrics.
- `GET /api/v1/analytics/trends?station_id={id}&pollutant={pm25}` — Time-series trend aggregations.
- `GET /api/v1/analytics/hotspots?hours=24` — Station-based pollution ranking.

### AI Engine Integration
- `POST /api/v1/ai/chat` — Conversational environmental intelligence assistant.
- `POST /api/v1/ai/scenarios` — Scenario metadata and baseline parameter descriptions.
- `GET /api/v1/predictions?station_id={id}&pollutant=pm25` — ML forecasting.

### Commercial & SaaS
- `GET /api/v1/plans` — SaaS tiers (Starter, Professional, Enterprise).
- `GET /api/v1/subscriptions/current` — Current active subscription status.
- `POST /api/v1/subscriptions/request?plan_id={plan_id}` — Request subscription change (demo mode).
- `GET /api/v1/usage` — Billing period resource usage and quotas.

### Real-Time WebSocket
- `WebSocket /ws/v1/live?token=<firebase_id_token>`
  - Event types: `reading.created`, `station.status_changed`, `alert.created`, `incident.updated`.

