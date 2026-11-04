"""
STREETAIR AI Engine — Community Report Classification Schemas
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import (
    ProviderMetadata,
    ReportCategory,
    ResponseMetadata,
    WarningFlags,
)


class CommunityReport(BaseModel):
    report_id: str
    submitted_at: datetime
    text_description: str = Field(..., max_length=5000)
    location_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    reported_by_user_id: str | None = None   # Backend-anonymized where required


class ReportClassificationRequest(BaseModel):
    request_id: str | None = None
    org_id: str
    reports: list[CommunityReport] = Field(..., min_length=1, max_length=100)
    # For duplicate detection, pass existing report IDs/embeddings via backend
    existing_report_ids: list[str] = Field(default_factory=list)


class ClassificationResult(BaseModel):
    report_id: str
    category: ReportCategory
    confidence: float = Field(ge=0.0, le=1.0)
    confidence_note: str    # Explain what confidence level means here
    priority_suggestion: str    # "low" | "medium" | "high"
    rationale: str
    missing_information: list[str] = Field(default_factory=list)
    duplicate_candidate_ids: list[str] = Field(default_factory=list)
    moderation_recommendation: str
    warnings: list[str] = Field(default_factory=list)


class ReportClassificationResponse(BaseModel):
    metadata: ResponseMetadata
    classifications: list[ClassificationResult]
    provider: ProviderMetadata | None = None
    warnings: WarningFlags

