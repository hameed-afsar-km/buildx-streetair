"""
Unit Tests — Descriptive Analytics & CPCB AQI Calculator
"""

import pytest
from app.analytics.descriptive import (
    compute_correlations,
    daily_trends,
    descriptive_stats,
    period_comparison,
    sensor_uptime_metrics,
)
from app.data.aqi import AQICategory, compute_cpcb_aqi


def test_cpcb_aqi_breakpoints():
    # Good range: PM2.5 <= 30, PM10 <= 50
    res_good = compute_cpcb_aqi(pm25_24h_avg=25.0, pm10_24h_avg=45.0)
    assert res_good.category == AQICategory.GOOD
    assert res_good.aqi is not None and res_good.aqi <= 50

    # Moderate range: PM2.5 = 75, PM10 = 150
    res_mod = compute_cpcb_aqi(pm25_24h_avg=75.0, pm10_24h_avg=150.0)
    assert res_mod.category == AQICategory.MODERATE
    assert 101 <= res_mod.aqi <= 200

    # Severe range: PM2.5 > 250
    res_sev = compute_cpcb_aqi(pm25_24h_avg=300.0, pm10_24h_avg=450.0)
    assert res_sev.category == AQICategory.SEVERE
    assert res_sev.aqi >= 401

    # Insufficient data
    res_none = compute_cpcb_aqi(pm25_24h_avg=None, pm10_24h_avg=None)
    assert res_none.category == AQICategory.UNAVAILABLE
    assert res_none.aqi is None


def test_descriptive_stats(sample_readings_series):
    stats = descriptive_stats(sample_readings_series, ["pm25", "pm10", "mq135_raw"])
    assert "pm25" in stats
    assert stats["pm25"]["count"] == 24
    assert stats["pm25"]["max"] == 320.0
    assert "mq135_raw" in stats
    # Check that MQ-135 warning is attached
    assert "warning" in stats["mq135_raw"]


def test_daily_trends(sample_readings_series):
    trends = daily_trends(sample_readings_series, "pm25", timezone="UTC")
    assert len(trends) == 1
    assert trends[0]["count"] == 24


def test_period_comparison(sample_readings_series):
    half = len(sample_readings_series) // 2
    comp = period_comparison(
        sample_readings_series[:half],
        sample_readings_series[half:],
        variable="pm25",
        label_a="Day1",
        label_b="Day2",
    )
    assert "absolute_difference" in comp
    assert comp["Day1"]["count"] == half


def test_sensor_uptime_metrics(sample_readings_series):
    metrics = sensor_uptime_metrics(sample_readings_series, expected_interval_minutes=60.0)
    assert metrics["uptime_percent"] is not None
    assert metrics["uptime_percent"] >= 95.0
