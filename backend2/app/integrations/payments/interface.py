"""
Payment provider interface.
Provider-neutral payment integration abstraction.
No real payment provider is integrated in the initial release.
All payment flows are in DEMO/REQUEST state until a provider is connected.

IMPORTANT: Never mark a subscription active based only on a frontend callback.
Payment webhook verification must be implemented per-provider before going live.
"""
from __future__ import annotations
import logging
from abc import ABC, abstractmethod
from datetime import datetime

logger = logging.getLogger(__name__)


class PaymentProvider(ABC):
    """Abstract base class for payment provider integration."""

    @abstractmethod
    async def create_subscription_request(
        self,
        organisation_id: str,
        plan_id: str,
        price: float,
        currency: str,
    ) -> dict:
        """Initiate a subscription request. Returns provider reference."""
        ...

    @abstractmethod
    async def verify_webhook(self, payload: bytes, signature: str) -> dict:
        """Cryptographically verify an incoming webhook. Returns parsed event."""
        ...

    @abstractmethod
    async def cancel_subscription(self, provider_ref: str) -> bool:
        ...


class DemoPaymentProvider(PaymentProvider):
    """
    Demo/stub payment provider for hackathon demonstration.
    All transactions are marked as 'demo' state.
    Replace with a real provider (Razorpay, Stripe) for production.
    """

    async def create_subscription_request(
        self,
        organisation_id: str,
        plan_id: str,
        price: float,
        currency: str,
    ) -> dict:
        logger.info(
            "Demo subscription request created",
            extra={"organisation_id": organisation_id, "plan_id": plan_id},
        )
        return {
            "provider": "demo",
            "reference": f"DEMO-{organisation_id}-{plan_id}",
            "status": "demo",
            "message": (
                "This is a demonstration. No real payment has been processed. "
                "Contact us to arrange a subscription."
            ),
        }

    async def verify_webhook(self, payload: bytes, signature: str) -> dict:
        raise NotImplementedError("Demo provider does not process webhooks.")

    async def cancel_subscription(self, provider_ref: str) -> bool:
        return True


# Active provider — swap for real provider in production
active_payment_provider: PaymentProvider = DemoPaymentProvider()
