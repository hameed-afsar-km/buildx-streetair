"""
Ingestion service — the central sensor data pipeline.

Flow:
1. Authenticate device
2. Validate device/station registration
3. Validate schema and reading values
4. Idempotency check
5. Persist reading
6. Update station metadata
7. Calculate AQI
8. Evaluate alert rules
9. Broadcast WebSocket event
10. Queue async AI anomaly detection
"""
from __future__ import annotations
import logging
from datetime import datetime, timezone, timedelta
from typing import TYPE_CHECKING

from app.core.config import settings
from app.core.exceptions import (
    DeviceAuthError, IngestError, NotFoundError, ValidationError
)
from app.repositories.firestore_base import new_id, now_utc
from app.services.aqi_service import calculate_aqi

if TYPE_CHECKING:
    from app.repositories.devices_repository import DevicesRepository, StationsRepository
    from app.repositories.readings_repository import ReadingsRepository
    from app.repositories.alerts_repository import AlertsRepository
    from app.repositories.audit_repository import AuditRepository
    from app.services.alert_service import AlertService
    from app.websocket.manager import WebSocketManager
    from app.integrations.ai_engine.client import AIEngineClient

logger = logging.getLogger(__name__)

VALID_DATA_SOURCES = {"simulated", "hardware"}
VALID_SCENARIO_IDS = {
    "normal", "traffic_congestion", "construction_dust",
    "industrial_emissions", "waste_burning", "high_humidity",
    "smoke_event", "pollution_dispersal", "extreme_pollution",
    # Short aliases from ESP32 keypad firmware
    "traffic", "construction", "industrial", "smoke", "dispersal", "extreme",
}

SCENARIO_SHORT_TO_CANONICAL = {
    "normal": "normal",
    "traffic": "traffic_congestion",
    "construction": "construction_dust",
    "industrial": "industrial_emissions",
    "waste_burning": "waste_burning",
    "high_humidity": "high_humidity",
    "smoke": "smoke_event",
    "dispersal": "pollution_dispersal",
    "extreme": "extreme_pollution",
}


class IngestionService:
    def __init__(
        self,
        devices_repo: "DevicesRepository",
        stations_repo: "StationsRepository",
        readings_repo: "ReadingsRepository",
        alert_service: "AlertService",
        ws_manager: "WebSocketManager | None" = None,
        ai_client: "AIEngineClient | None" = None,
    ):
        self.devices_repo = devices_repo
        self.stations_repo = stations_repo
        self.readings_repo = readings_repo
        self.alert_service = alert_service
        self.ws_manager = ws_manager
        self.ai_client = ai_client
    
    async def process(self, payload: dict, device_id: str, 
                      request_id: str) -> dict:
        """
        Main ingestion pipeline. Returns the persisted reading dict.
        Raises IngestError, ValidationError, DeviceAuthError on failure.
        """
        # 1. Validate device registration
        device = await self.devices_repo.get_by_device_id(device_id)
        if not device:
            raise DeviceAuthError(f"Device '{device_id}' is not registered.")
        if device.get("device_status") != "active":
            raise DeviceAuthError(f"Device '{device_id}' is not active.")
        
        station_id = payload.get("station_id")
        if not station_id:
            raise IngestError("Missing station_id in payload.")
        
        # 2. Validate station/device relationship
        station = await self.stations_repo.get_by_station_id(station_id)
        if not station:
            raise NotFoundError(f"Station '{station_id}' not found.")
        if station.get("device_id") != device_id:
            raise DeviceAuthError(
                f"Device '{device_id}' is not associated with station '{station_id}'."
            )
        
        # 3. Validate data source
        data_source = payload.get("data_source", "")
        if data_source not in VALID_DATA_SOURCES:
            raise ValidationError(f"Invalid data_source '{data_source}'. Must be one of: {VALID_DATA_SOURCES}")
        
        # 4. Validate and normalize scenario_id if present
        scenario_id = payload.get("scenario_id")
        if scenario_id:
            if scenario_id not in VALID_SCENARIO_IDS:
                raise ValidationError(f"Invalid scenario_id '{scenario_id}'.")
            # Normalize to canonical form
            scenario_id = SCENARIO_SHORT_TO_CANONICAL.get(scenario_id, scenario_id)
            payload["scenario_id"] = scenario_id
        
        # 5. Validate timestamp
        timestamp = payload.get("timestamp")
        if isinstance(timestamp, str):
            try:
                timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            except ValueError:
                raise ValidationError("Invalid timestamp format. Use ISO 8601 UTC.")
        if not isinstance(timestamp, datetime):
            raise ValidationError("Missing or invalid timestamp.")
        
        now = now_utc()
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)
        
        skew_future = (timestamp - now).total_seconds()
        skew_past = (now - timestamp).total_seconds()
        if skew_future > settings.MAX_TIMESTAMP_FUTURE_SKEW:
            raise ValidationError(
                f"Timestamp is too far in the future ({skew_future:.0f}s). "
                f"Max allowed: {settings.MAX_TIMESTAMP_FUTURE_SKEW}s."
            )
        if skew_past > settings.MAX_TIMESTAMP_PAST_SKEW:
            raise ValidationError(
                f"Timestamp is too stale ({skew_past:.0f}s old). "
                f"Max allowed: {settings.MAX_TIMESTAMP_PAST_SKEW}s."
            )
        
        # 6. Validate reading values
        readings = payload.get("readings", {})
        self._validate_readings(readings)
        
        # 7. Idempotency check
        is_duplicate = await self.readings_repo.check_duplicate(device_id, timestamp)
        if is_duplicate:
            logger.warning("Duplicate reading rejected", extra={
                "device_id": device_id,
                "timestamp": timestamp.isoformat(),
                "request_id": request_id,
            })
            raise IngestError("Duplicate reading: same device_id + timestamp already ingested.")
        
        # 8. Calculate AQI
        is_simulated = data_source == "simulated"
        aqi_result = calculate_aqi(
            pm25=readings.get("pm25"),
            pm10=readings.get("pm10"),
            is_simulated=is_simulated,
        )
        
        # 9. Build reading document
        reading_id = new_id()
        reading_doc = {
            "reading_id": reading_id,
            "station_id": station_id,
            "device_id": device_id,
            "timestamp": timestamp,
            "received_at": now,
            "data_source": data_source,
            "scenario_id": scenario_id,
            "readings": readings,
            "aqi": aqi_result,
            "quality_flags": self._quality_flags(readings),
            "location": payload.get("location"),
            "firmware_version": payload.get("firmware_version"),
            "ingestion_metadata": {
                "request_id": request_id,
                "ingested_at": now.isoformat(),
            },
        }
        
        # 10. Persist reading
        persisted = await self.readings_repo.create(reading_doc, doc_id=reading_id)
        
        # 11. Update station metadata
        await self.stations_repo.update_last_seen(station_id, device_id)
        await self.devices_repo.update_last_seen(device_id)
        
        # 12. Evaluate alerts
        try:
            await self.alert_service.evaluate_reading(persisted, station)
        except Exception:
            logger.error("Alert evaluation failed (non-critical)", exc_info=True)
        
        # 13. Broadcast WebSocket event
        if self.ws_manager:
            try:
                await self.ws_manager.broadcast_event(
                    event_type="reading.created",
                    data={
                        "reading_id": reading_id,
                        "station_id": station_id,
                        "timestamp": timestamp.isoformat(),
                        "data_source": data_source,
                        "scenario_id": scenario_id,
                        "aqi": aqi_result,
                        "readings": readings,
                    },
                    organisation_id=station.get("organisation_id"),
                )
            except Exception:
                logger.error("WebSocket broadcast failed (non-critical)", exc_info=True)
        
        # 14. Queue async anomaly detection (non-blocking)
        if self.ai_client:
            import asyncio
            asyncio.create_task(self._async_anomaly_check(
                station_id, reading_id, readings, request_id
            ))
        
        logger.info("Reading ingested", extra={
            "reading_id": reading_id,
            "station_id": station_id,
            "device_id": device_id,
            "data_source": data_source,
            "request_id": request_id,
        })
        
        return persisted
    
    def _validate_readings(self, readings: dict) -> None:
        """Validate reading values against configured bounds."""
        checks = [
            ("pm1", 0, settings.PM1_MAX),
            ("pm25", 0, settings.PM25_MAX),
            ("pm10", 0, settings.PM10_MAX),
            ("temperature", settings.TEMPERATURE_MIN, settings.TEMPERATURE_MAX),
            ("humidity", settings.HUMIDITY_MIN, settings.HUMIDITY_MAX),
            ("pressure", settings.PRESSURE_MIN, settings.PRESSURE_MAX),
        ]
        for field, lo, hi in checks:
            val = readings.get(field)
            if val is not None:
                if not isinstance(val, (int, float)):
                    raise ValidationError(f"Reading field '{field}' must be numeric.")
                import math
                if not math.isfinite(val):
                    raise ValidationError(f"Reading field '{field}' must be finite.")
                if val < lo or val > hi:
                    raise ValidationError(
                        f"Reading '{field}' value {val} is outside bounds [{lo}, {hi}]."
                    )
        
        mq135 = readings.get("mq135_raw")
        if mq135 is not None:
            if not isinstance(mq135, int) or not (0 <= mq135 <= settings.MQ135_RAW_MAX):
                raise ValidationError(
                    f"mq135_raw must be an integer in [0, {settings.MQ135_RAW_MAX}]."
                )
    
    def _quality_flags(self, readings: dict) -> list[str]:
        """Generate quality flags for a reading."""
        flags = []
        pm25 = readings.get("pm25")
        pm10 = readings.get("pm10")
        if pm25 is not None and pm10 is not None and pm25 > pm10:
            flags.append("pm25_exceeds_pm10")
        if pm25 is None and pm10 is None:
            flags.append("no_pm_data")
        if readings.get("mq135_raw") is not None:
            flags.append("mq135_raw_uncalibrated")
        return flags
    
    async def _async_anomaly_check(self, station_id: str, reading_id: str,
                                    readings: dict, request_id: str) -> None:
        """Non-blocking anomaly detection via AI engine."""
        try:
            if self.ai_client:
                await self.ai_client.detect_anomaly(
                    station_id=station_id,
                    readings=[{"reading_id": reading_id, **readings}],
                    request_id=request_id,
                )
        except Exception:
            logger.warning("Async anomaly check failed", exc_info=True)

