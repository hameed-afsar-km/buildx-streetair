"""
WebSocket connection manager for real-time event distribution.

Architecture: Single-instance in-memory pub/sub.
For horizontal scaling, replace the in-memory broadcast with a Redis Pub/Sub adapter.

Event channels:
- "public": All connected WebSocket clients receive public events (reading.created, etc.)
- "org:{organisation_id}": Organisation-specific events (alerts, incidents)
"""
from __future__ import annotations
import asyncio
import json
import logging
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import WebSocket
from starlette.websockets import WebSocketState

logger = logging.getLogger(__name__)

WS_VERSION = "1.0"


class WebSocketConnection:
    """Represents a single authenticated WebSocket connection."""
    
    def __init__(
        self,
        connection_id: str,
        websocket: WebSocket,
        uid: str,
        organisation_id: str | None,
        channels: set[str],
    ):
        self.connection_id = connection_id
        self.websocket = websocket
        self.uid = uid
        self.organisation_id = organisation_id
        self.channels = channels
        self.connected_at = datetime.now(timezone.utc)
        self._send_lock = asyncio.Lock()
    
    async def send_json(self, data: dict) -> bool:
        """Send JSON data to the client. Returns False if connection is broken."""
        if self.websocket.client_state != WebSocketState.CONNECTED:
            return False
        try:
            async with self._send_lock:
                await self.websocket.send_json(data)
            return True
        except Exception as e:
            logger.debug("WebSocket send failed", extra={
                "connection_id": self.connection_id,
                "error": str(e),
            })
            return False


class WebSocketManager:
    def __init__(self):
        self._connections: dict[str, WebSocketConnection] = {}
        self._heartbeat_interval = 30  # seconds
    
    async def connect(
        self,
        websocket: WebSocket,
        uid: str,
        organisation_id: str | None,
        channels: set[str],
    ) -> WebSocketConnection:
        connection_id = str(uuid4())
        
        user_connections = [
            c for c in self._connections.values() if c.uid == uid
        ]
        max_per_user = 5
        if len(user_connections) >= max_per_user:
            await websocket.close(code=4008, reason="Connection limit exceeded")
            raise ConnectionError(f"User {uid} has reached the connection limit.")
        
        await websocket.accept()
        conn = WebSocketConnection(
            connection_id=connection_id,
            websocket=websocket,
            uid=uid,
            organisation_id=organisation_id,
            channels=channels,
        )
        self._connections[connection_id] = conn
        
        logger.info("WebSocket connected", extra={
            "connection_id": connection_id,
            "uid": uid,
            "channels": list(channels),
        })
        
        await conn.send_json({
            "event": "connection.established",
            "connection_id": connection_id,
            "version": WS_VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        
        return conn
    
    async def disconnect(self, connection_id: str) -> None:
        conn = self._connections.pop(connection_id, None)
        if conn:
            logger.info("WebSocket disconnected", extra={
                "connection_id": connection_id,
                "uid": conn.uid,
            })
    
    async def broadcast_event(
        self,
        event_type: str,
        data: dict,
        organisation_id: str | None = None,
        public: bool = True,
    ) -> int:
        event = {
            "event": event_type,
            "version": WS_VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }
        
        sent_count = 0
        dead_connections = []
        
        for connection_id, conn in list(self._connections.items()):
            should_send = False
            
            if public and "public" in conn.channels:
                should_send = True
            
            if organisation_id and f"org:{organisation_id}" in conn.channels:
                should_send = True
            
            if not should_send:
                continue
            
            success = await conn.send_json(event)
            if success:
                sent_count += 1
            else:
                dead_connections.append(connection_id)
        
        for cid in dead_connections:
            self._connections.pop(cid, None)
            logger.debug("Removed dead WebSocket connection", extra={"connection_id": cid})
        
        return sent_count
    
    async def send_to_user(self, uid: str, event_type: str, data: dict) -> int:
        event = {
            "event": event_type,
            "version": WS_VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }
        sent_count = 0
        for conn in list(self._connections.values()):
            if conn.uid == uid:
                success = await conn.send_json(event)
                if success:
                    sent_count += 1
        return sent_count
    
    async def handle_connection(self, conn: WebSocketConnection) -> None:
        heartbeat_task = asyncio.create_task(self._heartbeat(conn))
        try:
            while True:
                try:
                    message = await asyncio.wait_for(
                        conn.websocket.receive_json(),
                        timeout=float(self._heartbeat_interval * 2),
                    )
                    await self._handle_client_message(conn, message)
                except asyncio.TimeoutError:
                    break
                except Exception as e:
                    logger.debug("WebSocket receive error: %s", str(e))
                    break
        finally:
            heartbeat_task.cancel()
            await self.disconnect(conn.connection_id)
    
    async def _heartbeat(self, conn: WebSocketConnection) -> None:
        while True:
            await asyncio.sleep(self._heartbeat_interval)
            if conn.websocket.client_state != WebSocketState.CONNECTED:
                break
            sent = await conn.send_json({
                "event": "heartbeat",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            if not sent:
                break
    
    async def _handle_client_message(self, conn: WebSocketConnection, 
                                      message: dict) -> None:
        msg_type = message.get("type", "unknown")
        if msg_type == "ping":
            await conn.send_json({
                "event": "pong",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
        elif msg_type == "subscribe":
            channel = message.get("channel")
            if channel == "public":
                conn.channels.add("public")
            elif channel and channel.startswith("org:") and conn.organisation_id:
                requested_org = channel.split(":")[1]
                if requested_org == conn.organisation_id:
                    conn.channels.add(channel)
    
    @property
    def active_connections_count(self) -> int:
        return len(self._connections)
    
    def get_stats(self) -> dict:
        return {
            "active_connections": len(self._connections),
            "connected_users": len(set(c.uid for c in self._connections.values())),
        }


ws_manager = WebSocketManager()

