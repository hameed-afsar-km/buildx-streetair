"""Integration tests for Authentication and Organisations."""
from datetime import datetime, timezone
import pytest
from httpx import AsyncClient
import app.integrations.firebase as fb_module


@pytest.mark.asyncio
async def test_auth_me_and_profile_update(async_client: AsyncClient, mock_firestore, monkeypatch):
    test_uid = "usr-test-123"
    # Mock verify_id_token to return test_uid
    monkeypatch.setattr(fb_module, "verify_id_token", lambda tok: {
        "uid": test_uid,
        "email": "tester@streetair.io",
        "name": "Test Engineer",
    })

    headers = {"Authorization": "Bearer mock-firebase-token"}

    # Initial profile fetch (upserts automatically)
    resp = await async_client.get("/api/v1/auth/me", headers=headers)
    assert resp.status_code == 200, resp.text
    profile = resp.json()
    assert profile["uid"] == test_uid
    assert profile["account_status"] == "active"

    # Profile update
    update_resp = await async_client.patch(
        "/api/v1/auth/me",
        json={"display_name": "Senior QA Tester", "preferences": {"theme": "dark"}},
        headers=headers,
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["display_name"] == "Senior QA Tester"
    assert updated["preferences"]["theme"] == "dark"


@pytest.mark.asyncio
async def test_organisation_lifecycle(async_client: AsyncClient, mock_firestore, monkeypatch):
    test_uid = "org-admin-uid"
    monkeypatch.setattr(fb_module, "verify_id_token", lambda tok: {
        "uid": test_uid,
        "email": "admin@crescent.edu",
        "name": "Campus Administrator",
    })

    headers = {"Authorization": "Bearer mock-token"}

    # Create organisation
    create_resp = await async_client.post(
        "/api/v1/organisations",
        json={"name": "Crescent Environment Lab", "organisation_type": "education"},
        headers=headers,
    )
    assert create_resp.status_code == 201, create_resp.text
    org = create_resp.json()
    org_id = org["organisation_id"]
    assert org["name"] == "Crescent Environment Lab"

    # Get organisation
    get_resp = await async_client.get(f"/api/v1/organisations/{org_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["organisation_id"] == org_id

    # List members
    members_resp = await async_client.get(f"/api/v1/organisations/{org_id}/members", headers=headers)
    assert members_resp.status_code == 200
    members = members_resp.json()
    assert len(members) == 1
    assert members[0]["uid"] == test_uid
    assert members[0]["role"] == "admin"

