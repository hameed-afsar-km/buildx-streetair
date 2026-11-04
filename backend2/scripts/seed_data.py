"""
STREETAIR — Demonstration & Environment Seed Script.

Seeds:
1. Crescent Institute Demonstration Station (B.S. Abdur Rahman Crescent Institute of Science and Technology, Vandalur)
2. Demonstration Device with provisioned HMAC key
3. SaaS Subscription Plans (Starter, Professional, Enterprise)
4. Initial Demonstration Scenarios
5. Demo Organization

Requirements:
- Repeatable / Idempotent
- Preserves simulated provenance flag on all generated records
"""
from __future__ import annotations
import asyncio
import os
import sys
from datetime import datetime, timezone

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.core.security import generate_device_token, hash_api_key
from app.integrations.firebase import initialize_firebase, get_firestore


CRESCENT_STATION_ID = "ST-CRESCENT-01"
CRESCENT_DEVICE_ID = "DEV-ESP32-CRESCENT"
DEMO_ORG_ID = "ORG-CRESCENT-CAMPUS"

# Crescent Institute coordinates: Vandalur, Chennai, Tamil Nadu, India
CRESCENT_LAT = 12.8797
CRESCENT_LON = 80.0805


async def seed():
    print(f"[*] Starting STREETAIR database seeding in {settings.APP_ENV} mode...")
    
    try:
        initialize_firebase(settings.FIREBASE_CREDENTIALS_PATH, settings.FIREBASE_PROJECT_ID)
        db = get_firestore()
    except Exception as e:
        print(f"[!] Warning: Firebase initialization failed: {e}")
        print("[!] To run seed against live Firestore, configure .env with valid Firebase credentials.")
        return

    now = datetime.now(timezone.utc)

    # 1. Seed Demo Organisation
    org_ref = db.collection("organisations").document(DEMO_ORG_ID)
    await org_ref.set({
        "organisation_id": DEMO_ORG_ID,
        "name": "B.S. Abdur Rahman Crescent Institute",
        "organisation_type": "education",
        "status": "active",
        "plan_id": "plan_professional",
        "created_at": now,
        "updated_at": now,
        "configuration": {
            "primary_campus": "Vandalur Campus",
            "state": "Tamil Nadu",
            "country": "India",
        },
    }, merge=True)
    print(f"[+] Seeded Organisation: {DEMO_ORG_ID}")

    # 2. Seed Crescent Demonstration Station
    station_ref = db.collection("monitoring_stations").document(CRESCENT_STATION_ID)
    await station_ref.set({
        "station_id": CRESCENT_STATION_ID,
        "organisation_id": DEMO_ORG_ID,
        "name": "Crescent Institute Campus Station 1",
        "description": "Primary demonstration station at Crescent Institute, Vandalur, Tamil Nadu.",
        "latitude": CRESCENT_LAT,
        "longitude": CRESCENT_LON,
        "station_type": "fixed",
        "source_mode": "simulated",
        "status": "active",
        "device_id": CRESCENT_DEVICE_ID,
        "created_at": now,
        "updated_at": now,
        "last_seen_at": now,
        "metadata": {
            "location_name": "Department of Computer Science & Engineering",
            "hardware_type": "ESP32_Keypad_LCD",
        },
    }, merge=True)
    print(f"[+] Seeded Station: {CRESCENT_STATION_ID}")

    # 3. Seed Crescent Demonstration Device
    token = generate_device_token(CRESCENT_DEVICE_ID, settings.DEVICE_AUTH_SECRET)
    dev_ref = db.collection("devices").document(CRESCENT_DEVICE_ID)
    await dev_ref.set({
        "device_id": CRESCENT_DEVICE_ID,
        "station_id": CRESCENT_STATION_ID,
        "organisation_id": DEMO_ORG_ID,
        "device_status": "active",
        "api_key_hash": hash_api_key(token),
        "created_at": now,
        "updated_at": now,
        "last_seen_at": now,
        "firmware_version": "v1.0.0-demo",
    }, merge=True)
    print(f"[+] Seeded Device: {CRESCENT_DEVICE_ID}")
    print(f"    -> Device Auth Token: {token}")

    # 4. Seed SaaS Plans
    plans = [
        {
            "plan_id": "plan_starter",
            "name": "STARTER",
            "billing_period": "monthly",
            "price": 2999.0,
            "currency": "INR",
            "feature_entitlements": {
                "max_stations": 1,
                "history_days": 7,
                "basic_alerts": True,
                "forecasting": False,
                "ai_chat": True,
            },
            "usage_limits": {
                "ai_chat_queries": 100,
                "monthly_reports": 20,
            },
            "active": True,
            "display_order": 1,
            "created_at": now,
            "updated_at": now,
        },
        {
            "plan_id": "plan_professional",
            "name": "PROFESSIONAL",
            "billing_period": "monthly",
            "price": 9999.0,
            "currency": "INR",
            "feature_entitlements": {
                "max_stations": 5,
                "history_days": 90,
                "basic_alerts": True,
                "forecasting": True,
                "ai_chat": True,
                "hotspot_analysis": True,
            },
            "usage_limits": {
                "ai_chat_queries": 500,
                "monthly_reports": 100,
            },
            "active": True,
            "display_order": 2,
            "created_at": now,
            "updated_at": now,
        },
        {
            "plan_id": "plan_enterprise",
            "name": "ENTERPRISE",
            "billing_period": "annual",
            "price": 49999.0,
            "currency": "INR",
            "feature_entitlements": {
                "max_stations": 50,
                "history_days": 365,
                "basic_alerts": True,
                "forecasting": True,
                "ai_chat": True,
                "hotspot_analysis": True,
                "custom_sla": True,
                "api_access": True,
            },
            "usage_limits": {
                "ai_chat_queries": 5000,
                "monthly_reports": 1000,
            },
            "active": True,
            "display_order": 3,
            "created_at": now,
            "updated_at": now,
        },
    ]

    for p in plans:
        await db.collection("plans").document(p["plan_id"]).set(p, merge=True)
        print(f"[+] Seeded Plan: {p['name']} ({p['plan_id']})")

    print("[*] Database seeding completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed())

