"""
AQI Calculation Service — India CPCB National AQI Standard (2014).

Standard: Central Pollution Control Board (CPCB), India.
Pollutants used in this implementation: PM2.5 (24h avg) and PM10 (24h avg).
NOTE: For demonstration with simulated point-in-time readings (not 24h averages),
the AQI is computed from instantaneous readings and is LABELLED as 
simulated/indicative. It does NOT represent regulatory compliance measurement.

MQ-135 raw ADC values are stored as-is and are NOT used for AQI calculation
because they represent un-calibrated sensor output.
"""
from __future__ import annotations
from dataclasses import dataclass

@dataclass
class Breakpoint:
    c_low: float
    c_high: float
    i_low: int
    i_high: int

# CPCB India PM2.5 breakpoints (µg/m³, 24h average)
PM25_BREAKPOINTS = [
    Breakpoint(0.0, 30.0, 0, 50),
    Breakpoint(30.0, 60.0, 51, 100),
    Breakpoint(60.0, 90.0, 101, 200),
    Breakpoint(90.0, 120.0, 201, 300),
    Breakpoint(120.0, 250.0, 301, 400),
    Breakpoint(250.0, 999.0, 401, 500),
]

# CPCB India PM10 breakpoints (µg/m³, 24h average)
PM10_BREAKPOINTS = [
    Breakpoint(0.0, 50.0, 0, 50),
    Breakpoint(50.0, 100.0, 51, 100),
    Breakpoint(100.0, 250.0, 101, 200),
    Breakpoint(250.0, 350.0, 201, 300),
    Breakpoint(350.0, 430.0, 301, 400),
    Breakpoint(430.0, 999.0, 401, 500),
]

AQI_CATEGORIES = [
    (0, 50, "Good"),
    (51, 100, "Satisfactory"),
    (101, 200, "Moderate"),
    (201, 300, "Poor"),
    (301, 400, "Very Poor"),
    (401, 500, "Severe"),
]

STANDARD = "CPCB_INDIA_2014"
STANDARD_VERSION = "1.0"


def _sub_index(concentration: float, breakpoints: list[Breakpoint]) -> float | None:
    """Calculate sub-index for a pollutant concentration."""
    for bp in breakpoints:
        if bp.c_low <= concentration <= bp.c_high:
            return (
                (bp.i_high - bp.i_low) / (bp.c_high - bp.c_low)
                * (concentration - bp.c_low)
                + bp.i_low
            )
    return None


def _get_category(aqi_value: float) -> str:
    for lo, hi, cat in AQI_CATEGORIES:
        if lo <= aqi_value <= hi:
            return cat
    return "Severe"


def calculate_aqi(
    pm25: float | None,
    pm10: float | None,
    is_simulated: bool = True,
) -> dict:
    """
    Calculate CPCB India AQI from PM2.5 and PM10 readings.
    
    Returns a dict compatible with AQIResult schema.
    Does NOT use MQ-135 raw values.
    """
    sub_indices: dict[str, float] = {}
    
    if pm25 is not None and pm25 >= 0:
        si = _sub_index(pm25, PM25_BREAKPOINTS)
        if si is not None:
            sub_indices["pm25"] = si
    
    if pm10 is not None and pm10 >= 0:
        si = _sub_index(pm10, PM10_BREAKPOINTS)
        if si is not None:
            sub_indices["pm10"] = si
    
    if not sub_indices:
        return {
            "value": None,
            "category": None,
            "dominant_pollutant": None,
            "standard": STANDARD,
            "is_simulated": is_simulated,
            "calculable": False,
            "limitation_note": (
                "AQI could not be calculated: no valid PM2.5 or PM10 reading available. "
                "MQ-135 raw ADC output is not used for AQI calculation."
            ),
        }
    
    # AQI is the maximum sub-index (CPCB method)
    dominant = max(sub_indices, key=sub_indices.get)
    aqi_value = round(sub_indices[dominant], 1)
    category = _get_category(aqi_value)
    
    limitation_note = None
    if is_simulated:
        limitation_note = (
            "This AQI is derived from simulated/instantaneous readings, NOT 24-hour "
            "averages as required by the CPCB standard. It is indicative only and does "
            "not represent regulatory compliance measurement."
        )
    
    return {
        "value": aqi_value,
        "category": category,
        "dominant_pollutant": dominant,
        "standard": STANDARD,
        "is_simulated": is_simulated,
        "calculable": True,
        "limitation_note": limitation_note,
    }

