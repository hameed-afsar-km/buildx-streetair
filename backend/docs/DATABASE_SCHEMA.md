# STREETAIR — Cloud Firestore Database Schema

This document details the collections, document schemas, indexing strategies, and partitioning design implemented for Cloud Firestore in the STREETAIR platform.

---

## 1. Primary Collections Overview

| Collection | Document ID | Purpose |
|------------|-------------|---------|
| `users` | `uid` (Firebase UID) | User profile, role, status, preferences |
| `organisations` | `organisation_id` (ULID) | Tenant organisations |
| `organisation_members`| `membership_id` (ULID) | User-organisation membership and roles |
| `monitoring_stations` | `station_id` (ULID/Slug) | Physical and virtual monitoring stations |
| `devices` | `device_id` (DEV-...) | Registered ESP32 and virtual devices |
| `sensor_readings` | `reading_id` (ULID) | High-volume time-series readings |
| `alerts` | `alert_id` (ULID) | Threshold, offline, and anomaly alerts |
| `incidents` | `incident_id` (ULID) | Investigated pollution events |
| `pollution_reports` | `report_id` (ULID) | Community-submitted reports |
| `predictions` | `prediction_id` (ULID) | Machine learning forecasted values |
| `conversations` | `conversation_id` (UUID) | AI assistant chat sessions |
| `conversation_messages`| `message_id` (UUID) | Individual chat messages |
| `plans` | `plan_id` (e.g. `plan_starter`) | SaaS commercial plan definitions |
| `subscriptions` | `subscription_id` (ULID) | Active/trial/demo customer subscriptions |
| `usage_records` | `usage_id` (ULID) | Monthly aggregated API and resource usage |
| `audit_logs` | `audit_id` (ULID) | Security and moderation audit trail |

---

## 2. Key Collection Schemas

### `sensor_readings`
```json
{
  "reading_id": "01JBE4...",
  "station_id": "ST-CRESCENT-01",
  "device_id": "DEV-ESP32-CRESCENT",
  "timestamp": "Timestamp",
  "received_at": "Timestamp",
  "data_source": "simulated | hardware",
  "scenario_id": "traffic_congestion | null",
  "readings": {
    "pm1": 45.2,
    "pm25": 112.4,
    "pm10": 182.1,
    "mq135_raw": 1650,
    "temperature": 32.1,
    "humidity": 58.0,
    "pressure": 1009.2
  },
  "aqi": {
    "value": 274.0,
    "category": "Poor",
    "dominant_pollutant": "pm25",
    "standard": "CPCB_INDIA_2014",
    "is_simulated": true,
    "calculable": true
  },
  "quality_flags": ["mq135_raw_uncalibrated"],
  "location": {
    "latitude": 12.8797,
    "longitude": 80.0805
  },
  "firmware_version": "v1.0.0-simulator",
  "ingestion_metadata": {
    "request_id": "uuid",
    "ingested_at": "ISO8601"
  }
}
```

---

## 3. Required Firestore Composite Indexes

For efficient queries without table scans, the following composite indexes must be deployed via `firestore.indexes.json` or GCP Console:

```json
{
  "indexes": [
    {
      "collectionGroup": "sensor_readings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "station_id", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "alerts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "station_id", "order": "ASCENDING" },
        { "fieldPath": "alert_type", "order": "ASCENDING" },
        { "fieldPath": "triggered_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "alerts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organisation_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "triggered_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "incidents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organisation_id", "order": "ASCENDING" },
        { "fieldPath": "investigation_status", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "pollution_reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "submitted_by", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 4. Archival and High-Volume Retention Strategy

- **Raw Readings**: Retained for 90 days in hot storage. A scheduled Cloud Function or batch process rolls older readings into partitioned Cloud Storage buckets (Parquet format) for long-term analytical queries.
- **Aggregations**: Hourly and daily summaries are precalculated and persisted to prevent full collection scans for chart rendering.

