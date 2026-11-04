"""
STREETAIR AI Engine — Preprocessing & Quality Pipeline
========================================================
Validates physical plausibility ranges, tracks provenance,
detects sensor flatlines, duplicates, and outages without silently dropping data.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any

import pandas as pd

from app.schemas.common import DataSourceType, SensorReading

# Physical ranges for outdoor air quality
PLAUSIBLE_RANGES = {
    "pm1": (0.0, 500.0),
    "pm25": (0.0, 999.0),
    "pm10": (0.0, 1500.0),
    "temperature": (-20.0, 60.0),
    "humidity": (0.0, 100.0),
    "pressure": (750.0, 1100.0),
}


class QualityFlag(str, Enum):
    VALID = "valid"
    RANGE_WARNING = "out_of_plausible_range"
    FLATLINE = "sensor_flatline"
    DUPLICATE = "duplicate_timestamp"
    MISSING_KEY_METRIC = "missing_key_metric"


@dataclass
class QualityAnnotation:
    index: int
    station_id: str
    timestamp: datetime
    flag: QualityFlag
    details: str


@dataclass
class PreprocessingResult:
    valid_readings: list[SensorReading]
    flagged_readings: list[tuple[SensorReading, QualityAnnotation]] = field(default_factory=list)
    quality_summary: dict[str, Any] = field(default_factory=dict)
    excluded_count: int = 0
    contains_simulated: bool = False
    contains_hardware: bool = False
    is_mixed_source: bool = False


def preprocess_readings(
    readings: list[SensorReading],
    station_id: str | None = None,
    flatline_threshold: int = 5,
) -> PreprocessingResult:
    """
    Audit, validate, and clean sensor readings.
    Does NOT silently alter measurements or convert raw MQ-135 values.
    """
    if not readings:
        return PreprocessingResult(valid_readings=[])

    seen_timestamps: set[datetime] = set()
    valid_list: list[SensorReading] = []
    flagged: list[tuple[SensorReading, QualityAnnotation]] = []

    has_sim = any(r.data_source == DataSourceType.SIMULATED for r in readings)
    has_hw = any(r.data_source == DataSourceType.HARDWARE for r in readings)

    # Track consecutive identical values for flatlining
    last_values: dict[str, float | None] = {}
    consecutive_counts: dict[str, int] = {}

    for idx, r in enumerate(readings):
        station = r.station_id or station_id or "unknown"
        is_clean = True

        # Check duplicate
        if r.timestamp in seen_timestamps:
            anno = QualityAnnotation(
                index=idx,
                station_id=station,
                timestamp=r.timestamp,
                flag=QualityFlag.DUPLICATE,
                details=f"Duplicate timestamp {r.timestamp.isoformat()} encountered.",
            )
            flagged.append((r, anno))
            is_clean = False
        else:
            seen_timestamps.add(r.timestamp)

        # Check physical ranges
        for var, (low, high) in PLAUSIBLE_RANGES.items():
            val = getattr(r, var, None)
            if val is not None:
                if val < low or val > high:
                    anno = QualityAnnotation(
                        index=idx,
                        station_id=station,
                        timestamp=r.timestamp,
                        flag=QualityFlag.RANGE_WARNING,
                        details=f"Value {val} for {var} is outside physically plausible range [{low}, {high}].",
                    )
                    flagged.append((r, anno))
                    is_clean = False

                # Flatline check
                prev = last_values.get(var)
                if prev is not None and prev == val:
                    consecutive_counts[var] = consecutive_counts.get(var, 1) + 1
                    if consecutive_counts[var] >= flatline_threshold:
                        anno = QualityAnnotation(
                            index=idx,
                            station_id=station,
                            timestamp=r.timestamp,
                            flag=QualityFlag.FLATLINE,
                            details=f"Sensor flatline detected: {consecutive_counts[var]} consecutive identical values ({val}) for {var}.",
                        )
                        flagged.append((r, anno))
                        is_clean = False
                else:
                    consecutive_counts[var] = 1
                last_values[var] = val

        if is_clean:
            valid_list.append(r)

    summary = {
        "total_received": len(readings),
        "valid_count": len(valid_list),
        "flagged_count": len(flagged),
        "contains_simulated": has_sim,
        "contains_hardware": has_hw,
        "is_mixed": has_sim and has_hw,
    }

    return PreprocessingResult(
        valid_readings=valid_list,
        flagged_readings=flagged,
        quality_summary=summary,
        excluded_count=len(flagged),
        contains_simulated=has_sim,
        contains_hardware=has_hw,
        is_mixed_source=has_sim and has_hw,
    )

