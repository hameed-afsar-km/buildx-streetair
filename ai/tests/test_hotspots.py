"""
Unit Tests — Spatial Hotspot Analysis
"""

from datetime import UTC, datetime
from app.ml.hotspot_detection.spatial import detect_hotspots, haversine_distance_km
from app.schemas.common import DataSourceType, SensorReading


def test_haversine_distance():
    # Distance between Chennai (13.0827, 80.2707) and Bengaluru (12.9716, 77.5946) ~ 290 km
    dist = haversine_distance_km(13.0827, 80.2707, 12.9716, 77.5946)
    assert 280.0 <= dist <= 310.0


def test_hotspot_sparse_warning():
    # Only 2 stations -> should flag low coverage
    now = datetime.now(UTC)
    readings = [
        SensorReading(
            device_id="D1", station_id="S1", timestamp=now, data_source=DataSourceType.SIMULATED,
            pm25=120.0, latitude=13.0, longitude=80.0
        ),
        SensorReading(
            device_id="D2", station_id="S2", timestamp=now, data_source=DataSourceType.SIMULATED,
            pm25=130.0, latitude=13.01, longitude=80.01
        ),
    ]
    resp = detect_hotspots(readings, target_variable="pm25")
    assert resp.warnings.low_station_coverage is True
    assert resp.total_stations_analyzed == 2

