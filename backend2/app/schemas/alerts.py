from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.readings import LocationSnapshot


class AlertResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    alert_id: str
    station_id: str
    organisation_id: str | None = None
    alert_type: str  # "threshold","station_offline","anomaly","manual"
    severity: str  # "info","warning","critical"
    title: str
    description: str
    triggered_at: datetime
    status: str = "active"  # "active","acknowledged","resolved","suppressed"
    source: str = "threshold_rule"
    evidence: dict = Field(default_factory=dict)
    created_at: datetime | None = None
    updated_at: datetime | None = None


class AlertAcknowledge(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    note: str | None = None


class IncidentCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    organisation_id: str | None = None
    station_ids: list[str] = Field(default_factory=list)
    location: LocationSnapshot | None = None
    category: str  # "industrial","construction","traffic","waste_burning","natural","unknown"
    severity: str  # "low","medium","high","critical"
    description: str = Field(min_length=10, max_length=2000)


class IncidentResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    incident_id: str
    organisation_id: str | None = None
    station_ids: list[str] = Field(default_factory=list)
    location: LocationSnapshot | None = None
    category: str
    severity: str
    description: str
    evidence: dict = Field(default_factory=dict)
    investigation_status: str = "open"  # "open","investigating","resolved","closed"
    verification_status: str = "unverified"  # "unverified","ai_flagged","human_verified","disputed"
    assigned_to: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    resolved_at: datetime | None = None
