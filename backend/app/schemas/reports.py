from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ReportCategory(str, Enum):
    smoke = "smoke"
    dust = "dust"
    waste_burning = "waste_burning"
    unusual_odour = "unusual_odour"
    industrial = "suspected_industrial_emissions"
    other = "other"


class ReportCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    category: ReportCategory
    description: str = Field(min_length=10, max_length=2000)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    # image handled via separate upload endpoint


class ReportResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    report_id: str
    submitted_by: str  # uid
    category: str
    description: str
    latitude: float
    longitude: float
    image_url: str | None = None
    status: str = "submitted"  # "submitted","under_review","verified","dismissed","duplicate"
    ai_classification: dict | None = None
    duplicate_of: str | None = None
    review_note: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ReportStatusUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: str
    review_note: str | None = None
