"""
STREETAIR AI Engine — Forecasting Evaluation Metrics
======================================================
Implements standard time-series evaluation metrics: MAE, RMSE, and MAPE.
Enforces chronological train/validation/test splits (no data leakage).
"""

from __future__ import annotations

import math
from typing import TypeVar

import numpy as np

T = TypeVar("T")


def compute_mae(actual: list[float], predicted: list[float]) -> float:
    """Mean Absolute Error: (1/n) * sum(|y_true - y_pred|)"""
    if not actual or len(actual) != len(predicted):
        return 0.0
    arr_act = np.array(actual, dtype=float)
    arr_pred = np.array(predicted, dtype=float)
    return float(np.mean(np.abs(arr_act - arr_pred)))


def compute_rmse(actual: list[float], predicted: list[float]) -> float:
    """Root Mean Squared Error: sqrt((1/n) * sum((y_true - y_pred)^2))"""
    if not actual or len(actual) != len(predicted):
        return 0.0
    arr_act = np.array(actual, dtype=float)
    arr_pred = np.array(predicted, dtype=float)
    return float(np.sqrt(np.mean((arr_act - arr_pred) ** 2)))


def compute_mape(actual: list[float], predicted: list[float]) -> float | None:
    """
    Mean Absolute Percentage Error: (100/n) * sum(|(y_true - y_pred) / y_true|)
    Returns None if any actual value is zero to prevent division by zero.
    """
    if not actual or len(actual) != len(predicted):
        return None
    arr_act = np.array(actual, dtype=float)
    arr_pred = np.array(predicted, dtype=float)
    if np.any(arr_act == 0):
        return None
    return float(np.mean(np.abs((arr_act - arr_pred) / arr_act)) * 100.0)


def time_aware_split(
    items: list[T], test_fraction: float = 0.2
) -> tuple[list[T], list[T]]:
    """
    Chronological train/test split.
    Guarantees future values are never leaked into the training set.
    """
    if not items:
        return [], []
    split_idx = int(len(items) * (1.0 - test_fraction))
    split_idx = max(1, min(split_idx, len(items) - 1))
    return items[:split_idx], items[split_idx:]

