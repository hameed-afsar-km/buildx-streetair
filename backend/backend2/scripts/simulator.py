"""
STREETAIR — Sensor Reading Simulator.

Simulates the 9 demonstration environmental scenarios:
1. normal (Normal air quality)
2. traffic_congestion (Rush-hour PM2.5 / PM10 spike)
3. construction_dust (High PM10 coarse particulate)
4. industrial_emissions (Elevated PM & volatile organic / MQ135)
5. waste_burning (Severe smoke & incomplete combustion)
6. high_humidity (High RH & mist effect)
7. smoke_event (Localized heavy smoke)
8. pollution_dispersal (Rapid atmospheric cleansing)
9. extreme_pollution (Severe regional inversion)

Posts canonical JSON payloads to the backend `POST /api/v1/ingest`
with valid HMAC device authentication headers.
"""
from __future__ import annotations
import argparse
import asyncio
import os
import sys
import time
import random
from datetime import datetime, timezone

import httpx

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.core.security import generate_device_token

DEFAULT_STATION_ID = "ST-CRESCENT-01"
DEFAULT_DEVICE_ID = "DEV-ESP32-CRESCENT"
CRESCENT_LAT = 12.8797
CRESCENT_LON = 80.0805

SCENARIO_PROFILES = {
    "normal": {
        "pm1": (10.0, 15.0),
        "pm25": (20.0, 30.0),
        "pm10": (35.0, 50.0),
        "mq135_raw": (800, 1100),
        "temperature": (27.0, 30.0),
        "humidity": (55.0, 65.0),
        "pressure": (1010.0, 1014.0),
    },
    "traffic_congestion": {
        "pm1": (45.0, 60.0),
        "pm25": (95.0, 130.0),
        "pm10": (160.0, 220.0),
        "mq135_raw": (1500, 1900),
        "temperature": (31.0, 34.0),
        "humidity": (50.0, 60.0),
        "pressure": (1008.0, 1011.0),
    },
    "construction_dust": {
        "pm1": (25.0, 40.0),
        "pm25": (65.0, 95.0),
        "pm10": (280.0, 380.0),
        "mq135_raw": (1100, 1400),
        "temperature": (32.0, 35.0),
        "humidity": (45.0, 55.0),
        "pressure": (1009.0, 1012.0),
    },
    "industrial_emissions": {
        "pm1": (60.0, 85.0),
        "pm25": (140.0, 185.0),
        "pm10": (210.0, 270.0),
        "mq135_raw": (1800, 2400),
        "temperature": (30.0, 33.0),
        "humidity": (60.0, 70.0),
        "pressure": (1007.0, 1010.0),
    },
    "waste_burning": {
        "pm1": (110.0, 160.0),
        "pm25": (240.0, 320.0),
        "pm10": (340.0, 450.0),
        "mq135_raw": (2200, 2900),
        "temperature": (32.0, 36.0),
        "humidity": (40.0, 50.0),
        "pressure": (1008.0, 1011.0),
    },
    "high_humidity": {
        "pm1": (20.0, 30.0),
        "pm25": (45.0, 65.0),
        "pm10": (70.0, 95.0),
        "mq135_raw": (950, 1250),
        "temperature": (24.0, 27.0),
        "humidity": (88.0, 98.0),
        "pressure": (1012.0, 1015.0),
    },
    "smoke_event": {
        "pm1": (130.0, 180.0),
        "pm25": (290.0, 360.0),
        "pm10": (390.0, 490.0),
        "mq135_raw": (2500, 3300),
        "temperature": (30.0, 34.0),
        "humidity": (50.0, 60.0),
        "pressure": (1008.0, 1011.0),
    },
    "pollution_dispersal": {
        "pm1": (8.0, 12.0),
        "pm25": (15.0, 22.0),
        "pm10": (25.0, 35.0),
        "mq135_raw": (700, 900),
        "temperature": (26.0, 29.0),
        "humidity": (55.0, 65.0),
        "pressure": (1013.0, 1016.0),
    },
    "extreme_pollution": {
        "pm1": (220.0, 310.0),
        "pm25": (410.0, 490.0),
        "pm10": (520.0, 640.0),
        "mq135_raw": (3200, 4000),
        "temperature": (29.0, 33.0),
        "humidity": (70.0, 85.0),
        "pressure": (1005.0, 1009.0),
    },
}


def generate_scenario_reading(scenario_id: str) -> dict:
    profile = SCENARIO_PROFILES.get(scenario_id, SCENARIO_PROFILES["normal"])
    readings = {}
    for key, (lo, hi) in profile.items():
        if key == "mq135_raw":
            readings[key] = random.randint(int(lo), int(hi))
        else:
            readings[key] = round(random.uniform(lo, hi), 1)
    return readings


async def send_reading(
    client: httpx.AsyncClient,
    base_url: str,
    device_id: str,
    station_id: str,
    scenario_id: str,
    device_token: str,
):
    now = datetime.now(timezone.utc)
    readings = generate_scenario_reading(scenario_id)
    
    payload = {
        "device_id": device_id,
        "station_id": station_id,
        "timestamp": now.isoformat(),
        "data_source": "simulated",
        "scenario_id": scenario_id,
        "readings": readings,
        "location": {
            "latitude": CRESCENT_LAT,
            "longitude": CRESCENT_LON,
        },
        "firmware_version": "v1.0.0-simulator",
    }
    
    headers = {
        "X-Device-ID": device_id,
        "X-Device-Token": device_token,
        "Content-Type": "application/json",
    }
    
    try:
        url = f"{base_url.rstrip('/')}/api/v1/ingest"
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code == 201:
            data = resp.json()
            aqi = data.get("aqi") or {}
            print(f"[{now.strftime('%H:%M:%S')}] Ingested [{scenario_id}] "
                  f"PM2.5: {readings['pm25']} | PM10: {readings['pm10']} | "
                  f"AQI: {aqi.get('value')} ({aqi.get('category')})")
        else:
            print(f"[{now.strftime('%H:%M:%S')}] Failed ({resp.status_code}): {resp.text}")
    except Exception as e:
        print(f"[{now.strftime('%H:%M:%S')}] Ingest network error: {e}")


async def main():
    parser = argparse.ArgumentParser(description="STREETAIR Software Simulator")
    parser.add_argument("--url", default="http://localhost:8000", help="Base backend URL")
    parser.add_argument("--station", default=DEFAULT_STATION_ID, help="Station ID")
    parser.add_argument("--device", default=DEFAULT_DEVICE_ID, help="Device ID")
    parser.add_argument("--scenario", default="normal", choices=list(SCENARIO_PROFILES.keys()), help="Scenario ID")
    parser.add_argument("--interval", type=int, default=5, help="Interval in seconds")
    parser.add_argument("--count", type=int, default=1, help="Number of readings to send (0 for infinite)")
    args = parser.parse_args()

    token = generate_device_token(args.device, settings.DEVICE_AUTH_SECRET)
    print(f"[*] Starting STREETAIR Simulator")
    print(f"    Target URL: {args.url}")
    print(f"    Station:    {args.station}")
    print(f"    Device:     {args.device}")
    print(f"    Scenario:   {args.scenario}")
    print(f"    Interval:   {args.interval}s")

    async with httpx.AsyncClient(timeout=10.0) as client:
        sent = 0
        while args.count == 0 or sent < args.count:
            await send_reading(
                client=client,
                base_url=args.url,
                device_id=args.device,
                station_id=args.station,
                scenario_id=args.scenario,
                device_token=token,
            )
            sent += 1
            if args.count == 0 or sent < args.count:
                await asyncio.sleep(args.interval)


if __name__ == "__main__":
    asyncio.run(main())

