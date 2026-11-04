"""AI Engine integration endpoints."""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request
from app.core.dependencies import require_authenticated_user
from app.schemas.auth import UserContext
from app.schemas.ai import ChatRequest, ChatResponse, ScenarioRequest, ScenarioResponse
from app.integrations.ai_engine.client import ai_engine_client
from app.integrations.firebase import get_firestore
from app.repositories.predictions_repository import ConversationsRepository, ConversationMessagesRepository
from app.repositories.subscriptions_repository import UsageRecordsRepository
from app.services.subscription_service import SubscriptionService
from app.repositories.subscriptions_repository import PlansRepository, SubscriptionsRepository

router = APIRouter(prefix="/ai", tags=["AI Engine"])


def get_subscription_service() -> SubscriptionService:
    db = get_firestore()
    return SubscriptionService(PlansRepository(db), SubscriptionsRepository(db), UsageRecordsRepository(db))


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    payload: ChatRequest,
    request: Request,
    user: UserContext = Depends(require_authenticated_user),
):
    """
    Interact with the STREETAIR Environmental Intelligence Assistant.
    Calls internal AI service with Groq or Ollama; tracks credit usage.
    """
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    subs_service = get_subscription_service()
    await subs_service.record_usage(
        uid=user.uid,
        organisation_id=user.organisation_id,
        metric="ai_chat_queries",
        quantity=1,
        source="api",
    )

    conv_id = payload.conversation_id or str(uuid.uuid4())
    station_ctx = None
    if payload.station_context:
        station_ctx = {"station_id": payload.station_context}

    ai_res = await ai_engine_client.chat(
        message=payload.message,
        provider=payload.provider,
        conversation_id=conv_id,
        history=[msg.model_dump() for msg in payload.history],
        station_context=station_ctx,
        request_id=request_id,
    )

    return ChatResponse(
        conversation_id=conv_id,
        message_id=ai_res.get("message_id", str(uuid.uuid4())),
        content=ai_res.get("content", ""),
        provider=ai_res.get("provider", payload.provider),
        model=ai_res.get("model"),
        citations=ai_res.get("citations", []),
        created_at=datetime.now(timezone.utc),
    )


@router.post("/scenarios", response_model=ScenarioResponse)
async def get_scenario_metadata(
    payload: ScenarioRequest,
    user: UserContext = Depends(require_authenticated_user),
):
    """Get metadata and expected sensor values for one of nine demonstration scenarios."""
    scenarios_meta = {
        "normal": ("Normal Air Quality", "Baseline environmental conditions in green campus.", {"pm25": 25.0, "pm10": 45.0, "temperature": 28.0, "humidity": 60.0}),
        "traffic_congestion": ("Traffic Congestion", "Elevated particulate matter from GST Road rush hour.", {"pm25": 115.0, "pm10": 190.0, "temperature": 31.0, "humidity": 55.0}),
        "construction_dust": ("Construction Dust", "Coarse dust particles from campus expansion work.", {"pm25": 75.0, "pm10": 320.0, "temperature": 32.0, "humidity": 50.0}),
        "industrial_emissions": ("Industrial Emissions", "Plume dispersion from Maraimalai Nagar cluster.", {"pm25": 160.0, "pm10": 240.0, "mq135_raw": 1850}),
        "waste_burning": ("Waste Burning", "Localized smoke and incomplete combustion plume.", {"pm25": 280.0, "pm10": 390.0, "mq135_raw": 2200}),
        "high_humidity": ("High Humidity / Mist", "Hygroscopic growth causing elevated optical sensor readings.", {"pm25": 55.0, "pm10": 80.0, "humidity": 92.0}),
        "smoke_event": ("Smoke Event", "Dense smoke particulate concentration.", {"pm25": 310.0, "pm10": 420.0, "mq135_raw": 2450}),
        "pollution_dispersal": ("Pollution Dispersal", "Breezy conditions rapidly cleansing the local airshed.", {"pm25": 18.0, "pm10": 30.0, "temperature": 27.0}),
        "extreme_pollution": ("Extreme Pollution", "Severe multi-source inversion event.", {"pm25": 440.0, "pm10": 580.0, "mq135_raw": 3100}),
    }

    sc = scenarios_meta.get(payload.scenario_id, ("Custom Scenario", "Simulated scenario", {"pm25": 50.0, "pm10": 80.0}))
    return ScenarioResponse(
        scenario_id=payload.scenario_id,
        scenario_name=sc[0],
        description=sc[1],
        expected_readings=sc[2],
        aqi_estimate=None,
        health_advisory="Demonstration scenario only — not verified regulatory data.",
    )

