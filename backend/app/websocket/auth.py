"""WebSocket authentication helper."""
from __future__ import annotations
import logging
from fastapi import WebSocket

logger = logging.getLogger(__name__)


async def ws_authenticate(websocket: WebSocket) -> dict | None:
    """
    Authenticate a WebSocket connection.
    Token is passed as query parameter: /ws/v1/live?token=<firebase_id_token>
    """
    from app.integrations.firebase import verify_id_token
    
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing authentication token")
        return None
    
    try:
        decoded = await verify_id_token(token)
        return {
            "uid": decoded["uid"],
            "email": decoded.get("email"),
            "display_name": decoded.get("name"),
        }
    except Exception as e:
        logger.warning("WebSocket auth failed: %s", str(e))
        await websocket.close(code=4001, reason="Invalid or expired token")
        return None

