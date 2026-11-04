"""Subscription plans endpoints."""
from __future__ import annotations
from fastapi import APIRouter
from app.schemas.subscriptions import PlanResponse
from app.integrations.firebase import get_firestore
from app.repositories.subscriptions_repository import PlansRepository

router = APIRouter(prefix="/plans", tags=["Plans & Subscriptions"])


@router.get("", response_model=list[PlanResponse])
async def list_plans():
    """List publicly available SaaS subscription plans."""
    db = get_firestore()
    repo = PlansRepository(db)
    plans = await repo.list_active_plans()
    return plans

