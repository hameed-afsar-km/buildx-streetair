"""
STREETAIR AI Engine — Data Validators
=======================================
Validation helpers for incoming telemetry and batch datasets.
"""

from __future__ import annotations

from typing import Any
from app.schemas.common import SensorReading


def validate_readings_batch(raw_readings: list[dict[str, Any]]) -> list[SensorReading]:
    """Parse and validate an untrusted raw list of dictionaries into SensorReading models."""
    validated: list[SensorReading] = []
    for item in raw_readings:
        try:
            validated.append(SensorReading.model_validate(item))
        except Exception:
            # Skip invalid schema items
            continue
    return validated

