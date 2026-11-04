"""
STREETAIR — Environmental Intelligence SaaS Backend
Main FastAPI Application Entrypoint.
"""
from __future__ import annotations
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request, WebSocket, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.core.exceptions import (
    StreetAirError, NotFoundError, UnauthorizedError, ForbiddenError,
    ValidationError, ConflictError, RateLimitError, ServiceUnavailableError,
    DeviceAuthError, IngestError
)
from app.schemas.common import HealthResponse, ErrorResponse, ErrorDetail
from app.integrations.firebase import initialize_firebase, firebase_client
from app.integrations.ai_engine.client import ai_engine_client
from app.websocket.manager import ws_manager
from app.websocket.auth import ws_authenticate
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.logging import RequestLoggingMiddleware
from app.api.router import api_v1_router

# Configure structured logging
configure_logging(log_level=settings.LOG_LEVEL, is_production=settings.is_production)
logger = get_logger("streetair.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("Initializing STREETAIR backend", extra={"env": settings.APP_ENV})
    
    # Initialize Firebase Admin SDK
    try:
        initialize_firebase(
            credentials_path=settings.FIREBASE_CREDENTIALS_PATH,
            project_id=settings.FIREBASE_PROJECT_ID,
        )
        logger.info("Firebase integration ready")
    except Exception as e:
        logger.warning("Firebase initialization deferred or in mock/offline mode: %s", str(e))
    
    yield
    
    logger.info("Shutting down STREETAIR backend")


app = FastAPI(
    title="STREETAIR API",
    description="AI-Powered Environmental Intelligence SaaS Backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

# ---------------------------------------------------------------------------
# Middleware Pipeline
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.RATE_LIMIT_REQUESTS_PER_MINUTE)
app.add_middleware(RequestIDMiddleware)


# ---------------------------------------------------------------------------
# Exception Handlers — Consistent Error Envelope
# ---------------------------------------------------------------------------

def _extract_request_id(request: Request) -> str | None:
    return getattr(request.state, "request_id", None)


@app.exception_handler(StarletteHTTPException)
async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail
    if isinstance(detail, dict):
        error_code = str(detail.get("error", "HTTP_ERROR")).upper()
        message = str(detail.get("message", detail))
    else:
        error_code = "HTTP_ERROR"
        message = str(detail)
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=error_code,
            message=message,
            request_id=_extract_request_id(request),
        ).model_dump(by_alias=True),
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content=ErrorResponse(
            error_code="NOT_FOUND",
            message=exc.message,
            request_id=_extract_request_id(request),
        ).model_dump(by_alias=True),
    )


@app.exception_handler(UnauthorizedError)
async def unauthorized_handler(request: Request, exc: UnauthorizedError):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content=ErrorResponse(
            error_code="UNAUTHORIZED",
            message=exc.message,
            request_id=_extract_request_id(request),
        ).model_dump(by_alias=True),
        headers={"WWW-Authenticate": "Bearer"},
    )


@app.exception_handler(ForbiddenError)
async def forbidden_handler(request: Request, exc: ForbiddenError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content=ErrorResponse(
            error_code="FORBIDDEN",
            message=exc.message,
            request_id=_extract_request_id(request),
        ).model_dump(by_alias=True),
    )


@app.exception_handler(ValidationError)
async def domain_validation_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error_code="VALIDATION_ERROR",
            message=exc.message,
            request_id=_extract_request_id(request),
        ).model_dump(by_alias=True),
    )


@app.exception_handler(DeviceAuthError)
async def device_auth_handler(request: Request, exc: DeviceAuthError):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content=ErrorResponse(
            error_code="DEVICE_AUTH_FAILED",
            message=exc.message,
            request_id=_extract_request_id(request),
        ).model_dump(by_alias=True),
        headers={"WWW-Authenticate": "HMAC-SHA256"},
    )


@app.exception_handler(IngestError)
async def ingest_error_handler(request: Request, exc: IngestError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=ErrorResponse(
            error_code="INGESTION_ERROR",
            message=exc.message,
            request_id=_extract_request_id(request),
        ).model_dump(by_alias=True),
    )


@app.exception_handler(ConflictError)
async def conflict_handler(request: Request, exc: ConflictError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content=ErrorResponse(
            error_code="CONFLICT",
            message=exc.message,
            request_id=_extract_request_id(request),
        ).model_dump(by_alias=True),
    )


@app.exception_handler(ServiceUnavailableError)
async def service_unavailable_handler(request: Request, exc: ServiceUnavailableError):
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content=ErrorResponse(
            error_code="SERVICE_UNAVAILABLE",
            message=exc.message,
            request_id=_extract_request_id(request),
        ).model_dump(by_alias=True),
    )


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(request: Request, exc: RequestValidationError):
    details = [
        ErrorDetail(
            field=".".join(str(loc) for loc in err["loc"] if loc != "body"),
            message=err["msg"],
        )
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error_code="REQUEST_VALIDATION_FAILED",
            message="Request body or parameters failed schema validation.",
            request_id=_extract_request_id(request),
            details=details,
        ).model_dump(by_alias=True),
    )


@app.exception_handler(StreetAirError)
async def generic_streetair_error_handler(request: Request, exc: StreetAirError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error_code="INTERNAL_APPLICATION_ERROR",
            message=exc.message,
            request_id=_extract_request_id(request),
        ).model_dump(by_alias=True),
    )


# ---------------------------------------------------------------------------
# Health & Readiness Endpoints
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse, tags=["Operations"])
async def health_check():
    """Liveness probe."""
    now = datetime.now(timezone.utc)
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        environment=settings.APP_ENV,
        timestamp=now,
        services={
            "api": "healthy",
            "websocket": "healthy",
        },
    )


@app.get("/ready", response_model=HealthResponse, tags=["Operations"])
async def readiness_check():
    """Readiness probe checking internal dependencies."""
    now = datetime.now(timezone.utc)
    ai_health = await ai_engine_client.health_check()
    
    services = {
        "api": "healthy",
        "ai_engine": ai_health.get("status", "unknown"),
        "websocket": "healthy",
    }
    
    is_degraded = any(st in ("unhealthy", "unavailable") for st in services.values())
    overall = "degraded" if is_degraded else "healthy"
    
    return HealthResponse(
        status=overall,
        version="1.0.0",
        environment=settings.APP_ENV,
        timestamp=now,
        services=services,
    )


# ---------------------------------------------------------------------------
# Real-Time WebSocket Endpoint
# ---------------------------------------------------------------------------

@app.websocket("/ws/v1/live")
async def websocket_live_endpoint(websocket: WebSocket):
    """
    Real-time environmental event distribution over WebSockets.
    Connect with: ws://localhost:8000/ws/v1/live?token=<firebase_id_token>
    """
    user_info = await ws_authenticate(websocket)
    if not user_info:
        return
    
    channels = {"public"}
    org_id = user_info.get("organisation_id")
    if org_id:
        channels.add(f"org:{org_id}")
    
    try:
        conn = await ws_manager.connect(
            websocket=websocket,
            uid=user_info["uid"],
            organisation_id=org_id,
            channels=channels,
        )
        await ws_manager.handle_connection(conn)
    except ConnectionError:
        pass
    except Exception as e:
        logger.error("WebSocket unhandled connection error: %s", str(e), exc_info=True)


# ---------------------------------------------------------------------------
# Mount Application Routers
# ---------------------------------------------------------------------------

app.include_router(api_v1_router)

