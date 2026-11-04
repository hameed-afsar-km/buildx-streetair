"""
STREETAIR AI Engine — Descriptive Analytics
=============================================
Reusable, deterministic analytics functions.
All functions are pure — no side effects, no LLM calls.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

import numpy as np
import pandas as pd

from app.schemas.common import DataSourceType, SensorReading


NUMERIC_FIELDS = ["pm1", "pm25", "pm10", "temperature", "humidity", "pressure"]
UNITS = {
    "pm1": "µg/m³",
    "pm25": "µg/m³",
    "pm10": "µg/m³",
    "temperature": "°C",
    "humidity": "%RH",
    "pressure": "hPa",
    "mq135_raw": "raw ADC (uncalibrated)",
}


def readings_to_dataframe(readings: list[SensorReading]) -> pd.DataFrame:
    """Convert a list of SensorReadings to a time-indexed DataFrame."""
    rows = []
    for r in readings:
        ts = pd.Timestamp(r.timestamp)
        if ts.tzinfo is None:
            ts = ts.tz_localize("UTC")
        else:
            ts = ts.tz_convert("UTC")

        row: dict[str, Any] = {
            "station_id": r.station_id,
            "timestamp": ts,
            "data_source": r.data_source.value if r.data_source else "unknown",
        }
        for field in NUMERIC_FIELDS + ["mq135_raw"]:
            row[field] = getattr(r, field, None)
        rows.append(row)
    df = pd.DataFrame(rows)
    if not df.empty:
        df = df.sort_values("timestamp").reset_index(drop=True)
    return df


def descriptive_stats(
    readings: list[SensorReading],
    variables: list[str] | None = None,
) -> dict[str, dict[str, Any]]:
    """
    Compute descriptive statistics for each numeric variable.

    Returns:
        Dict keyed by variable name with count, mean, std, min, max,
        p25, p50, p75, missing_count, unit, data_sources.
    """
    df = readings_to_dataframe(readings)
    if df.empty:
        return {}

    targets = variables or NUMERIC_FIELDS
    result: dict[str, dict[str, Any]] = {}

    for var in targets:
        if var not in df.columns:
            continue
        series = pd.to_numeric(df[var], errors="coerce")
        valid = series.dropna()
        result[var] = {
            "variable": var,
            "unit": UNITS.get(var, "unknown"),
            "count": int(valid.count()),
            "missing_count": int(series.isna().sum()),
            "mean": round(float(valid.mean()), 3) if not valid.empty else None,
            "std": round(float(valid.std()), 3) if len(valid) > 1 else None,
            "min": round(float(valid.min()), 3) if not valid.empty else None,
            "max": round(float(valid.max()), 3) if not valid.empty else None,
            "p25": round(float(valid.quantile(0.25)), 3) if not valid.empty else None,
            "p50": round(float(valid.quantile(0.50)), 3) if not valid.empty else None,
            "p75": round(float(valid.quantile(0.75)), 3) if not valid.empty else None,
            "data_sources": df["data_source"].unique().tolist(),
        }
        # Warn about MQ-135 usage
        if var == "mq135_raw":
            result[var]["warning"] = (
                "MQ-135 is a raw uncalibrated ADC reading. "
                "It is NOT a pollutant concentration or AQI input."
            )
    return result


def daily_trends(
    readings: list[SensorReading],
    variable: str,
    timezone: str = "Asia/Kolkata",
) -> list[dict[str, Any]]:
    """
    Compute daily mean, min, max for a variable.

    Returns list of dicts: {date, mean, min, max, count, unit}.
    """
    df = readings_to_dataframe(readings)
    if df.empty or variable not in df.columns:
        return []

    df["ts_local"] = df["timestamp"].dt.tz_convert(timezone)
    df["date"] = df["ts_local"].dt.date
    series = pd.to_numeric(df[variable], errors="coerce")
    df[variable] = series

    grouped = df.groupby("date")[variable].agg(
        mean="mean", min="min", max="max", count="count"
    ).reset_index()

    return [
        {
            "date": str(row["date"]),
            "mean": round(row["mean"], 3) if not pd.isna(row["mean"]) else None,
            "min": round(row["min"], 3) if not pd.isna(row["min"]) else None,
            "max": round(row["max"], 3) if not pd.isna(row["max"]) else None,
            "count": int(row["count"]),
            "unit": UNITS.get(variable, "unknown"),
        }
        for _, row in grouped.iterrows()
    ]


def hourly_profile(
    readings: list[SensorReading],
    variable: str,
    timezone: str = "Asia/Kolkata",
) -> list[dict[str, Any]]:
    """
    Compute mean value by hour of day (0–23).
    Useful for peak-time analysis.
    """
    df = readings_to_dataframe(readings)
    if df.empty or variable not in df.columns:
        return []

    df["ts_local"] = df["timestamp"].dt.tz_convert(timezone)
    df["hour"] = df["ts_local"].dt.hour
    series = pd.to_numeric(df[variable], errors="coerce")
    df[variable] = series

    grouped = df.groupby("hour")[variable].agg(mean="mean", count="count").reset_index()

    return [
        {
            "hour": int(row["hour"]),
            "mean": round(row["mean"], 3) if not pd.isna(row["mean"]) else None,
            "count": int(row["count"]),
            "unit": UNITS.get(variable, "unknown"),
        }
        for _, row in grouped.iterrows()
    ]


def period_comparison(
    readings_a: list[SensorReading],
    readings_b: list[SensorReading],
    variable: str,
    label_a: str = "Period A",
    label_b: str = "Period B",
) -> dict[str, Any]:
    """
    Compare a variable between two time periods.
    Both must share the same data source type for a valid comparison.
    """
    def _stats(readings: list[SensorReading]) -> dict[str, Any]:
        df = readings_to_dataframe(readings)
        if df.empty or variable not in df.columns:
            return {"mean": None, "count": 0}
        s = pd.to_numeric(df[variable], errors="coerce").dropna()
        return {
            "mean": round(float(s.mean()), 3) if not s.empty else None,
            "std": round(float(s.std()), 3) if len(s) > 1 else None,
            "count": int(s.count()),
            "min": round(float(s.min()), 3) if not s.empty else None,
            "max": round(float(s.max()), 3) if not s.empty else None,
        }

    stats_a = _stats(readings_a)
    stats_b = _stats(readings_b)

    sources_a = {r.data_source for r in readings_a}
    sources_b = {r.data_source for r in readings_b}
    mixed_sources = sources_a != sources_b

    diff = None
    pct_change = None
    if stats_a["mean"] is not None and stats_b["mean"] is not None:
        diff = round(stats_b["mean"] - stats_a["mean"], 3)
        if stats_a["mean"] != 0:
            pct_change = round((diff / stats_a["mean"]) * 100, 1)

    return {
        "variable": variable,
        "unit": UNITS.get(variable, "unknown"),
        label_a: stats_a,
        label_b: stats_b,
        "absolute_difference": diff,
        "percent_change": pct_change,
        "warning": (
            "Comparison includes readings from different source types (simulated vs hardware). "
            "Interpret with caution."
        ) if mixed_sources else None,
    }


def compute_correlations(
    readings: list[SensorReading],
    variables: list[str] | None = None,
) -> dict[str, Any]:
    """
    Compute Pearson correlations between numeric variables.

    IMPORTANT: Correlation is not causation. The result includes a standard caveat.
    """
    df = readings_to_dataframe(readings)
    if df.empty:
        return {"correlations": {}, "caveat": "Insufficient data"}

    targets = variables or NUMERIC_FIELDS
    available = [v for v in targets if v in df.columns]
    numeric = df[available].apply(pd.to_numeric, errors="coerce")
    corr = numeric.corr()

    return {
        "correlations": corr.round(3).to_dict(),
        "variables": available,
        "caveat": (
            "Pearson correlation coefficient only. "
            "Correlation does not imply causation. "
            "MQ-135 raw values are uncalibrated and should not be used to infer gas concentrations."
        ),
    }


def sensor_uptime_metrics(
    readings: list[SensorReading],
    expected_interval_minutes: float = 5.0,
) -> dict[str, Any]:
    """
    Estimate sensor uptime based on observed reading gaps.

    Args:
        readings: Station readings (single station preferred).
        expected_interval_minutes: Expected time between readings.

    Returns:
        Dict with uptime_percent, gap_count, longest_gap_minutes.
    """
    df = readings_to_dataframe(readings)
    if len(df) < 2:
        return {"uptime_percent": None, "note": "Insufficient readings"}

    df = df.sort_values("timestamp")
    gaps = df["timestamp"].diff().dropna().dt.total_seconds() / 60
    expected = expected_interval_minutes
    gap_threshold = expected * 3  # 3× expected = outage

    outage_gaps = gaps[gaps > gap_threshold]
    total_expected_duration = (
        df["timestamp"].iloc[-1] - df["timestamp"].iloc[0]
    ).total_seconds() / 60

    downtime_minutes = outage_gaps.sum()
    uptime_percent = (
        max(0.0, (total_expected_duration - downtime_minutes) / total_expected_duration * 100)
        if total_expected_duration > 0 else None
    )

    return {
        "uptime_percent": round(uptime_percent, 1) if uptime_percent is not None else None,
        "gap_count": int(len(outage_gaps)),
        "longest_gap_minutes": round(float(outage_gaps.max()), 1) if not outage_gaps.empty else 0.0,
        "total_duration_minutes": round(total_expected_duration, 1),
        "reading_count": len(df),
    }

