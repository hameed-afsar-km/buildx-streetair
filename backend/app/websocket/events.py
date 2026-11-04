"""WebSocket event definitions."""
from enum import Enum

class WSEventType(str, Enum):
    READING_CREATED = "reading.created"
    STATION_STATUS_CHANGED = "station.status_changed"
    ALERT_CREATED = "alert.created"
    ALERT_UPDATED = "alert.updated"
    INCIDENT_CREATED = "incident.created"
    INCIDENT_UPDATED = "incident.updated"
    REPORT_STATUS_CHANGED = "report.status_changed"
    PREDICTION_CREATED = "prediction.created"
    SYSTEM_HEALTH_CHANGED = "system.health_changed"

