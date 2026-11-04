"""
STREETAIR AI Engine — Internal Security / Authentication
==========================================================
Service-to-service authentication via shared Bearer token.
The main backend must include: Authorization: Bearer <AI_INTERNAL_API_KEY>
"""

from __future__ import annotations

import secrets

from fastapi import HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_bearer_scheme = HTTPBearer(auto_error=False)


async def verify_internal_token(request: Request) -> None:
    """
    FastAPI dependency that enforces service-to-service authentication.

    Raises HTTP 401 for missing/malformed token and HTTP 403 for invalid token.
    Uses constant-time comparison to prevent timing attacks.
    """
    settings = get_settings()

    credentials: HTTPAuthorizationCredentials | None = await _bearer_scheme(request)

    if credentials is None or credentials.scheme.lower() != "bearer":
        logger.warning(
            "internal_auth_missing",
            path=request.url.path,
            client=request.client.host if request.client else "unknown",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    provided = credentials.credentials
    expected = settings.ai_internal_api_key

    if not secrets.compare_digest(provided.encode(), expected.encode()):
        logger.warning(
            "internal_auth_invalid",
            path=request.url.path,
            client=request.client.host if request.client else "unknown",
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid internal API key",
        )

