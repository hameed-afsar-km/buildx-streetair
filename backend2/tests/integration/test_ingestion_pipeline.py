"""
End-to-End integration test for the sensor reading ingestion pipeline:
Device -> Ingest Endpoint -> Bounds Validation -> CPCB AQI Calculation ->
Firestore Persistence -> Station Metadata Update -> Alert Generation -> WebSocket Broadcast.
"""
from datetime import datetime, timezone
import pytest
from httpx import AsyncClient
from app.core.security import generate_device_token
from app.core.config import settings


@pytest.mark.asyncio
async def test_full_ingestion_pipeline(async_client: AsyncClient, mock_firestore):
    station_id = "ST-TEST-001"
    device_id = "DEV-ESP32-TEST"

    # Seed station & device in mock firestore
    now = datetime.now(timezone.utc)
    await mock_firestore.collection("monitoring_stations").document(station_id).set({
        "station_id": station_id,
        "name": "Test Station Crescent",
        "device_id": device_id,
        "status": "active",
        "latitude": 12.8797,
        "longitude": 80.0805,
        "created_at": now,
        "updated_at": now,
    })
    await mock_firestore.collection("devices").document(device_id).set({
        "device_id": device_id,
        "station_id": station_id,
        "device_status": "active",
        "created_at": now,
        "updated_at": now,
    })

    # Prepare HMAC auth headers
    token = generate_device_token(device_id, settings.DEVICE_AUTH_SECRET)
    headers = {
        "X-Device-ID": device_id,
        "X-Device-Token": token,
        "Content-Type": "application/json",
    }

    # Ingest payload
    payload = {
        "device_id": device_id,
        "station_id": station_id,
        "timestamp": now.isoformat(),
        "data_source": "simulated",
        "scenario_id": "traffic_congestion",
        "readings": {
            "pm1": 42.0,
            "pm25": 115.0,  # poor air quality (triggering alert)
            "pm10": 180.0,
            "mq135_raw": 1600,
            "temperature": 31.5,
            "humidity": 55.0,
            "pressure": 1010.0,
        },
        "location": {
            "latitude": 12.8797,
            "longitude": 80.0805,
        },
        "firmware_version": "v1.0.0-test",
    }

    resp = await async_client.post("/api/v1/ingest", json=payload, headers=headers)
    assert resp.status_code == 201, resp.text
    data = resp.json()

    # Verify canonical response structure
    assert data["station_id"] == station_id
    assert data["device_id"] == device_id
    assert data["data_source"] == "simulated"
    assert data["scenario_id"] == "traffic_congestion"
    assert "reading_id" in data
    assert data["aqi"] is not None
    assert data["aqi"]["calculable"] is True
    assert data["aqi"]["dominant_pollutant"] == "pm25"
    assert data["aqi"]["category"] in ("Poor", "Very Poor")

    # Verify duplicate reading rejection (idempotency)
    dup_resp = await async_client.post("/api/v1/ingest", json=payload, headers=headers)
    assert dup_resp.status_code == 400
    dup_data = dup_resp.json()
    assert dup_data["error_code"] == "INGESTION_ERROR"
    assert "Duplicate" in dup_data["message"]

    # Verify latest reading query
    latest_resp = await async_client.get(f"/api/v1/readings/latest?station_id={station_id}")
    assert latest_resp.status_code == 200
    latest_data = latest_resp.json()
    assert latest_data["station_id"] == station_id
    assert latest_data["reading"] is not None
    assert latest_data["reading"]["readings"]["pm25"] == 115.0


@pytest.mark.asyncio
async def test_ingest_out_of_bounds_reading(async_client: AsyncClient, mock_firestore):
    station_id = "ST-TEST-002"
    device_id = "DEV-ESP32-002"
    now = datetime.now(timezone.utc)
    await mock_firestore.collection("monitoring_stations").document(station_id).set({
        "station_id": station_id,
        "device_id": device_id,
        "status": "active",
    })
    await mock_firestore.collection("devices").document(device_id).set({
        "device_id": device_id,
        "station_id": station_id,
        "device_status": "active",
    })

    token = generate_device_token(device_id, settings.DEVICE_AUTH_SECRET)
    headers = {"X-Device-ID": device_id, "X-Device-Token": token}

    payload = {
        "device_id": device_id,
        "station_id": station_id,
        "timestamp": now.isoformat(),
        "data_source": "simulated",
        "readings": {
            "pm25": 9999.0,  # Exceeds PM25_MAX (1500.0)
        },
    }
    resp = await async_client.post("/api/v1/ingest", json=payload, headers=headers)
    assert resp.status_code == 422
    err = resp.json()
    assert err["error_code"] == "VALIDATION_ERROR"
    assert "outside bounds" in err["message"]

