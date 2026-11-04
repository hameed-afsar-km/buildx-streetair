"""
STREETAIR AI Engine — Statistical & Rule-Based Anomaly Detection
==================================================================
Identifies unusual deviations, spikes, persistent shifts, and sensor malfunctions.
Distinguishes data-quality anomalies from suspected environmental pollution events.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

import numpy as np
import pandas as pd

from app.analytics.descriptive import readings_to_dataframe
from app.schemas.anomaly import AnomalyRecord
from app.schemas.common import AnomalySeverity, DataSourceType, SensorReading


def detect_anomalies(
    readings: list[SensorReading],
    station_id: str,
    target_variables: list[str] | None = None,
    z_threshold: float = 3.0,
    iqr_multiplier: float = 1.5,
) -> list[AnomalyRecord]:
    """
    Detect statistical anomalies in sensor readings.
    """
    if len(readings) < 3:
        return []

    df = readings_to_dataframe(readings)
    targets = target_variables or ["pm25", "pm10", "temperature", "humidity"]
    anomalies: list[AnomalyRecord] = []

    for var in targets:
        if var not in df.columns:
            continue

        series = pd.to_numeric(df[var], errors="coerce")
        valid_mask = series.notna()
        if valid_mask.sum() < 3:
            continue

        valid_vals = series[valid_mask]
        mean = float(valid_vals.mean())
        std = float(valid_vals.std()) if len(valid_vals) > 1 else 0.0

        q1 = float(valid_vals.quantile(0.25))
        q3 = float(valid_vals.quantile(0.75))
        iqr = q3 - q1
        iqr_low = q1 - iqr_multiplier * iqr
        iqr_high = q3 + iqr_multiplier * iqr

        # Check consecutive identical values for flatlining
        diffs = series.diff().fillna(1.0)
        flatline_series = (diffs == 0.0).astype(int)
        rolling_flatlines = flatline_series.rolling(window=5, min_periods=5).sum()

        for idx, row in df.iterrows():
            val = row[var]
            if pd.isna(val):
                continue
            val_f = float(val)
            ts = row["timestamp"].to_pydatetime()
            source = DataSourceType(row["data_source"]) if row["data_source"] in DataSourceType._value2member_map_ else DataSourceType.UNKNOWN

            # 1. Flatline check
            if not pd.isna(rolling_flatlines.iloc[idx]) and rolling_flatlines.iloc[idx] >= 4:
                anomalies.append(
                    AnomalyRecord(
                        anomaly_id=str(uuid.uuid4()),
                        station_id=station_id,
                        affected_variable=var,
                        detected_at=datetime.now(UTC),
                        time_range_start=ts,
                        time_range_end=ts,
                        observed_value=val_f,
                        expected_baseline=round(mean, 2),
                        expected_range_low=round(q1, 2),
                        expected_range_high=round(q3, 2),
                        severity=AnomalySeverity.MEDIUM,
                        detection_method="flatline_rule",
                        model_version="1.0.0",
                        is_data_quality_issue=True,
                        explanation=f"Sensor flatline detected: {var} held a constant value of {val_f} for consecutive intervals, indicating possible sensor freeze or communication buffer repeat.",
                        data_source=source,
                        warnings=["Suspected device issue — do not treat as an environmental incident."],
                    )
                )
                continue

            # 2. Z-Score anomaly
            z_score = abs(val_f - mean) / std if std > 0 else 0.0
            is_z_anomaly = z_score >= z_threshold

            # 3. IQR anomaly
            is_iqr_anomaly = val_f < iqr_low or val_f > iqr_high

            if is_z_anomaly or is_iqr_anomaly:
                # Severity determination
                if z_score >= 5.0 or (iqr > 0 and (val_f > q3 + 3.0 * iqr)):
                    sev = AnomalySeverity.CRITICAL
                elif z_score >= 4.0:
                    sev = AnomalySeverity.HIGH
                else:
                    sev = AnomalySeverity.MEDIUM

                # Distinguish possible pollution from sensor bug:
                # Extreme spike in PM with zero temperature/humidity variation or negative reading
                is_dq = val_f < 0 or (var in ["pm25", "pm10"] and val_f > 1200)

                explanation = (
                    f"Variable {var} at station {station_id} reached {val_f}, which is "
                    f"{round(z_score, 1)} standard deviations from the historical mean ({round(mean, 1)}). "
                    f"Normal baseline range: [{round(q1, 1)} - {round(q3, 1)}]."
                )

                anomalies.append(
                    AnomalyRecord(
                        anomaly_id=str(uuid.uuid4()),
                        station_id=station_id,
                        affected_variable=var,
                        detected_at=datetime.now(UTC),
                        time_range_start=ts,
                        time_range_end=ts,
                        observed_value=val_f,
                        expected_baseline=round(mean, 2),
                        expected_range_low=round(max(0.0, q1 - iqr), 2),
                        expected_range_high=round(q3 + iqr, 2),
                        severity=sev,
                        detection_method="zscore_iqr_hybrid",
                        model_version="1.0.0",
                        is_data_quality_issue=is_dq,
                        explanation=explanation,
                        data_source=source,
                        warnings=[
                            "Statistical anomaly only. External confirmation (e.g. adjacent stations or visual reports) required before verifying incident."
                        ],
                    )
                )

    return anomalies

