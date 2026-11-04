"""Unit tests for WebSocket Manager."""
import asyncio
import pytest
from app.websocket.manager import WebSocketManager, WebSocketConnection


class DummyWS:
    def __init__(self):
        from starlette.websockets import WebSocketState
        self.client_state = WebSocketState.CONNECTED
        self.sent_messages = []

    async def accept(self):
        pass

    async def send_json(self, data: dict):
        self.sent_messages.append(data)

    async def close(self, code=1000, reason=""):
        from starlette.websockets import WebSocketState
        self.client_state = WebSocketState.DISCONNECTED


@pytest.mark.asyncio
async def test_websocket_manager_lifecycle():
    manager = WebSocketManager()
    dummy_ws = DummyWS()

    # 1. Connect
    conn = await manager.connect(
        websocket=dummy_ws,
        uid="ws-user-001",
        organisation_id="org-123",
        channels={"public", "org:org-123"},
    )
    assert manager.active_connections_count == 1
    stats = manager.get_stats()
    assert stats["active_connections"] == 1
    assert stats["connected_users"] == 1

    # Verify connection acknowledgement was sent
    assert len(dummy_ws.sent_messages) >= 1
    assert dummy_ws.sent_messages[0]["event"] == "connection.established"

    # 2. Broadcast public event
    received_count = await manager.broadcast_event(
        event_type="reading.created",
        data={"reading_id": "r-1", "station_id": "st-1", "aqi": 42.0},
        public=True,
    )
    assert received_count == 1
    assert dummy_ws.sent_messages[-1]["event"] == "reading.created"

    # 3. Broadcast org-specific event
    org_received = await manager.broadcast_event(
        event_type="alert.created",
        data={"alert_id": "a-1", "severity": "warning"},
        organisation_id="org-123",
        public=False,
    )
    assert org_received == 1

    # Org-specific event to different org should NOT deliver
    other_org_received = await manager.broadcast_event(
        event_type="alert.created",
        data={"alert_id": "a-2"},
        organisation_id="org-OTHER",
        public=False,
    )
    assert other_org_received == 0

    # 4. Disconnect
    await manager.disconnect(conn.connection_id)
    assert manager.active_connections_count == 0

