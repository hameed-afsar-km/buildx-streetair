"""
STREETAIR custom exception hierarchy.

All domain exceptions inherit from ``StreetAirError`` so callers can catch
either the base class or specific subtypes.  Every exception carries:

- ``message`` – a human-readable description (also the ``args[0]``).
- ``detail``  – an optional dict with structured diagnostic data.

FastAPI exception handlers (registered in ``app/main.py``) map each
subtype to the appropriate HTTP status code.
"""

from __future__ import annotations


class StreetAirError(Exception):
    """Base class for all STREETAIR domain exceptions."""

    def __init__(self, message: str, detail: dict | None = None) -> None:
        super().__init__(message)
        self.message: str = message
        self.detail: dict | None = detail

    def __repr__(self) -> str:  # pragma: no cover
        return f"{self.__class__.__name__}(message={self.message!r}, detail={self.detail!r})"


class NotFoundError(StreetAirError):
    """The requested resource does not exist (HTTP 404)."""

    def __init__(self, message: str = "Resource not found", detail: dict | None = None) -> None:
        super().__init__(message, detail)


class UnauthorizedError(StreetAirError):
    """Missing or invalid authentication credentials (HTTP 401)."""

    def __init__(self, message: str = "Authentication required", detail: dict | None = None) -> None:
        super().__init__(message, detail)


class ForbiddenError(StreetAirError):
    """Authenticated user lacks permission for the requested action (HTTP 403)."""

    def __init__(self, message: str = "Access denied", detail: dict | None = None) -> None:
        super().__init__(message, detail)


class ValidationError(StreetAirError):
    """Input failed domain-level validation rules (HTTP 422)."""

    def __init__(self, message: str = "Validation failed", detail: dict | None = None) -> None:
        super().__init__(message, detail)


class ConflictError(StreetAirError):
    """The request conflicts with existing state (HTTP 409)."""

    def __init__(self, message: str = "Resource conflict", detail: dict | None = None) -> None:
        super().__init__(message, detail)


class RateLimitError(StreetAirError):
    """The caller has exceeded the allowed request rate (HTTP 429)."""

    def __init__(self, message: str = "Rate limit exceeded", detail: dict | None = None) -> None:
        super().__init__(message, detail)


class ServiceUnavailableError(StreetAirError):
    """A required downstream service is unavailable (HTTP 503)."""

    def __init__(self, message: str = "Service temporarily unavailable", detail: dict | None = None) -> None:
        super().__init__(message, detail)


class DeviceAuthError(StreetAirError):
    """Device-level authentication or token verification failed (HTTP 401)."""

    def __init__(self, message: str = "Device authentication failed", detail: dict | None = None) -> None:
        super().__init__(message, detail)


class IngestError(StreetAirError):
    """An error occurred while processing an inbound sensor reading (HTTP 422)."""

    def __init__(self, message: str = "Ingest processing failed", detail: dict | None = None) -> None:
        super().__init__(message, detail)


class SubscriptionError(StreetAirError):
    """An error occurred with a real-time subscription or WebSocket session (HTTP 400)."""

    def __init__(self, message: str = "Subscription error", detail: dict | None = None) -> None:
        super().__init__(message, detail)


class AIEngineError(StreetAirError):
    """The AI Engine micro-service returned an error or is unreachable (HTTP 502)."""

    def __init__(self, message: str = "AI engine error", detail: dict | None = None) -> None:
        super().__init__(message, detail)
