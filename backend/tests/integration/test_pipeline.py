"""Integration tests for app routes and ingestion flow."""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import generate_device_token
from app.core.config import settings


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "services" in data


@pytest.mark.asyncio
async def test_readiness_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/ready")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data


@pytest.mark.asyncio
async def test_unauthorized_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Protected without auth header
        resp = await ac.get("/api/v1/auth/me")
        assert resp.status_code == 401
        err = resp.json()
        assert "error" in err or "error_code" in err


@pytest.mark.asyncio
async def test_ingest_missing_device_headers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/v1/ingest", json={})
        assert resp.status_code == 401

