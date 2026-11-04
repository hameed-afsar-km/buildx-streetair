"""
STREETAIR AI Engine — Structured Error Handling
================================================
Consistent error responses across all internal endpoints.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.core.logging import get_logger

logger = get_logger(__name__)


def _error_body(
    request_id: str,
    status_code: int,
    error_code: str,
    message: str,
    details: Any = None,
) -> dict[str, Any]:
    return {
        "request_id": request_id,
        "timestamp": datetime.now(UTC).isoformat(),
        "status_code": status_code,
        "error_code": error_code,
        "message": message,
        **({"details": details} if details is not None else {}),
    }


def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers on the FastAPI app."""

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        request_id = str(uuid.uuid4())
        logger.warning(
            "request_validation_error",
            request_id=request_id,
            path=request.url.path,
            errors=exc.errors(),
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=_error_body(
                request_id=request_id,
                status_code=422,
                error_code="VALIDATION_ERROR",
                message="Request body validation failed",
                details=exc.errors(),
            ),
        )

    @app.exception_handler(ValidationError)
    async def pydantic_error_handler(
        request: Request, exc: ValidationError
    ) -> JSONResponse:
        request_id = str(uuid.uuid4())
        logger.error(
            "internal_validation_error",
            request_id=request_id,
            path=request.url.path,
            errors=exc.errors(),
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_error_body(
                request_id=request_id,
                status_code=500,
                error_code="INTERNAL_SCHEMA_ERROR",
                message="Internal response schema validation failed",
            ),
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        request_id = str(uuid.uuid4())
        logger.error(
            "unhandled_exception",
            request_id=request_id,
            path=request.url.path,
            exc_type=type(exc).__name__,
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_error_body(
                request_id=request_id,
                status_code=500,
                error_code="INTERNAL_ERROR",
                message="An unexpected error occurred",
            ),
        )


class AIServiceError(Exception):
    """Base exception for AI service business logic errors."""

    def __init__(self, message: str, code: str = "AI_SERVICE_ERROR") -> None:
        super().__init__(message)
        self.message = message
        self.code = code


class ProviderError(AIServiceError):
    """Raised when an LLM provider fails."""

    def __init__(self, provider: str, message: str) -> None:
        super().__init__(message, code=f"{provider.upper()}_PROVIDER_ERROR")
        self.provider = provider


class ProviderUnavailableError(ProviderError):
    """Raised when a provider is unreachable or unconfigured."""


class InsufficientDataError(AIServiceError):
    """Raised when insufficient data is available for a requested operation."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="INSUFFICIENT_DATA")


class UnsupportedScenarioError(AIServiceError):
    """Raised when a What-If scenario type is not supported."""

    def __init__(self, scenario_type: str) -> None:
        super().__init__(
            f"Scenario type '{scenario_type}' is not supported",
            code="UNSUPPORTED_SCENARIO",
        )


class TenantIsolationError(AIServiceError):
    """Raised when a cross-tenant data access attempt is detected."""

    def __init__(self) -> None:
        super().__init__("Cross-tenant data access is not permitted", code="TENANT_ISOLATION")

