"""Integration tests for Plans, Subscriptions, and Usage metering."""
from datetime import datetime, timezone
import pytest
from httpx import AsyncClient
import app.integrations.firebase as fb_module


@pytest.mark.asyncio
async def test_plans_and_subscription_flow(async_client: AsyncClient, mock_firestore, monkeypatch):
    now = datetime.now(timezone.utc)
    # Seed Starter plan
    await mock_firestore.collection("plans").document("plan_starter").set({
        "plan_id": "plan_starter",
        "name": "STARTER",
        "billing_period": "monthly",
        "price": 2999.0,
        "currency": "INR",
        "feature_entitlements": {"max_stations": 1, "basic_alerts": True},
        "usage_limits": {"ai_chat_queries": 100},
        "active": True,
        "display_order": 1,
    })

    # 1. Public list plans
    plans_resp = await async_client.get("/api/v1/plans")
    assert plans_resp.status_code == 200
    plans = plans_resp.json()
    assert len(plans) >= 1
    assert plans[0]["plan_id"] == "plan_starter"

    test_uid = "sub-user-001"
    monkeypatch.setattr(fb_module, "verify_id_token", lambda tok: {
        "uid": test_uid,
        "email": "customer@industry.com",
    })
    headers = {"Authorization": "Bearer token"}

    # 2. Request subscription
    sub_resp = await async_client.post("/api/v1/subscriptions/request?plan_id=plan_starter", headers=headers)
    assert sub_resp.status_code == 201, sub_resp.text
    sub = sub_resp.json()
    assert sub["status"] == "demo"
    assert sub["plan_id"] == "plan_starter"

    # 3. Check current subscription
    current_resp = await async_client.get("/api/v1/subscriptions/current", headers=headers)
    assert current_resp.status_code == 200
    assert current_resp.json()["plan_id"] == "plan_starter"

    # 4. Check usage
    usage_resp = await async_client.get("/api/v1/usage", headers=headers)
    assert usage_resp.status_code == 200
    usage = usage_resp.json()
    assert "metrics" in usage
    assert "period" in usage

