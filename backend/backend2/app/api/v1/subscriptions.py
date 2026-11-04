"""Subscriptions management endpoints."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query, status
from app.core.dependencies import require_authenticated_user
from app.schemas.auth import UserContext
from app.schemas.subscriptions import SubscriptionResponse
from app.integrations.firebase import get_firestore
from app.repositories.subscriptions_repository import (
    PlansRepository, SubscriptionsRepository, UsageRecordsRepository
)
from app.services.subscription_service import SubscriptionService
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/subscriptions", tags=["Plans & Subscriptions"])


def get_sub_service() -> SubscriptionService:
    db = get_firestore()
    return SubscriptionService(PlansRepository(db), SubscriptionsRepository(db), UsageRecordsRepository(db))


@router.get("/current", response_model=SubscriptionResponse)
async def get_current_subscription(
    user: UserContext = Depends(require_authenticated_user),
):
    """Get active subscription for current user or organisation."""
    service = get_sub_service()
    sub = await service.get_current_subscription(uid=user.uid, organisation_id=user.organisation_id)
    if not sub:
        raise NotFoundError("No active subscription found. Please select a plan.")
    return sub


@router.post("/request", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def request_subscription(
    plan_id: str = Query(...),
    user: UserContext = Depends(require_authenticated_user),
):
    """
    Request a subscription plan (demo/quote state).
    Initiates payment workflow without charging in demonstration mode.
    """
    service = get_sub_service()
    return await service.request_subscription(
        uid=user.uid,
        organisation_id=user.organisation_id,
        plan_id=plan_id,
    )

