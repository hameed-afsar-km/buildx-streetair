from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class ErrorDetail(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    field: str
    message: str


class ErrorResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    error_code: str
    message: str
    request_id: str | None = None
    details: list[ErrorDetail] | None = None


class PaginatedResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(populate_by_name=True)

    items: list[T]
    total: int | None = None
    next_cursor: str | None = None
    has_more: bool = False
    limit: int


class HealthResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: str  # "healthy" | "degraded" | "unhealthy"
    version: str = "1.0.0"
    environment: str
    timestamp: datetime
    services: dict[str, str]  # service_name -> status


class TimestampMixin(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    created_at: datetime
    updated_at: datetime
