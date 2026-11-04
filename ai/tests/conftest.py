"""
STREETAIR AI Engine — Pytest Fixtures
======================================
Deterministic fixtures and synthetic sensor readings for unit & integration testing.
All synthetic data is explicitly marked as simulated.
"""

from __future__ import annotations

import os
from datetime import UTC, datetime, timedelta
import pytest
from fastapi.testclient import TestClient

# Configure environment for tests before importing app modules
os.environ["AI_INTERNAL_API_KEY"] = "test-secret-internal-key-12345"
os.environ["AI_SERVICE_ENV"] = "development"
os.environ["AI_DEFAULT_PROVIDER"] = "groq"
os.environ["VECTOR_STORE_PROVIDER"] = "chromadb"
os.environ["VECTOR_STORE_PATH"] = "./data/test_vectorstore"

from app.core.config import get_settings
from app.main import app
from app.schemas.common import DataSourceType, SensorReading


@pytest.fixture
def auth_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {os.environ['AI_INTERNAL_API_KEY']}"}


@pytest.fixture
def test_client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def sample_readings_series() -> list[SensorReading]:
    """24 hours of hourly synthetic simulated readings with known baseline and one spike."""
    base_time = datetime(2026, 11, 4, 0, 0, 0, tzinfo=UTC)
    readings = []

    for h in range(24):
        # Baseline normal around 35-45 µg/m³
        pm25 = 40.0 + (5.0 if 8 <= h <= 11 or 18 <= h <= 21 else -5.0)
        pm10 = pm25 * 1.8
        # Introduce a high spike at hour 14
        if h == 14:
            pm25 = 320.0
            pm10 = 550.0

        readings.append(
            SensorReading(
                device_id="ESP32-TEST-NODE",
                station_id="ST-001",
                timestamp=base_time + timedelta(hours=h),
                data_source=DataSourceType.SIMULATED,
                scenario_id="normal_with_spike",
                pm1=pm25 * 0.5,
                pm25=pm25,
                pm10=pm10,
                mq135_raw=1150.0,
                temperature=28.0 + (h % 5),
                humidity=60.0 - (h % 10),
                pressure=1010.0,
                latitude=13.0827,
                longitude=80.2707,
            )
        )
    return readings


@pytest.fixture
def flatline_readings() -> list[SensorReading]:
    """Readings demonstrating sensor flatline fault."""
    base_time = datetime(2026, 11, 4, 0, 0, 0, tzinfo=UTC)
    readings = []
    for h in range(10):
        readings.append(
            SensorReading(
                device_id="ESP32-FAULT-NODE",
                station_id="ST-FAULT",
                timestamp=base_time + timedelta(hours=h),
                data_source=DataSourceType.SIMULATED,
                pm25=25.0,  # Constant flatline
                pm10=50.0,  # Constant flatline
                temperature=25.0,
                humidity=50.0,
                latitude=13.0,
                longitude=80.0,
            )
        )
    return readings

