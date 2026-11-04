"""
MQTT adapter for future ESP32 hardware integration.
When an MQTT message arrives, it is mapped to the canonical IngestPayload
and fed through the same ingestion pipeline as HTTP readings.

This module is NOT active in the initial HTTP-only deployment.
Enable by setting MQTT_ENABLED=true and providing broker configuration.
"""
from __future__ import annotations
import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Callable, Awaitable

logger = logging.getLogger(__name__)

# Type alias for the ingestion handler
IngestHandler = Callable[[dict], Awaitable[None]]


class MQTTAdapter:
    """
    Async MQTT adapter using aiomqtt.

    Topic structure: {prefix}/{station_id}/readings
    Example: streetair/readings/ST-001/readings

    Message payload: JSON matching IngestPayload schema.
    """

    def __init__(
        self,
        broker_url: str,
        username: str,
        password: str,
        topic_prefix: str,
        ingest_handler: IngestHandler,
    ):
        self.broker_url = broker_url
        self.username = username
        self.password = password
        self.topic_prefix = topic_prefix
        self.ingest_handler = ingest_handler
        self._running = False

    async def start(self) -> None:
        """Start listening for MQTT messages."""
        try:
            import aiomqtt
        except ImportError:
            logger.warning("aiomqtt not installed; MQTT adapter disabled")
            return

        self._running = True
        logger.info("Starting MQTT adapter", extra={"broker": self.broker_url})

        while self._running:
            try:
                async with aiomqtt.Client(
                    hostname=self._parse_host(),
                    port=self._parse_port(),
                    username=self.username or None,
                    password=self.password or None,
                ) as client:
                    topic = f"{self.topic_prefix}/+/readings"
                    await client.subscribe(topic)
                    logger.info("MQTT subscribed", extra={"topic": topic})

                    async for message in client.messages:
                        await self._handle_message(str(message.topic), message.payload)
            except Exception as e:
                logger.error("MQTT connection error; retrying in 10s", exc_info=True)
                await asyncio.sleep(10)

    async def stop(self) -> None:
        self._running = False

    async def _handle_message(self, topic: str, payload: bytes) -> None:
        """Parse MQTT payload and feed to ingestion handler."""
        try:
            data = json.loads(payload.decode("utf-8"))
            # Map MQTT topic to station context if needed
            topic_parts = topic.split("/")
            if len(topic_parts) >= 2 and "station_id" not in data:
                # Extract station_id from topic: prefix/station_id/readings
                data["station_id"] = topic_parts[-2]

            # Ensure data_source is set
            if "data_source" not in data:
                data["data_source"] = "hardware"

            await self.ingest_handler(data)
            logger.debug("MQTT message processed", extra={"topic": topic})
        except json.JSONDecodeError:
            logger.warning("Invalid JSON from MQTT", extra={"topic": topic})
        except Exception:
            logger.error("MQTT message handling error", exc_info=True)

    def _parse_host(self) -> str:
        url = self.broker_url.replace("mqtt://", "").replace("mqtts://", "")
        return url.split(":")[0]

    def _parse_port(self) -> int:
        url = self.broker_url.replace("mqtt://", "").replace("mqtts://", "")
        parts = url.split(":")
        return int(parts[1]) if len(parts) > 1 else 1883
