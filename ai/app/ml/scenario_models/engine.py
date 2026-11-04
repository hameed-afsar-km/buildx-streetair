"""
STREETAIR AI Engine — What-If City Simulator Engine
=====================================================
Deterministic scenario simulation engine for urban environmental interventions.
Never invents calculations via LLMs. Guarantees reproducible, audit-traceable outputs.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from app.core.errors import UnsupportedScenarioError
from app.schemas.common import WarningFlags
from app.schemas.scenario import (
    ResponseMetadata,
    ScenarioModel,
    ScenarioRequest,
    ScenarioResponse,
)

# Supported Scenario Types
SUPPORTED_SCENARIOS = {
    "traffic_reduction",
    "construction_dust_control",
    "open_burning_reduction",
    "additional_monitoring_stations",
}


def simulate_scenario(request: ScenarioRequest) -> ScenarioResponse:
    """
    Execute a deterministic What-If scenario calculation.
    """
    stype = request.scenario_type
    params = request.parameters
    baseline = request.baseline_values

    if stype not in SUPPORTED_SCENARIOS:
        raise UnsupportedScenarioError(stype)

    now = datetime.now(UTC)

    if stype == "traffic_reduction":
        # Inputs: reduction_percent (0-100), baseline_pm25, baseline_pm10
        pct = float(params.get("reduction_percent", 20.0))
        pct = max(0.0, min(100.0, pct))
        base_pm25 = float(baseline.get("pm25", 85.0))
        base_pm10 = float(baseline.get("pm10", 160.0))

        # Scientific basis: In Indian metropolitan urban airsheds, on-road transport
        # contributes ~25-30% to primary ambient PM2.5 and ~20% to PM10 (TERI / CPCB source apportionment).
        transport_pm25_share = 0.28
        transport_pm10_share = 0.20

        pm25_reduction = base_pm25 * transport_pm25_share * (pct / 100.0)
        pm10_reduction = base_pm10 * transport_pm10_share * (pct / 100.0)

        results = {
            "estimated_pm25_reduction": round(pm25_reduction, 2),
            "estimated_pm10_reduction": round(pm10_reduction, 2),
            "projected_pm25": round(base_pm25 - pm25_reduction, 2),
            "projected_pm10": round(base_pm10 - pm10_reduction, 2),
            "unit": "µg/m³",
        }
        comparison = {
            "pm25_pct_drop": round((pm25_reduction / base_pm25) * 100, 1) if base_pm25 > 0 else 0,
            "pm10_pct_drop": round((pm10_reduction / base_pm10) * 100, 1) if base_pm10 > 0 else 0,
        }
        assumptions = [
            "Assumes vehicular traffic contributes 28% of ambient PM2.5 and 20% of PM10 in urban airshed.",
            "Linear proportional scaling assumed between fleet volume reduction and tailpipe exhaust.",
            "Meteorological factors (inversion, wind dispersion) held constant.",
        ]
        limitations = [
            "Does not account for non-tailpipe brake and tyre wear emissions.",
            "Does not model cold-start vehicle idling or localized congestion bottlenecks.",
        ]
        model_info = ScenarioModel(
            name="UrbanAirshedTransportApportionmentModel",
            version="1.0.0",
            description="Source apportionment linear screening model based on CPCB/TERI urban airshed studies.",
        )

    elif stype == "construction_dust_control":
        # Inputs: control_effectiveness_percent (0-100), baseline_pm10
        eff = float(params.get("control_effectiveness_percent", 50.0))
        eff = max(0.0, min(100.0, eff))
        base_pm10 = float(baseline.get("pm10", 180.0))
        construction_pm10_share = 0.35  # Approx 35% of coarse PM10 in active development zones

        pm10_reduction = base_pm10 * construction_pm10_share * (eff / 100.0)
        results = {
            "estimated_pm10_reduction": round(pm10_reduction, 2),
            "projected_pm10": round(base_pm10 - pm10_reduction, 2),
            "unit": "µg/m³",
        }
        comparison = {
            "pm10_pct_drop": round((pm10_reduction / base_pm10) * 100, 1) if base_pm10 > 0 else 0,
        }
        assumptions = [
            "Construction & demolition activities contribute 35% of ambient PM10 in targeted micro-environment.",
            "Water spraying, anti-smog guns, and wind barrier netting operate continuously during working hours.",
        ]
        limitations = [
            "Re-suspension of settled road dust by subsequent heavy machinery is not modeled.",
        ]
        model_info = ScenarioModel(
            name="ConstructionDustSuppressionModel",
            version="1.0.0",
            description="Engineering estimate of anti-smog and dust suppression efficacy.",
        )

    elif stype == "open_burning_reduction":
        pct = float(params.get("reduction_percent", 50.0))
        pct = max(0.0, min(100.0, pct))
        base_pm25 = float(baseline.get("pm25", 110.0))
        burning_share = 0.22  # Biomass & waste burning contribution during seasonal peaks

        pm25_reduction = base_pm25 * burning_share * (pct / 100.0)
        results = {
            "estimated_pm25_reduction": round(pm25_reduction, 2),
            "projected_pm25": round(base_pm25 - pm25_reduction, 2),
            "unit": "µg/m³",
        }
        comparison = {
            "pm25_pct_drop": round((pm25_reduction / base_pm25) * 100, 1) if base_pm25 > 0 else 0,
        }
        assumptions = [
            "Open solid waste and biomass burning accounts for 22% of localized PM2.5 smoke plumes.",
            "Complete municipal enforcement in target municipal ward.",
        ]
        limitations = [
            "Transboundary smoke drift from surrounding agricultural fires outside the ward boundary is excluded.",
        ]
        model_info = ScenarioModel(
            name="BiomassWasteBurningMitigationModel",
            version="1.0.0",
            description="Empirical screening model for localized open burning curbs.",
        )

    elif stype == "additional_monitoring_stations":
        new_stations = int(params.get("station_count", 5))
        area_km2 = float(params.get("area_km2", 100.0))
        existing_stations = int(baseline.get("existing_stations", 2))

        total_stations = existing_stations + new_stations
        density_before = existing_stations / area_km2 if area_km2 > 0 else 0
        density_after = total_stations / area_km2 if area_km2 > 0 else 0
        coverage_gain_pct = ((density_after - density_before) / density_before * 100) if density_before > 0 else 100.0

        results = {
            "existing_stations": existing_stations,
            "new_stations_added": new_stations,
            "total_stations": total_stations,
            "monitoring_density_before_per_100km2": round(density_before * 100, 2),
            "monitoring_density_after_per_100km2": round(density_after * 100, 2),
            "spatial_coverage_increase_percent": round(coverage_gain_pct, 1),
        }
        comparison = {
            "density_multiplier": round(density_after / density_before, 2) if density_before > 0 else None,
        }
        assumptions = [
            "New sensor nodes are evenly distributed across the municipal footprint.",
            "Nodes maintain uniform telemetry uptime and standard sensor specifications.",
        ]
        limitations = [
            "Increasing monitoring density records pollution more accurately but does not in itself reduce emissions.",
        ]
        model_info = ScenarioModel(
            name="SpatialMonitoringGridExpansionModel",
            version="1.0.0",
            description="Geometric spatial coverage and monitoring density projection model.",
        )

    return ScenarioResponse(
        metadata=ResponseMetadata(warnings=["Scenario results are deterministic projections, not empirical sensor readings."]),
        scenario_type=stype,
        baseline=baseline,
        assumptions=assumptions,
        parameters=params,
        results=results,
        comparison=comparison,
        model=model_info,
        limitations=limitations,
        generated_at=now,
        is_illustrative_estimate=True,
        warnings=WarningFlags(),
    )

