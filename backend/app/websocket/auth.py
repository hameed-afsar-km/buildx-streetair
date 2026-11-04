"""WebSocket authentication helper."""
from __future__ import annotations
import logging
from fastapi import WebSocket

logger = logging.getLogger(__name__)


async def ws_authenticate(websocket: WebSocket) -> dict | None:
    """
    Authenticate a WebSocket connection.
    - If ?token=<firebase_id_token> is provided, verify and return full user info.
    - If no token or ?public=true, allow as anonymous public viewer (read-only public channel).
    - Only rejects if a token is explicitly provided but invalid.
    """
    from app.integrations.firebase import verify_id_token

    token = websocket.query_params.get("token")

    if not token:
        # Allow unauthenticated public connection for public dashboard / hardware demo
        logger.info("WebSocket connected as anonymous public viewer")
        return {
            "uid": f"anon_{id(websocket)}",
            "email": None,
            "display_name": "Anonymous Viewer",
            "organisation_id": None,
            "is_anonymous": True,
        }

    try:
        # verify_id_token is synchronous in firebase_admin
        decoded = verify_id_token(token)
        return {
            "uid": decoded["uid"],
            "email": decoded.get("email"),
            "display_name": decoded.get("name"),
            "organisation_id": decoded.get("organisation_id"),
            "is_anonymous": False,
        }
    except Exception as e:
        logger.warning("WebSocket auth failed: %s", str(e))
        await websocket.close(code=4001, reason="Invalid or expired token")
        return None
