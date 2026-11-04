"""Tests for India CPCB National AQI calculation."""
import pytest
from app.services.aqi_service import calculate_aqi, PM25_BREAKPOINTS, PM10_BREAKPOINTS


def test_aqi_good():
    # PM2.5 = 15 (0-30 -> 0-50), PM10 = 25 (0-50 -> 0-50)
    res = calculate_aqi(pm25=15.0, pm10=25.0, is_simulated=True)
    assert res["calculable"] is True
    assert res["category"] == "Good"
    assert 0 <= res["value"] <= 50
    assert res["is_simulated"] is True


def test_aqi_satisfactory():
    # PM2.5 = 45 (31-60 -> 51-100)
    res = calculate_aqi(pm25=45.0, pm10=60.0, is_simulated=False)
    assert res["calculable"] is True
    assert res["category"] == "Satisfactory"
    assert 51 <= res["value"] <= 100


def test_aqi_moderate():
    # PM2.5 = 75 (61-90 -> 101-200)
    res = calculate_aqi(pm25=75.0, pm10=150.0)
    assert res["calculable"] is True
    assert res["category"] == "Moderate"
    assert 101 <= res["value"] <= 200


def test_aqi_poor():
    # PM2.5 = 105 (91-120 -> 201-300)
    res = calculate_aqi(pm25=105.0, pm10=280.0)
    assert res["calculable"] is True
    assert res["category"] == "Poor"
    assert 201 <= res["value"] <= 300


def test_aqi_very_poor():
    # PM2.5 = 150 (121-250 -> 301-400)
    res = calculate_aqi(pm25=150.0, pm10=380.0)
    assert res["calculable"] is True
    assert res["category"] == "Very Poor"
    assert 301 <= res["value"] <= 400


def test_aqi_severe():
    # PM2.5 = 300 (250+ -> 401-500)
    res = calculate_aqi(pm25=300.0, pm10=450.0)
    assert res["calculable"] is True
    assert res["category"] == "Severe"
    assert res["value"] > 400


def test_missing_pollutants():
    # Only MQ-135, no PM -> cannot calculate official CPCB AQI
    res = calculate_aqi(pm25=None, pm10=None)
    assert res["calculable"] is False
    assert res["value"] is None
    assert "MQ-135" in res["limitation_note"]

