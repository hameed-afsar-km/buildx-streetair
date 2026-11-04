"""Integration tests for Devices & Monitoring Stations endpoints."""
from datetime import datetime, timezone
import pytest
from httpx import AsyncClient
import app.integrations.firebase as fb_module


@pytest.mark.asyncio
async def test_list_and_get_stations(async_client: AsyncClient, mock_firestore):
    now = datetime.now(timezone.utc)
    station_id = "ST-CRESCENT-01"
    await mock_firestore.collection("monitoring_stations").document(station_id).set({
        "station_id": station_id,
        "name": "Crescent Campus Station",
        "description": "Demonstration station",
        "latitude": 12.8797,
        "longitude": 80.0805,
        "station_type": "fixed",
        "source_mode": "simulated",
        "status": "active",
        "device_id": "DEV-ESP32-CRESCENT",
        "created_at": now,
        "updated_at": now,
        "last_seen_at": now,
        "metadata": {},
    })

    # List stations
    resp = await async_client.get("/api/v1/devices")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert len(data["items"]) >= 1
    assert data["items"][0]["station_id"] == station_id

    # Get single station
    detail_resp = await async_client.get(f"/api/v1/devices/{station_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["name"] == "Crescent Campus Station"
    assert detail["latitude"] == 12.8797


@pytest.mark.asyncio
async def test_station_not_found(async_client: AsyncClient):
    resp = await async_client.get("/api/v1/devices/NON_EXISTENT_STATION")
    assert resp.status_code == 404
    err = resp.json()
    assert err["error_code"] == "NOT_FOUND"

