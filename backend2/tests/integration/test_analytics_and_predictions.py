"""Integration tests for Analytics, Trends, Hotspots and Predictions."""
from datetime import datetime, timezone, timedelta
import pytest
from httpx import AsyncClient
import app.integrations.firebase as fb_module


@pytest.mark.asyncio
async def test_analytics_overview_and_trends(async_client: AsyncClient, mock_firestore):
    now = datetime.now(timezone.utc)
    station_id = "ST-CRESCENT-01"

    # Seed station & reading
    await mock_firestore.collection("monitoring_stations").document(station_id).set({
        "station_id": station_id,
        "name": "Crescent Campus Station",
        "status": "active",
        "latitude": 12.8797,
        "longitude": 80.0805,
    })
    await mock_firestore.collection("sensor_readings").document("RD-001").set({
        "station_id": station_id,
        "timestamp": now,
        "readings": {"pm25": 45.0, "pm10": 75.0},
        "aqi": {"value": 75.0, "category": "Satisfactory", "dominant_pollutant": "pm10"},
    })

    # Overview
    overview_resp = await async_client.get("/api/v1/analytics/overview")
    assert overview_resp.status_code == 200
    ov = overview_resp.json()
    assert ov["total_stations"] >= 1
    assert ov["active_stations"] >= 1

    # Trends
    trends_resp = await async_client.get(f"/api/v1/analytics/trends?station_id={station_id}&pollutant=pm25")
    assert trends_resp.status_code == 200
    tr = trends_resp.json()
    assert tr["station_id"] == station_id
    assert tr["pollutant"] == "pm25"
    assert tr["unit"] == "µg/m³"

    # Hotspots
    hotspots_resp = await async_client.get("/api/v1/analytics/hotspots?hours=24")
    assert hotspots_resp.status_code == 200
    hs = hotspots_resp.json()
    assert "hotspots" in hs
    assert "limitation" in hs


@pytest.mark.asyncio
async def test_scenarios_and_predictions(async_client: AsyncClient, monkeypatch):
    test_uid = "usr-predict-1"
    monkeypatch.setattr(fb_module, "verify_id_token", lambda tok: {
        "uid": test_uid,
        "email": "user@streetair.io",
    })
    headers = {"Authorization": "Bearer token"}

    # Scenarios metadata
    sc_resp = await async_client.post(
        "/api/v1/ai/scenarios",
        json={"scenario_id": "traffic_congestion", "station_id": "ST-CRESCENT-01"},
        headers=headers,
    )
    assert sc_resp.status_code == 200
    sc_data = sc_resp.json()
    assert sc_data["scenario_id"] == "traffic_congestion"
    assert "pm25" in sc_data["expected_readings"]

    # Forecast / Predictions
    pred_resp = await async_client.get(
        "/api/v1/predictions?station_id=ST-CRESCENT-01&pollutant=pm25&horizon_hours=12",
        headers=headers,
    )
    assert pred_resp.status_code == 200
    preds = pred_resp.json()
    assert len(preds) >= 1
    assert preds[0]["forecast_horizon_hours"] == 12
    assert preds[0]["pollutant"] == "pm25"
    assert preds[0]["is_forecast"] is True

