"""
STREETAIR AI Engine — Internal Chat Endpoint
==============================================
POST /internal/v1/chat
Accepts validated, authorized context from the central backend.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import verify_internal_token
from app.orchestration.chat_orchestrator import ChatOrchestrator
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/internal/v1", tags=["Chat"])
_orchestrator = ChatOrchestrator()


@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(verify_internal_token)])
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """
    Execute evidence-grounded chat completion for authorized backend requests.
    """
    return await _orchestrator.process(request)

