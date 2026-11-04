"""
STREETAIR AI Engine — Scenario (What-If) Schemas
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.common import ResponseMetadata, WarningFlags


class ScenarioRequest(BaseModel):
    request_id: str | None = None
    org_id: str
    station_id: str | None = None
    scenario_type: str                      # Must be an allowlisted type
    parameters: dict[str, Any] = Field(default_factory=dict)
    baseline_values: dict[str, float] = Field(default_factory=dict)


class ScenarioModel(BaseModel):
    name: str
    version: str
    description: str


class ScenarioResponse(BaseModel):
    metadata: ResponseMetadata
    scenario_type: str
    baseline: dict[str, Any]
    assumptions: list[str]
    parameters: dict[str, Any]
    results: dict[str, Any]
    comparison: dict[str, Any]
    model: ScenarioModel
    limitations: list[str]
    generated_at: datetime
    is_illustrative_estimate: bool = True   # Always label scenario outputs
    warnings: WarningFlags

