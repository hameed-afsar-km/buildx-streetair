"""
Unit Tests — Forecasting Baseline & Evaluation
"""

import pytest
from app.core.errors import InsufficientDataError
from app.ml.forecasting.baseline import generate_forecast
from app.ml.forecasting.evaluation import compute_mae, compute_rmse, time_aware_split


def test_time_aware_split():
    data = list(range(10))
    train, test = time_aware_split(data, test_fraction=0.2)
    assert train == [0, 1, 2, 3, 4, 5, 6, 7]
    assert test == [8, 9]


def test_forecast_generation(sample_readings_series):
    resp = generate_forecast(
        readings=sample_readings_series,
        station_id="ST-001",
        target_variable="pm25",
        horizon_hours=12,
    )
    assert resp.is_forecast is True
    assert len(resp.forecast_points) == 12
    assert resp.evaluation is not None
    assert resp.evaluation.mae is not None
    # Uncertainty intervals
    for pt in resp.forecast_points:
        assert pt.lower_bound is not None
        assert pt.upper_bound is not None
        assert pt.lower_bound <= pt.predicted_value <= pt.upper_bound


def test_forecast_insufficient_data(sample_readings_series):
    with pytest.raises(InsufficientDataError):
        generate_forecast(
            readings=sample_readings_series[:5],  # Less than minimum 10
            station_id="ST-001",
            target_variable="pm25",
        )

