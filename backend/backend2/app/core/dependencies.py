"""
STREETAIR FastAPI dependency functions.

All route-level dependencies live here.  They are thin wrappers that convert
domain exceptions (StreetAirError subclasses) into appropriate HTTP responses
so that individual route handlers remain clean.

Dependency graph
----------------
get_firebase_token
    └─► get_current_user
            └─► require_authenticated_user
                    └─► require_platform_admin

get_optional_user   (standalone – never raises on missing token)
require_device_auth (standalone – used on device ingest endpoints)
"""

from __future__ import annotations

import logging

from fastapi import Depends, Header, HTTPException, status

from app.core.config import settings
from app.core.exceptions import (
    DeviceAuthError,
    ForbiddenError,
    UnauthorizedError,
)
from app.core.logging import get_logger
from app.core.security import verify_device_token

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Lazy imports to avoid circular dependency at module load time.
# firebase_client and organisation service are imported inside functions.
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Helper: convert domain exception → HTTPException
# ---------------------------------------------------------------------------

def _http_401(message: str = "Authentication required") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"error": "unauthorized", "message": message},
        headers={"WWW-Authenticate": "Bearer"},
    )


def _http_403(message: str = "Access denied") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={"error": "forbidden", "message": message},
    )


# ---------------------------------------------------------------------------
# 1. Extract raw Bearer token from Authorization header
# ---------------------------------------------------------------------------

async def get_firebase_token(
    authorization: str | None = Header(default=None),
) -> str:
    """
    Extract the raw Firebase ID token from the ``Authorization: Bearer <token>``
    header.

    Raises
    ------
    HTTP 401
        If the header is absent, empty, or does not start with ``Bearer ``.
    """
    if not authorization:
        raise _http_401("Authorization header is missing")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise _http_401("Authorization header must use the 'Bearer' scheme")

    return token.strip()


# ---------------------------------------------------------------------------
# 2. Verify token and return a fully populated UserContext
# ---------------------------------------------------------------------------

async def get_current_user(
    token: str = Depends(get_firebase_token),
) -> "UserContext":  # type: ignore[name-defined]  # noqa: F821
    """
    Verify the Firebase ID token and return a :class:`~app.schemas.auth.UserContext`.

    Steps
    -----
    1. Verify the token signature and expiry with Firebase Admin SDK.
    2. Fetch (or lazily create) the user profile document in Firestore.
    3. Return a ``UserContext`` with ``uid``, ``email``, ``role``, and
       ``organisation_id``.

    Raises
    ------
    HTTP 401
        If the token is invalid, expired, or the Firebase call fails.
    """
    # Import here to avoid circular imports at module load time.
    from app.integrations.firebase import firebase_client  # noqa: PLC0415
    from app.schemas.auth import UserContext  # noqa: PLC0415

    try:
        decoded_token: dict = firebase_client.verify_id_token(token)
    except UnauthorizedError as exc:
        logger.warning("firebase_token_invalid", error=str(exc))
        raise _http_401(exc.message) from exc
    except Exception as exc:  # pragma: no cover – Firebase SDK errors
        logger.error("firebase_verify_error", error=str(exc))
        raise _http_401("Token verification failed") from exc

    uid: str = decoded_token["uid"]
    email: str = decoded_token.get("email", "")

    # Fetch or upsert the user profile in Firestore
    try:
        user_doc = await firebase_client.get_or_create_user_profile(
            uid=uid,
            email=email,
            firebase_claims=decoded_token,
        )
    except Exception as exc:  # pragma: no cover
        logger.error("user_profile_fetch_error", uid=uid, error=str(exc))
        raise _http_401("Could not load user profile") from exc

    return UserContext(
        uid=uid,
        email=email,
        display_name=user_doc.get("display_name"),
        global_role=user_doc.get("global_role", "user"),
        account_status=user_doc.get("account_status", "active"),
        organisation_id=user_doc.get("organisation_id"),
    )


# ---------------------------------------------------------------------------
# 3. Require an active account
# ---------------------------------------------------------------------------

async def require_authenticated_user(
    user: "UserContext" = Depends(get_current_user),  # type: ignore[name-defined]  # noqa: F821
) -> "UserContext":  # type: ignore[name-defined]  # noqa: F821
    """
    Extend :func:`get_current_user` by asserting ``account_status == "active"``.

    Raises
    ------
    HTTP 401
        If the user's account has been suspended or deactivated.
    """
    if user.account_status != "active":
        raise _http_401(
            f"Account is not active (status={user.account_status!r}). "
            "Please contact support."
        )
    return user


# ---------------------------------------------------------------------------
# 4. Require platform-admin role
# ---------------------------------------------------------------------------

async def require_platform_admin(
    user: "UserContext" = Depends(require_authenticated_user),  # type: ignore[name-defined]  # noqa: F821
) -> "UserContext":  # type: ignore[name-defined]  # noqa: F821
    """
    Extend :func:`require_authenticated_user` by asserting
    ``global_role == "platform_admin"``.

    Raises
    ------
    HTTP 403
        If the authenticated user does not hold the ``platform_admin`` role.
    """
    if user.global_role != "platform_admin":
        raise _http_403(
            "This endpoint requires the 'platform_admin' role."
        )
    return user


# ---------------------------------------------------------------------------
# 5. Optional user (never raises)
# ---------------------------------------------------------------------------

async def get_optional_user(
    authorization: str | None = Header(default=None),
) -> "UserContext | None":  # type: ignore[name-defined]  # noqa: F821
    """
    Like :func:`get_current_user` but returns ``None`` instead of raising when
    the ``Authorization`` header is absent or the token is invalid.

    Useful for endpoints that serve both anonymous and authenticated clients
    with slightly different behaviour.
    """
    if not authorization:
        return None

    from app.integrations.firebase import firebase_client  # noqa: PLC0415
    from app.schemas.auth import UserContext  # noqa: PLC0415

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        return None

    try:
        decoded_token: dict = firebase_client.verify_id_token(token.strip())
    except Exception:  # noqa: BLE001
        return None

    uid: str = decoded_token["uid"]
    email: str = decoded_token.get("email", "")

    try:
        user_doc = await firebase_client.get_or_create_user_profile(
            uid=uid,
            email=email,
            firebase_claims=decoded_token,
        )
    except Exception:  # noqa: BLE001
        return None

    return UserContext(
        uid=uid,
        email=email,
        display_name=user_doc.get("display_name"),
        global_role=user_doc.get("global_role", "user"),
        account_status=user_doc.get("account_status", "active"),
        organisation_id=user_doc.get("organisation_id"),
    )


# ---------------------------------------------------------------------------
# 6. Device authentication (ingest endpoints)
# ---------------------------------------------------------------------------

async def require_device_auth(
    x_device_id: str | None = Header(default=None, alias="X-Device-ID"),
    x_device_token: str | None = Header(default=None, alias="X-Device-Token"),
) -> str:
    """
    Authenticate an IoT device using HMAC-SHA256 header tokens.

    Headers
    -------
    X-Device-ID
        The unique identifier of the device (provisioned at registration).
    X-Device-Token
        The HMAC-SHA256 hex token derived from the device ID and the shared
        secret (``settings.DEVICE_AUTH_SECRET``).

    Returns
    -------
    str
        The verified *device_id*, ready for downstream use in route handlers.

    Raises
    ------
    HTTP 401
        If either header is missing or the token does not match the device ID.
    """
    if not x_device_id or not x_device_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "device_auth_required",
                "message": "X-Device-ID and X-Device-Token headers are required",
            },
            headers={"WWW-Authenticate": "HMAC-SHA256"},
        )

    if not verify_device_token(
        token=x_device_token,
        device_id=x_device_id,
        secret=settings.DEVICE_AUTH_SECRET,
    ):
        logger.warning(
            "device_auth_failed",
            device_id=x_device_id,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "device_auth_failed",
                "message": "Invalid device token",
            },
            headers={"WWW-Authenticate": "HMAC-SHA256"},
        )

    logger.debug("device_auth_ok", device_id=x_device_id)
    return x_device_id
