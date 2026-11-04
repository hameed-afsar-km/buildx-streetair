"""Analytics service — aggregates and summarises sensor data."""
from __future__ import annotations
import logging
from datetime import datetime, timezone, timedelta
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.repositories.readings_repository import ReadingsRepository
    from app.repositories.devices_repository import StationsRepository
    from app.repositories.alerts_repository import AlertsRepository

logger = logging.getLogger(__name__)


def _pollutant_unit(pollutant: str) -> str:
    units = {
        "pm1": "µg/m³",
        "pm25": "µg/m³",
        "pm10": "µg/m³",
        "temperature": "°C",
        "humidity": "%",
        "pressure": "hPa",
        "mq135_raw": "ADC counts (uncalibrated)",
    }
    return units.get(pollutant, "")


class AnalyticsService:
    def __init__(
        self,
        readings_repo: "ReadingsRepository",
        stations_repo: "StationsRepository",
        alerts_repo: "AlertsRepository",
    ):
        self.readings_repo = readings_repo
        self.stations_repo = stations_repo
        self.alerts_repo = alerts_repo
    
    async def get_overview(self, organisation_id: str | None = None) -> dict:
        """Overview summary for the dashboard."""
        now = datetime.now(timezone.utc)
        
        stations_data, _ = await self.stations_repo.list_stations(
            organisation_id=organisation_id, limit=100
        )
        total_stations = len(stations_data)
        active_stations = sum(1 for s in stations_data if s.get("status") == "active")
        
        active_alerts = await self.alerts_repo.get_active_alerts(
            organisation_id=organisation_id, limit=100
        )
        
        latest_aqi = {}
        for station in stations_data[:10]:
            sid = station.get("station_id") or station.get("id")
            reading = await self.readings_repo.get_latest_for_station(sid)
            if reading and reading.get("aqi"):
                latest_aqi[sid] = reading["aqi"]
        
        return {
            "total_stations": total_stations,
            "active_stations": active_stations,
            "total_readings_today": await self.readings_repo.count_today(),
            "active_alerts": len(active_alerts),
            "latest_aqi": latest_aqi,
            "generated_at": now.isoformat(),
        }
    
    async def get_trends(
        self,
        station_id: str,
        pollutant: str,
        start_time: datetime,
        end_time: datetime,
        interval: str = "1h",
    ) -> dict:
        """Return time-series trend data for a pollutant at a station."""
        readings, _ = await self.readings_repo.get_history(
            station_id=station_id,
            start_time=start_time,
            end_time=end_time,
            limit=500,
        )
        
        data_points = []
        for r in readings:
            readings_data = r.get("readings", {})
            value = readings_data.get(pollutant)
            ts = r.get("timestamp")
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            data_points.append({
                "timestamp": ts.isoformat() if ts else None,
                "value": value,
                "station_id": station_id,
            })
        
        data_points.sort(key=lambda x: x["timestamp"] or "")
        
        return {
            "station_id": station_id,
            "pollutant": pollutant,
            "unit": _pollutant_unit(pollutant),
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "interval": interval,
            "data_points": data_points,
            "data_source": "sensor_readings",
        }
    
    async def get_hotspots(
        self,
        organisation_id: str | None = None,
        hours: int = 24,
    ) -> dict:
        """
        Return station-based pollution hotspot summary.
        LIMITATION: Coverage limited to registered monitoring stations.
        """
        now = datetime.now(timezone.utc)
        start_time = now - timedelta(hours=hours)
        
        stations_data, _ = await self.stations_repo.list_stations(
            organisation_id=organisation_id, limit=100
        )
        
        hotspots = []
        for station in stations_data:
            sid = station.get("station_id") or station.get("id")
            reading = await self.readings_repo.get_latest_for_station(sid)
            if not reading:
                continue
            
            aqi = reading.get("aqi", {})
            hotspots.append({
                "station_id": sid,
                "station_name": station.get("name", sid),
                "latitude": station.get("latitude"),
                "longitude": station.get("longitude"),
                "aqi_value": aqi.get("value"),
                "dominant_pollutant": aqi.get("dominant_pollutant"),
                "reading_count": 1,
                "period_start": start_time.isoformat(),
                "period_end": now.isoformat(),
            })
        
        hotspots.sort(key=lambda x: x.get("aqi_value") or 0, reverse=True)
        
        return {
            "hotspots": hotspots,
            "method": "station_average",
            "limitation": (
                "Coverage limited to registered monitoring stations. "
                "Sparse coverage does not represent a continuous spatial field."
            ),
            "generated_at": now.isoformat(),
        }

