"""
STREETAIR AI Engine — Pollution Investigation Schemas
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.common import (
    Citation,
    DataSourceType,
    DataTimeRange,
    EvidenceType,
    ProviderMetadata,
    RAGCitation,
    ResponseMetadata,
    SensorReading,
    WarningFlags,
)


class InvestigationRequest(BaseModel):
    request_id: str | None = None
    org_id: str
    station_ids: list[str] = Field(..., min_length=1, max_length=20)
    time_range_start: datetime
    time_range_end: datetime
    readings: list[SensorReading] = Field(default_factory=list, max_length=50_000)
    community_reports: list[dict[str, Any]] = Field(default_factory=list, max_length=100)
    reference_station_ids: list[str] = Field(default_factory=list)
    enable_web_research: bool = False


class EvidencePiece(BaseModel):
    evidence_id: str
    evidence_type: EvidenceType
    description: str
    is_supporting: bool         # True = supports incident; False = contradicts/neutral
    data_source: DataSourceType | None = None
    timestamp: datetime | None = None
    value: Any | None = None
    unit: str | None = None
    station_id: str | None = None
    source_label: str | None = None


class InvestigationSummary(BaseModel):
    possible_event_start: datetime | None = None
    possible_event_end: datetime | None = None
    affected_variables: list[str]
    affected_station_ids: list[str]
    summary_text: str           # Cautious, evidence-grounded narrative
    hypothesis: str | None = None
    contradicting_evidence_summary: str | None = None
    next_steps: list[str] = Field(default_factory=list)
    unverified_note: str = (
        "This investigation is based on available data and statistical analysis. "
        "No specific pollution source has been verified. Field inspection is recommended."
    )


class InvestigationResponse(BaseModel):
    metadata: ResponseMetadata
    station_ids: list[str]
    data_time_range: DataTimeRange
    supporting_evidence: list[EvidencePiece]
    contradicting_evidence: list[EvidencePiece]
    summary: InvestigationSummary
    web_citations: list[Citation] = Field(default_factory=list)
    rag_citations: list[RAGCitation] = Field(default_factory=list)
    data_source_types: list[DataSourceType]
    provider: ProviderMetadata | None = None
    warnings: WarningFlags

