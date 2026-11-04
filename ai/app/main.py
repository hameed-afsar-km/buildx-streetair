"""
STREETAIR AI Engine — FastAPI Application Factory
===================================================
Initializes application, middleware, structured logging, exception handlers,
and registers all internal API routers.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.internal.anomaly import router as anomaly_router
from app.api.internal.chat import router as chat_router
from app.api.internal.forecast import router as forecast_router
from app.api.internal.health import router as health_router
from app.api.internal.hotspots import router as hotspots_router
from app.api.internal.investigate import router as investigate_router
from app.api.internal.reports import router as reports_router
from app.api.internal.scenarios import router as scenarios_router
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import get_logger, setup_logging

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan events: startup and shutdown."""
    settings = get_settings()
    setup_logging(settings.ai_log_level)
    logger.info(
        "streetair_ai_service_starting",
        version=settings.ai_service_version,
        env=settings.ai_service_env.value,
        port=settings.ai_service_port,
        default_provider=settings.ai_default_provider.value,
    )
    yield
    logger.info("streetair_ai_service_shutdown")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    settings = get_settings()

    app = FastAPI(
        title="STREETAIR AI & Data Intelligence Service",
        description="Internal AI, machine learning, and data intelligence engine for STREETAIR.",
        version=settings.ai_service_version,
        lifespan=lifespan,
        docs_url="/internal/docs",
        redoc_url=None,
    )

    # Register error handlers
    register_exception_handlers(app)

    # Optional internal CORS if configured
    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Include internal API routers
    app.include_router(health_router)
    app.include_router(chat_router)
    app.include_router(forecast_router)
    app.include_router(anomaly_router)
    app.include_router(hotspots_router)
    app.include_router(scenarios_router)
    app.include_router(reports_router)
    app.include_router(investigate_router)

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.ai_service_host,
        port=settings.ai_service_port,
        reload=False,
    )

