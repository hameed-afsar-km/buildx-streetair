"""Tests for schema validation."""
from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
from app.schemas.readings import IngestPayload, SensorValues


def test_valid_ingest_payload():
    payload = IngestPayload(
        device_id="DEV-ESP32-CRESCENT",
        station_id="ST-CRESCENT-01",
        timestamp=datetime.now(timezone.utc),
        data_source="simulated",
        scenario_id="normal",
        readings=SensorValues(
            pm1=12.5,
            pm25=25.0,
            pm10=45.0,
            temperature=28.5,
            humidity=60.0,
            pressure=1012.0,
            mq135_raw=1050,
        ),
    )
    assert payload.device_id == "DEV-ESP32-CRESCENT"
    assert payload.readings.pm25 == 25.0


def test_invalid_data_source():
    with pytest.raises(ValidationError):
        IngestPayload(
            device_id="DEV-01",
            station_id="ST-01",
            timestamp=datetime.now(timezone.utc),
            data_source="satellite",  # invalid
            readings=SensorValues(pm25=20.0),
        )


def test_negative_sensor_values():
    with pytest.raises(ValidationError):
        SensorValues(pm25=-5.0)  # ge=0 violation

