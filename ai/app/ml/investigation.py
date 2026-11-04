"""
STREETAIR AI Engine — Pollution Detective / Investigation Engine
==================================================================
Evidence-first multi-source investigation workflow.
Correlates station anomalies, nearby reference stations, community reports,
and external context. Strictly separates verified observations from unverified hypotheses.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from app.analytics.descriptive import readings_to_dataframe
from app.ml.anomaly_detection.detector import detect_anomalies
from app.schemas.common import DataSourceType, DataTimeRange, EvidenceType, WarningFlags
from app.schemas.investigation import (
    EvidencePiece,
    InvestigationRequest,
    InvestigationResponse,
    InvestigationSummary,
    ResponseMetadata,
)


async def conduct_investigation(
    request: InvestigationRequest,
) -> InvestigationResponse:
    """
    Synthesize multi-modal evidence into an objective investigation report.
    """
    supporting: list[EvidencePiece] = []
    contradicting: list[EvidencePiece] = []
    warnings = WarningFlags()

    # 1. Process sensor readings and anomalies
    readings = request.readings
    affected_vars: set[str] = set()
    event_start: datetime | None = None
    event_end: datetime | None = None

    if readings:
        for sid in request.station_ids:
            st_readings = [r for r in readings if r.station_id == sid]
            if not st_readings:
                continue

            # Run anomaly detector on station readings
            anomalies = detect_anomalies(st_readings, station_id=sid)
            for anom in anomalies:
                affected_vars.add(anom.affected_variable)
                if not anom.is_data_quality_issue:
                    if event_start is None or anom.time_range_start < event_start:
                        event_start = anom.time_range_start
                    if event_end is None or anom.time_range_end > event_end:
                        event_end = anom.time_range_end

                    supporting.append(
                        EvidencePiece(
                            evidence_id=f"ev_anom_{uuid.uuid4().hex[:8]}",
                            evidence_type=EvidenceType.ANOMALY,
                            description=anom.explanation,
                            is_supporting=True,
                            data_source=anom.data_source,
                            timestamp=anom.time_range_start,
                            value=anom.observed_value,
                            unit="µg/m³" if "pm" in anom.affected_variable else "",
                            station_id=sid,
                            source_label=f"Station {sid} Sensor Analysis",
                        )
                    )
                else:
                    # Sensor issue contradicts a real-world environmental event
                    contradicting.append(
                        EvidencePiece(
                            evidence_id=f"ev_sensor_{uuid.uuid4().hex[:8]}",
                            evidence_type=EvidenceType.ANOMALY,
                            description=f"Potential sensor malfunction detected at station {sid}: {anom.explanation}",
                            is_supporting=False,
                            data_source=anom.data_source,
                            timestamp=anom.time_range_start,
                            station_id=sid,
                            source_label=f"Data Quality Monitor (Station {sid})",
                        )
                    )

    # 2. Check reference stations for cross-validation
    if request.reference_station_ids and readings:
        for ref_id in request.reference_station_ids:
            ref_readings = [r for r in readings if r.station_id == ref_id]
            if ref_readings:
                ref_df = readings_to_dataframe(ref_readings)
                if "pm25" in ref_df.columns and not ref_df["pm25"].dropna().empty:
                    ref_mean = float(ref_df["pm25"].dropna().mean())
                    if ref_mean < 45.0:  # Normal clean baseline
                        contradicting.append(
                            EvidencePiece(
                                evidence_id=f"ev_ref_{uuid.uuid4().hex[:8]}",
                                evidence_type=EvidenceType.MEASUREMENT,
                                description=(
                                    f"Reference station {ref_id} recorded normal baseline PM2.5 "
                                    f"(mean: {round(ref_mean, 1)} µg/m³), indicating the elevated event "
                                    "is either strictly hyper-local or an instrument discrepancy."
                                ),
                                is_supporting=False,
                                data_source=ref_readings[0].data_source,
                                station_id=ref_id,
                                source_label=f"Reference Station {ref_id}",
                            )
                        )

    # 3. Incorporate Community Reports
    for rep in request.community_reports:
        rep_desc = rep.get("text_description", "")
        rep_loc = rep.get("location_name", "Unknown Location")
        supporting.append(
            EvidencePiece(
                evidence_id=f"ev_rep_{uuid.uuid4().hex[:8]}",
                evidence_type=EvidenceType.COMMUNITY_REPORT,
                description=f"Citizen report near {rep_loc}: '{rep_desc}'",
                is_supporting=True,
                source_label=f"Community Report ({rep.get('report_id', 'unknown')})",
            )
        )

    # 4. Synthesize Summary
    next_steps = [
        "Conduct physical calibration and zero-check on the affected station sensors.",
        "Dispatch field inspector to verify potential localized emission sources.",
        "Cross-reference wind direction data from local meteorological services.",
    ]

    has_pollution_signal = len(supporting) > 0
    contradiction_count = len(contradicting)

    if has_pollution_signal and contradiction_count == 0:
        summary_text = (
            f"Localized pollution anomaly observed across stations {request.station_ids} "
            f"between {event_start.isoformat() if event_start else 'start'} and {event_end.isoformat() if event_end else 'end'}. "
            f"Key metrics impacted: {list(affected_vars)}. Community reports correlate with elevated particulate levels."
        )
        hypothesis = "Elevated particulate concentrations suggest an active localized emission source or accumulation under calm winds."
    elif contradiction_count > 0:
        summary_text = (
            f"Inconclusive incident pattern: elevated readings at station(s) {request.station_ids} "
            f"were accompanied by {contradiction_count} contradictory indicators, including reference "
            "stations showing normal levels or potential sensor data-quality artifacts."
        )
        hypothesis = "Data suggests possible instrument drift, local obstacle interference, or hyper-local transient event."
    else:
        summary_text = f"No conclusive pollution anomaly detected across stations {request.station_ids} for the requested window."
        hypothesis = "Conditions reflect expected baseline patterns."

    time_range = DataTimeRange(
        start=request.time_range_start,
        end=request.time_range_end,
    )

    sources = [r.data_source for r in readings if r.data_source]
    data_source_types = list(set(sources)) if sources else [DataSourceType.UNKNOWN]

    warnings.contains_simulated_data = DataSourceType.SIMULATED in data_source_types
    warnings.contains_hardware_data = DataSourceType.HARDWARE in data_source_types

    return InvestigationResponse(
        metadata=ResponseMetadata(),
        station_ids=request.station_ids,
        data_time_range=time_range,
        supporting_evidence=supporting,
        contradicting_evidence=contradicting,
        summary=InvestigationSummary(
            possible_event_start=event_start,
            possible_event_end=event_end,
            affected_variables=list(affected_vars),
            affected_station_ids=request.station_ids,
            summary_text=summary_text,
            hypothesis=hypothesis,
            contradicting_evidence_summary=(
                f"{contradiction_count} contradictory or mitigating pieces of evidence noted."
                if contradiction_count > 0 else None
            ),
            next_steps=next_steps,
        ),
        web_citations=[],
        rag_citations=[],
        data_source_types=data_source_types,
        warnings=warnings,
    )

