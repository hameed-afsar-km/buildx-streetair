"""Main API router combining all v1 endpoints."""
from __future__ import annotations
from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.devices import router as devices_router
from app.api.v1.readings import router as readings_router
from app.api.v1.ingestion import router as ingestion_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.reports import router as reports_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.ai import router as ai_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.organisations import router as organisations_router
from app.api.v1.subscriptions import router as subscriptions_router
from app.api.v1.plans import router as plans_router
from app.api.v1.usage import router as usage_router
from app.api.v1.admin import router as admin_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(devices_router)
api_v1_router.include_router(ingestion_router)
api_v1_router.include_router(readings_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(incidents_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(predictions_router)
api_v1_router.include_router(organisations_router)
api_v1_router.include_router(subscriptions_router)
api_v1_router.include_router(plans_router)
api_v1_router.include_router(usage_router)
api_v1_router.include_router(admin_router)

