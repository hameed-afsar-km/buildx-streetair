"""
Unit Tests — Anomaly Detection
"""

import pytest
from app.ml.anomaly_detection.detector import detect_anomalies
from app.schemas.common import AnomalySeverity


def test_detect_spike_anomaly(sample_readings_series):
    anomalies = detect_anomalies(
        sample_readings_series,
        station_id="ST-001",
        target_variables=["pm25"],
    )
    # Hour 14 was set to 320.0 vs ~40 baseline, should be flagged
    assert len(anomalies) >= 1
    spike = next((a for a in anomalies if a.observed_value == 320.0), None)
    assert spike is not None
    assert spike.affected_variable == "pm25"
    assert spike.severity in [AnomalySeverity.HIGH, AnomalySeverity.CRITICAL]
    assert not spike.is_data_quality_issue  # Spike is pollution candidate, not flatline


def test_detect_flatline_sensor_issue(flatline_readings):
    anomalies = detect_anomalies(
        flatline_readings,
        station_id="ST-FAULT",
        target_variables=["pm25"],
    )
    flatline_anom = [a for a in anomalies if a.detection_method == "flatline_rule"]
    assert len(flatline_anom) > 0
    # Sensor flatline must be flagged as a data quality issue
    assert all(a.is_data_quality_issue for a in flatline_anom)

