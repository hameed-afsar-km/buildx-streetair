"""
Integration Tests — FastAPI Endpoints & S2S Authentication
"""

import pytest
from fastapi.testclient import TestClient


def test_public_health_check(test_client: TestClient):
    resp = test_client.get("/internal/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["service"] == "streetair-ai"


def test_auth_rejection_missing_header(test_client: TestClient):
    # Calling internal authenticated endpoint without header must 401
    resp = test_client.get("/internal/v1/readiness")
    assert resp.status_code == 401


def test_auth_rejection_invalid_token(test_client: TestClient):
    resp = test_client.get(
        "/internal/v1/readiness",
        headers={"Authorization": "Bearer totally-invalid-token"},
    )
    assert resp.status_code == 403


def test_scenarios_endpoint_integration(test_client: TestClient, auth_headers: dict[str, str]):
    payload = {
        "org_id": "org_chennai",
        "scenario_type": "traffic_reduction",
        "parameters": {"reduction_percent": 30.0},
        "baseline_values": {"pm25": 90.0, "pm10": 150.0},
    }
    resp = test_client.post(
        "/internal/v1/scenarios",
        json=payload,
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["scenario_type"] == "traffic_reduction"
    assert data["results"]["estimated_pm25_reduction"] > 0
    assert data["is_illustrative_estimate"] is True


def test_report_classification_endpoint_integration(test_client: TestClient, auth_headers: dict[str, str]):
    payload = {
        "org_id": "org_chennai",
        "reports": [
            {
                "report_id": "REP-INTEG-01",
                "submitted_at": "2026-11-04T12:00:00Z",
                "text_description": "Open garbage burning creating thick acrid smoke near housing colony.",
                "location_name": "Velachery Ward 12",
            }
        ],
    }
    resp = test_client.post(
        "/internal/v1/report-classification",
        json=payload,
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["classifications"]) == 1
    assert data["classifications"][0]["category"] in ["waste_burning", "smoke_open_burning"]

