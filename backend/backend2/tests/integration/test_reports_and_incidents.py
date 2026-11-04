"""Integration tests for Community Reports and Incidents."""
from datetime import datetime, timezone
import pytest
from httpx import AsyncClient
import app.integrations.firebase as fb_module


@pytest.mark.asyncio
async def test_community_report_submission_and_query(async_client: AsyncClient, monkeypatch):
    test_uid = "citizen-uid-001"
    monkeypatch.setattr(fb_module, "verify_id_token", lambda tok: {
        "uid": test_uid,
        "email": "citizen@chennai.gov",
    })
    headers = {"Authorization": "Bearer token"}

    # Submit report
    submit_resp = await async_client.post(
        "/api/v1/reports",
        json={
            "category": "waste_burning",
            "description": "Dense black smoke behind Crescent sports complex",
            "latitude": 12.8797,
            "longitude": 80.0805,
        },
        headers=headers,
    )
    assert submit_resp.status_code == 201, submit_resp.text
    rep = submit_resp.json()
    assert rep["category"] == "waste_burning"
    assert rep["submitted_by"] == test_uid
    report_id = rep["report_id"]

    # Get report detail
    detail_resp = await async_client.get(f"/api/v1/reports/{report_id}", headers=headers)
    assert detail_resp.status_code == 200
    assert detail_resp.json()["report_id"] == report_id

    # List caller reports
    list_resp = await async_client.get("/api/v1/reports?user_only=true", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()["items"]) >= 1


@pytest.mark.asyncio
async def test_incident_creation_and_query(async_client: AsyncClient, monkeypatch):
    test_uid = "officer-uid-002"
    monkeypatch.setattr(fb_module, "verify_id_token", lambda tok: {
        "uid": test_uid,
        "email": "officer@cpcb.nic.in",
    })
    headers = {"Authorization": "Bearer token"}

    create_resp = await async_client.post(
        "/api/v1/incidents",
        json={
            "category": "industrial",
            "severity": "high",
            "description": "Unusual sulfur dioxide and particulate plume detected near GST road junction",
            "station_ids": ["ST-CRESCENT-01"],
            "location": {"latitude": 12.8797, "longitude": 80.0805},
        },
        headers=headers,
    )
    assert create_resp.status_code == 201, create_resp.text
    inc = create_resp.json()
    assert inc["category"] == "industrial"
    assert inc["investigation_status"] == "open"
    incident_id = inc["incident_id"]

    get_resp = await async_client.get(f"/api/v1/incidents/{incident_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["severity"] == "high"

