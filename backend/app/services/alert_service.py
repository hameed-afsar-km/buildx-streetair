"""
Alert service — creates, evaluates and manages alerts.
Threshold rules are defined here as a starting point.
Production should load rules from Firestore configuration.
"""
from __future__ import annotations
import logging
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from app.core.config import settings
from app.repositories.firestore_base import new_id, now_utc

if TYPE_CHECKING:
    from app.repositories.alerts_repository import AlertsRepository
    from app.websocket.manager import WebSocketManager

logger = logging.getLogger(__name__)

THRESHOLD_RULES = [
    {
        "id": "pm25_poor",
        "pollutant": "pm25",
        "threshold": 90.0,
        "operator": ">=",
        "severity": "warning",
        "title": "PM2.5 Poor Air Quality",
    },
    {
        "id": "pm25_very_poor",
        "pollutant": "pm25",
        "threshold": 120.0,
        "operator": ">=",
        "severity": "critical",
        "title": "PM2.5 Very Poor / Severe",
    },
    {
        "id": "pm10_poor",
        "pollutant": "pm10",
        "threshold": 250.0,
        "operator": ">=",
        "severity": "warning",
        "title": "PM10 Poor Air Quality",
    },
    {
        "id": "pm10_very_poor",
        "pollutant": "pm10",
        "threshold": 350.0,
        "operator": ">=",
        "severity": "critical",
        "title": "PM10 Very Poor / Severe",
    },
]


def _evaluate_rule(rule: dict, readings: dict) -> bool:
    value = readings.get(rule["pollutant"])
    if value is None:
        return False
    threshold = rule["threshold"]
    op = rule["operator"]
    if op == ">=":
        return value >= threshold
    elif op == ">":
        return value > threshold
    elif op == "<=":
        return value <= threshold
    elif op == "<":
        return value < threshold
    return False


class AlertService:
    def __init__(self, alerts_repo: "AlertsRepository", 
                 ws_manager: "WebSocketManager | None" = None):
        self.alerts_repo = alerts_repo
        self.ws_manager = ws_manager
    
    async def evaluate_reading(self, reading: dict, station: dict) -> list[dict]:
        """Evaluate threshold rules against a new reading. Create alerts as needed."""
        created_alerts = []
        readings_data = reading.get("readings", {})
        station_id = reading["station_id"]
        organisation_id = station.get("organisation_id")
        is_simulated = reading.get("data_source") == "simulated"
        
        for rule in THRESHOLD_RULES:
            if not _evaluate_rule(rule, readings_data):
                continue
            
            in_cooldown = await self.alerts_repo.check_cooldown(
                station_id, rule["id"], settings.ALERT_COOLDOWN_SECONDS
            )
            if in_cooldown:
                logger.debug("Alert suppressed (cooldown)", extra={"rule": rule["id"]})
                continue
            
            alert_id = new_id()
            pollutant_value = readings_data.get(rule["pollutant"])
            description = (
                f"{rule['title']}: {rule['pollutant'].upper()} reading of "
                f"{pollutant_value:.1f} exceeds threshold {rule['threshold']}."
            )
            if is_simulated:
                description += " [SIMULATED DATA — not a verified pollution event]"
            
            alert_data = {
                "alert_id": alert_id,
                "station_id": station_id,
                "organisation_id": organisation_id,
                "alert_type": rule["id"],
                "severity": rule["severity"],
                "title": rule["title"],
                "description": description,
                "triggered_at": now_utc(),
                "status": "active",
                "source": "threshold_rule",
                "evidence": {
                    "reading_id": reading.get("id"),
                    "pollutant": rule["pollutant"],
                    "value": pollutant_value,
                    "threshold": rule["threshold"],
                    "is_simulated": is_simulated,
                },
            }
            created = await self.alerts_repo.create(alert_data, doc_id=alert_id)
            created_alerts.append(created)
            
            if self.ws_manager:
                try:
                    await self.ws_manager.broadcast_event(
                        event_type="alert.created",
                        data={
                            "alert_id": alert_id,
                            "station_id": station_id,
                            "severity": rule["severity"],
                            "title": rule["title"],
                        },
                        organisation_id=organisation_id,
                    )
                except Exception:
                    logger.error("Failed to broadcast alert WS event", exc_info=True)
            
            logger.info("Alert created", extra={
                "alert_id": alert_id,
                "rule": rule["id"],
                "station_id": station_id,
            })
        
        return created_alerts
    
    async def create_station_offline_alert(self, station_id: str, 
                                            organisation_id: str | None) -> dict:
        """Create an alert when a station goes offline / stops reporting."""
        alert_id = new_id()
        alert_data = {
            "alert_id": alert_id,
            "station_id": station_id,
            "organisation_id": organisation_id,
            "alert_type": "station_offline",
            "severity": "warning",
            "title": "Station Offline",
            "description": f"Station {station_id} has not reported data within the expected interval.",
            "triggered_at": now_utc(),
            "status": "active",
            "source": "heartbeat_monitor",
            "evidence": {"station_id": station_id},
        }
        return await self.alerts_repo.create(alert_data, doc_id=alert_id)

    async def list_alerts(self, organisation_id: str | None = None, station_id: str | None = None, limit: int = 50) -> list[dict]:
        return await self.alerts_repo.get_active_alerts(organisation_id=organisation_id, station_id=station_id, limit=limit)

    async def acknowledge_alert(self, alert_id: str, uid: str, note: str | None = None) -> dict | None:
        return await self.alerts_repo.acknowledge(alert_id, uid, note)

    async def resolve_alert(self, alert_id: str, uid: str) -> dict | None:
        return await self.alerts_repo.resolve(alert_id, uid)

