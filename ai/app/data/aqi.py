"""
STREETAIR AI Engine — CPCB India AQI Calculator
=================================================
Implements the Indian Central Pollution Control Board (CPCB)
National Ambient Air Quality Index.

Reference: CPCB AQI Technical Document (2014) and updates.
Only PM2.5 and PM10 are computed here as the ESP32 platform
measures these directly. Other sub-indices require pollutant-specific
instrumentation not currently deployed.

IMPORTANT:
- MQ-135 raw ADC values are NOT used in AQI calculations.
- Do not mix CPCB breakpoints with US EPA or other national standards.
- AQI is returned as None when required averaging window data is unavailable.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import NamedTuple

import numpy as np


class AQICategory(str, Enum):
    GOOD = "Good"
    SATISFACTORY = "Satisfactory"
    MODERATE = "Moderate"
    POOR = "Poor"
    VERY_POOR = "Very Poor"
    SEVERE = "Severe"
    UNAVAILABLE = "Unavailable"


@dataclass
class AQIResult:
    """Result of a CPCB AQI calculation."""
    aqi: int | None                 # None if insufficient data
    category: AQICategory
    dominant_pollutant: str | None  # Pollutant with highest sub-index
    sub_indices: dict[str, int | None]
    units: dict[str, str]
    averaging_period_hours: dict[str, int]
    data_gaps: list[str]            # Pollutants missing averaging-window data
    note: str = ""


class _Breakpoint(NamedTuple):
    bp_lo: float   # Concentration lower bound (inclusive)
    bp_hi: float   # Concentration upper bound (inclusive)
    aqi_lo: int    # AQI lower bound
    aqi_hi: int    # AQI upper bound


# ---------------------------------------------------------------------------
# CPCB breakpoints (µg/m³)
# ---------------------------------------------------------------------------
_PM25_BREAKPOINTS: list[_Breakpoint] = [
    _Breakpoint(0,    30,    0,   50),
    _Breakpoint(31,   60,   51,  100),
    _Breakpoint(61,   90,  101,  200),
    _Breakpoint(91,  120,  201,  300),
    _Breakpoint(121, 250,  301,  400),
    _Breakpoint(251, 500,  401,  500),
]

_PM10_BREAKPOINTS: list[_Breakpoint] = [
    _Breakpoint(0,    50,    0,   50),
    _Breakpoint(51,  100,   51,  100),
    _Breakpoint(101, 250,  101,  200),
    _Breakpoint(251, 350,  201,  300),
    _Breakpoint(351, 430,  301,  400),
    _Breakpoint(431, 600,  401,  500),
]

_AQI_CATEGORIES: list[tuple[int, int, AQICategory]] = [
    (0,    50,  AQICategory.GOOD),
    (51,   100, AQICategory.SATISFACTORY),
    (101,  200, AQICategory.MODERATE),
    (201,  300, AQICategory.POOR),
    (301,  400, AQICategory.VERY_POOR),
    (401,  500, AQICategory.SEVERE),
]


def _sub_index(concentration: float, breakpoints: list[_Breakpoint]) -> int | None:
    """
    Compute CPCB sub-index using linear interpolation between breakpoints.
    Returns None if concentration is outside all defined breakpoint ranges.
    """
    for bp in breakpoints:
        if bp.bp_lo <= concentration <= bp.bp_hi:
            # Linear interpolation formula from CPCB technical document
            si = (
                (bp.aqi_hi - bp.aqi_lo) / (bp.bp_hi - bp.bp_lo)
            ) * (concentration - bp.bp_lo) + bp.aqi_lo
            return round(si)
    return None  # Out of range


def _category_for_aqi(aqi: int) -> AQICategory:
    for lo, hi, cat in _AQI_CATEGORIES:
        if lo <= aqi <= hi:
            return cat
    return AQICategory.SEVERE


def compute_cpcb_aqi(
    pm25_24h_avg: float | None,
    pm10_24h_avg: float | None,
) -> AQIResult:
    """
    Compute CPCB National AQI from 24-hour averaged PM2.5 and PM10.

    Args:
        pm25_24h_avg: 24-hour rolling average PM2.5 in µg/m³. None if unavailable.
        pm10_24h_avg: 24-hour rolling average PM10 in µg/m³. None if unavailable.

    Returns:
        AQIResult with overall AQI (or None), category, and sub-indices.
    """
    sub_indices: dict[str, int | None] = {}
    data_gaps: list[str] = []

    if pm25_24h_avg is not None:
        sub_indices["PM2.5"] = _sub_index(pm25_24h_avg, _PM25_BREAKPOINTS)
        if sub_indices["PM2.5"] is None:
            data_gaps.append(f"PM2.5 value {pm25_24h_avg} µg/m³ is outside CPCB breakpoint range")
    else:
        sub_indices["PM2.5"] = None
        data_gaps.append("PM2.5 24-hour average not available")

    if pm10_24h_avg is not None:
        sub_indices["PM10"] = _sub_index(pm10_24h_avg, _PM10_BREAKPOINTS)
        if sub_indices["PM10"] is None:
            data_gaps.append(f"PM10 value {pm10_24h_avg} µg/m³ is outside CPCB breakpoint range")
    else:
        sub_indices["PM10"] = None
        data_gaps.append("PM10 24-hour average not available")

    valid_subs = {k: v for k, v in sub_indices.items() if v is not None}

    if not valid_subs:
        return AQIResult(
            aqi=None,
            category=AQICategory.UNAVAILABLE,
            dominant_pollutant=None,
            sub_indices=sub_indices,
            units={"PM2.5": "µg/m³", "PM10": "µg/m³"},
            averaging_period_hours={"PM2.5": 24, "PM10": 24},
            data_gaps=data_gaps,
            note="Insufficient data to compute CPCB AQI.",
        )

    overall_aqi = max(valid_subs.values())
    dominant = max(valid_subs, key=lambda k: valid_subs[k])  # type: ignore[return-value]

    return AQIResult(
        aqi=overall_aqi,
        category=_category_for_aqi(overall_aqi),
        dominant_pollutant=dominant,
        sub_indices=sub_indices,
        units={"PM2.5": "µg/m³", "PM10": "µg/m³"},
        averaging_period_hours={"PM2.5": 24, "PM10": 24},
        data_gaps=data_gaps,
        note=(
            "CPCB National AQI computed from PM2.5 and PM10 only. "
            "MQ-135 raw values are not used in this calculation. "
            "Full CPCB AQI requires additional pollutant measurements "
            "(NO2, SO2, O3, CO, NH3, Pb) for a complete index."
        ),
    )


def compute_rolling_aqi(
    timestamps: list,
    pm25_values: list[float | None],
    pm10_values: list[float | None],
    window_hours: int = 24,
) -> list[AQIResult]:
    """
    Compute CPCB AQI for each point using a rolling 24-hour window.

    Returns one AQIResult per timestamp. Points with insufficient window
    history return AQI=None.
    """
    import pandas as pd

    df = pd.DataFrame({
        "ts": pd.to_datetime(timestamps, utc=True),
        "pm25": pm25_values,
        "pm10": pm10_values,
    }).sort_values("ts").reset_index(drop=True)

    results = []
    for i, row in df.iterrows():
        window_start = row["ts"] - pd.Timedelta(hours=window_hours)
        window = df[(df["ts"] >= window_start) & (df["ts"] <= row["ts"])]
        pm25_avg = window["pm25"].dropna().mean() if not window["pm25"].dropna().empty else None
        pm10_avg = window["pm10"].dropna().mean() if not window["pm10"].dropna().empty else None
        results.append(compute_cpcb_aqi(
            pm25_24h_avg=float(pm25_avg) if pm25_avg is not None and not np.isnan(pm25_avg) else None,
            pm10_24h_avg=float(pm10_avg) if pm10_avg is not None and not np.isnan(pm10_avg) else None,
        ))
    return results

