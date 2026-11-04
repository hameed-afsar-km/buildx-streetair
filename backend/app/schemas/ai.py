from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.readings import AQIResult, SensorValues


class ChatMessage(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    role: str  # "user" | "assistant"
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    message: str = Field(min_length=1, max_length=2000)
    conversation_id: str | None = None
    provider: str = "groq"  # "groq" | "ollama"
    station_context: str | None = None  # station_id for data context
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)


class CitationSource(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str
    url: str
    date: str | None
    source_type: str  # "streetair_data" | "rag" | "tavily" | "ai_interpretation"


class ChatResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    conversation_id: str
    message_id: str
    content: str
    provider: str
    model: str | None
    citations: list[CitationSource]
    created_at: datetime


class ScenarioRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    scenario_id: str  # one of nine defined scenarios
    station_id: str


class ScenarioResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    scenario_id: str
    scenario_name: str
    description: str
    expected_readings: SensorValues
    aqi_estimate: AQIResult | None
    health_advisory: str | None


class PredictionResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, protected_namespaces=())

    prediction_id: str
    station_id: str
    generated_at: datetime
    forecast_horizon_hours: int
    pollutant: str
    predicted_values: list[dict]  # [{timestamp, value, uncertainty}]
    model_version: str | None
    source_reading_window: dict  # {start, end, count}
    data_source_context: str
    is_forecast: bool = True
