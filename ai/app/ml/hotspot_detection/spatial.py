"""
STREETAIR AI Engine — Spatial Hotspot Analysis
================================================
Identifies spatial clusters of elevated pollution readings with strict
station density safeguards and transparent interpolation limitations.
"""

from __future__ import annotations

import math
from datetime import UTC, datetime
from typing import Any

from app.analytics.descriptive import UNITS, readings_to_dataframe
from app.schemas.common import DataSourceType, DataTimeRange, SensorReading, WarningFlags
from app.schemas.hotspot import HotspotCluster, HotspotResponse, ResponseMetadata


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on the earth in km."""
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def detect_hotspots(
    readings: list[SensorReading],
    target_variable: str = "pm25",
    percentile_threshold: float = 75.0,
    cluster_radius_km: float = 5.0,
) -> HotspotResponse:
    """
    Compute station averages and group elevated readings into geographic clusters.
    """
    warnings = WarningFlags()
    geolocated_readings = [
        r for r in readings if r.latitude is not None and r.longitude is not None
    ]

    unique_stations = {r.station_id for r in geolocated_readings}
    low_coverage = len(unique_stations) < 3

    if low_coverage:
        warnings.low_station_coverage = True

    if not geolocated_readings:
        return HotspotResponse(
            metadata=ResponseMetadata(warnings=["No geolocated readings available for hotspot detection."]),
            target_variable=target_variable,
            unit=UNITS.get(target_variable, "µg/m³"),
            data_time_range=DataTimeRange(start=datetime.now(UTC), end=datetime.now(UTC)),
            hotspot_clusters=[],
            total_stations_analyzed=0,
            method="haversine_density_clustering",
            warnings=warnings,
        )

    # Aggregate by station
    station_data: dict[str, dict[str, Any]] = {}
    timestamps = []
    sources = set()

    for r in geolocated_readings:
        val = getattr(r, target_variable, None)
        if val is None:
            continue
        timestamps.append(r.timestamp)
        sources.add(r.data_source)

        sid = r.station_id
        if sid not in station_data:
            station_data[sid] = {
                "station_id": sid,
                "lat": r.latitude,
                "lon": r.longitude,
                "values": [],
                "source": r.data_source,
            }
        station_data[sid]["values"].append(val)

    if not station_data:
        return HotspotResponse(
            metadata=ResponseMetadata(warnings=["Target variable has no values in geolocated readings."]),
            target_variable=target_variable,
            unit=UNITS.get(target_variable, "µg/m³"),
            data_time_range=DataTimeRange(start=datetime.now(UTC), end=datetime.now(UTC)),
            hotspot_clusters=[],
            total_stations_analyzed=0,
            method="haversine_density_clustering",
            warnings=warnings,
        )

    # Compute mean per station
    summaries = []
    all_means = []
    for sid, d in station_data.items():
        mean_v = sum(d["values"]) / len(d["values"])
        all_means.append(mean_v)
        summaries.append({
            "station_id": sid,
            "lat": d["lat"],
            "lon": d["lon"],
            "mean": mean_v,
            "max": max(d["values"]),
            "source": d["source"],
        })

    all_means.sort()
    cutoff_idx = int(len(all_means) * (percentile_threshold / 100.0))
    cutoff_val = all_means[min(cutoff_idx, len(all_means) - 1)]

    # Filter candidate stations above cutoff
    elevated = [s for s in summaries if s["mean"] >= cutoff_val]

    # Cluster elevated stations using simple spatial distance threshold
    clusters: list[list[dict[str, Any]]] = []
    for s in elevated:
        assigned = False
        for c in clusters:
            # Check distance to any station in cluster
            if any(haversine_distance_km(s["lat"], s["lon"], other["lat"], other["lon"]) <= cluster_radius_km for other in c):
                c.append(s)
                assigned = True
                break
        if not assigned:
            clusters.append([s])

    # Convert to HotspotCluster schemas
    hotspot_clusters: list[HotspotCluster] = []
    for idx, c in enumerate(clusters):
        avg_lat = sum(s["lat"] for s in c) / len(c)
        avg_lon = sum(s["lon"] for s in c) / len(c)
        c_means = [s["mean"] for s in c]
        c_maxes = [s["max"] for s in c]
        station_ids = [s["station_id"] for s in c]

        c_source = c[0]["source"] if all(s["source"] == c[0]["source"] for s in c) else DataSourceType.MIXED

        cov_note = (
            f"Cluster defined by {len(c)} monitoring station(s). "
            + ("Sparse coverage caveat: Do not extrapolate to wider surrounding area without field confirmation." if len(c) < 3 else "Moderate coverage.")
        )

        hotspot_clusters.append(
            HotspotCluster(
                cluster_id=f"hotspot_c{idx+1}",
                station_ids=station_ids,
                centroid_latitude=round(avg_lat, 5),
                centroid_longitude=round(avg_lon, 5),
                mean_value=round(sum(c_means) / len(c_means), 2),
                max_value=round(max(c_maxes), 2),
                percentile_rank=percentile_threshold,
                station_count=len(c),
                data_source=c_source,
                coverage_note=cov_note,
            )
        )

    time_range = DataTimeRange(
        start=min(timestamps) if timestamps else datetime.now(UTC),
        end=max(timestamps) if timestamps else datetime.now(UTC),
    )

    warnings.contains_simulated_data = any(s == DataSourceType.SIMULATED for s in sources)
    warnings.contains_hardware_data = any(s == DataSourceType.HARDWARE for s in sources)

    return HotspotResponse(
        metadata=ResponseMetadata(
            warnings=[
                "Hotspots reflect point measurements. Unmonitored locations between stations are not verified."
            ]
        ),
        target_variable=target_variable,
        unit=UNITS.get(target_variable, "µg/m³"),
        data_time_range=time_range,
        hotspot_clusters=hotspot_clusters,
        total_stations_analyzed=len(station_data),
        method="haversine_density_clustering",
        warnings=warnings,
    )

