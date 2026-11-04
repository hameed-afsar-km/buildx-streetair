"""
STREETAIR AI Engine — Chat Schemas
====================================
Request/response schemas for the /internal/v1/chat endpoint.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator

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


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ConversationMessage(BaseModel):
    role: MessageRole
    content: str = Field(..., max_length=8000)


class StationContext(BaseModel):
    """Authorized station context provided by the main backend."""

    station_id: str
    station_name: str | None = None
    location_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    readings: list[SensorReading] = Field(default_factory=list, max_length=500)
    data_source: DataSourceType = DataSourceType.SIMULATED


class ChatRequest(BaseModel):
    """
    Chat request body. Sent by the main backend after authorizing the user.
    The AI service must NOT trust tenant_id/org_id/user_id from the frontend directly.
    These values are pre-validated by the backend.
    """

    # Correlation / tracing
    request_id: str | None = None
    correlation_id: str | None = None

    # Authorized identity context (backend-validated)
    org_id: str
    user_id: str
    provider_preference: str | None = None   # "groq" | "ollama" | None = use default

    # Conversation history (backend-managed, backend-scoped)
    messages: list[ConversationMessage] = Field(..., min_length=1, max_length=50)

    # Authorized data context
    station_context: StationContext | None = None
    extra_context: dict[str, Any] | None = None

    # Feature flags
    enable_web_search: bool = False
    enable_rag: bool = True

    @field_validator("messages")
    @classmethod
    def _last_message_is_user(cls, v: list[ConversationMessage]) -> list[ConversationMessage]:
        if v and v[-1].role != MessageRole.USER:
            raise ValueError("The last message must be from the user")
        return v


class EvidenceItem(BaseModel):
    """A single piece of evidence in a chat response."""

    evidence_type: EvidenceType
    summary: str
    source_label: str          # Human-readable: "STREETAIR Station ST-001", "Tavily/EPA.gov", etc.
    data_source: DataSourceType | None = None
    timestamp: datetime | None = None
    value: Any | None = None
    unit: str | None = None


class ChatResponse(BaseModel):
    metadata: ResponseMetadata
    answer: str
    concise_summary: str | None = None
    evidence_items: list[EvidenceItem] = Field(default_factory=list)
    web_citations: list[Citation] = Field(default_factory=list)
    rag_citations: list[RAGCitation] = Field(default_factory=list)
    data_time_range: DataTimeRange | None = None
    station_ids: list[str] = Field(default_factory=list)
    data_source_types: list[DataSourceType] = Field(default_factory=list)
    warnings: WarningFlags = Field(default_factory=WarningFlags)
    provider: ProviderMetadata | None = None
    follow_up_suggestions: list[str] = Field(default_factory=list)

