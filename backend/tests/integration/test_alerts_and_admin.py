"""Integration tests for Alerts management, Admin moderation and AI Chat usage."""
from datetime import datetime, timezone
import pytest
from httpx import AsyncClient
import app.integrations.firebase as fb_module
from app.integrations.ai_engine.client import ai_engine_client


@pytest.mark.asyncio
async def test_alert_lifecycle(async_client: AsyncClient, mock_firestore, monkeypatch):
    test_uid = "operator-001"
    monkeypatch.setattr(fb_module, "verify_id_token", lambda tok: {
        "uid": test_uid,
        "email": "operator@streetair.io",
    })
    headers = {"Authorization": "Bearer token"}

    now = datetime.now(timezone.utc)
    alert_id = "ALT-001"
    await mock_firestore.collection("alerts").document(alert_id).set({
        "alert_id": alert_id,
        "station_id": "ST-CRESCENT-01",
        "alert_type": "pm25_poor",
        "severity": "warning",
        "title": "PM2.5 Poor",
        "description": "High particulate count",
        "triggered_at": now,
        "status": "active",
        "source": "threshold_rule",
        "evidence": {},
        "created_at": now,
        "updated_at": now,
    })

    # 1. List active alerts
    list_resp = await async_client.get("/api/v1/alerts")
    assert list_resp.status_code == 200
    alerts = list_resp.json()
    assert len(alerts) >= 1
    assert alerts[0]["alert_id"] == alert_id

    # 2. Acknowledge alert
    ack_resp = await async_client.post(f"/api/v1/alerts/{alert_id}/acknowledge", json={"note": "Investigating"}, headers=headers)
    assert ack_resp.status_code == 200
    assert ack_resp.json()["status"] == "acknowledged"

    # 3. Resolve alert
    res_resp = await async_client.post(f"/api/v1/alerts/{alert_id}/resolve", headers=headers)
    assert res_resp.status_code == 200
    assert res_resp.json()["status"] == "resolved"


@pytest.mark.asyncio
async def test_admin_report_moderation(async_client: AsyncClient, mock_firestore, monkeypatch):
    admin_uid = "admin-super-01"
    monkeypatch.setattr(fb_module, "verify_id_token", lambda tok: {
        "uid": admin_uid,
        "email": "admin@streetair.io",
    })
    # Set global_role = platform_admin
    now = datetime.now(timezone.utc)
    await mock_firestore.collection("users").document(admin_uid).set({
        "uid": admin_uid,
        "email": "admin@streetair.io",
        "global_role": "platform_admin",
        "account_status": "active",
        "created_at": now,
        "updated_at": now,
    })

    headers = {"Authorization": "Bearer token"}

    # Seed report
    report_id = "REP-MOD-01"
    await mock_firestore.collection("pollution_reports").document(report_id).set({
        "report_id": report_id,
        "submitted_by": "user-citizen",
        "category": "smoke",
        "description": "Smoke from clearing",
        "latitude": 12.8797,
        "longitude": 80.0805,
        "status": "submitted",
        "created_at": now,
        "updated_at": now,
    })

    # Admin moderate report
    mod_resp = await async_client.patch(
        f"/api/v1/admin/reports/{report_id}",
        json={"status": "verified", "review_note": "Confirmed by ground team"},
        headers=headers,
    )
    assert mod_resp.status_code == 200
    assert mod_resp.json()["status"] == "verified"
    assert mod_resp.json()["review_note"] == "Confirmed by ground team"


@pytest.mark.asyncio
async def test_ai_chat_interaction(async_client: AsyncClient, monkeypatch):
    test_uid = "chat-user-01"
    monkeypatch.setattr(fb_module, "verify_id_token", lambda tok: {
        "uid": test_uid,
        "email": "analyst@crescent.edu",
    })
    headers = {"Authorization": "Bearer token"}

    # Mock internal AI engine chat response
    async def mock_chat(**kwargs):
        return {
            "message_id": "msg-ai-1",
            "content": "The AQI is currently 85 (Satisfactory).",
            "provider": "groq",
            "model": "llama-3.3-70b-versatile",
            "citations": [],
        }
    monkeypatch.setattr(ai_engine_client, "chat", mock_chat)

    chat_resp = await async_client.post(
        "/api/v1/ai/chat",
        json={
            "message": "What is the current air quality at Crescent station?",
            "provider": "groq",
            "station_context": "ST-CRESCENT-01",
        },
        headers=headers,
    )
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert "The AQI is currently 85" in chat_data["content"]
    assert chat_data["provider"] == "groq"

