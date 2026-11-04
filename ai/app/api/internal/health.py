"""
STREETAIR AI Engine — Internal Health Endpoint
================================================
Exposes system readiness and model provider health without leaking secrets.
"""

from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, Depends

from app.core.config import get_settings
from app.core.logging import get_logger
from app.core.security import verify_internal_token
from app.providers.provider_manager import get_provider_manager

logger = get_logger(__name__)

router = APIRouter(prefix="/internal/v1", tags=["Health"])


@router.get("/health")
async def health_check() -> dict[str, Any]:
    """
    Public basic liveness probe (no secret auth required for simple ping).
    """
    settings = get_settings()
    return {
        "status": "healthy",
        "service": "streetair-ai",
        "version": settings.ai_service_version,
        "environment": settings.ai_service_env.value,
        "timestamp": time.time(),
    }


@router.get("/readiness", dependencies=[Depends(verify_internal_token)])
async def readiness_check() -> dict[str, Any]:
    """
    Internal authenticated readiness probe. Checks LLM provider connectivity.
    """
    settings = get_settings()
    manager = get_provider_manager()
    provider_statuses = await manager.health_check_all()

    return {
        "status": "ready",
        "service": "streetair-ai",
        "version": settings.ai_service_version,
        "default_provider": settings.ai_default_provider.value,
        "providers": [
            {
                "provider": p.provider,
                "available": p.available,
                "model": p.model,
                "latency_ms": p.latency_ms,
                "error": p.error,
            }
            for p in provider_statuses
        ],
        "rag_configured": settings.vector_store_provider.value,
        "tavily_configured": settings.tavily_configured,
    }

