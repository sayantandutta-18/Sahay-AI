"""Grounded AI Assistant /chat endpoint."""

from typing import Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.routes.auth import security_scheme
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import answer_grounded_chat
from app.services.user_service import get_user_by_id
from app.core.security import decode_access_token
from app.core.rate_limit import InMemoryRateLimiter

router = APIRouter(prefix="/chat", tags=["AI Assistant (RAG)"])
chat_rate_limiter = InMemoryRateLimiter(
    times=getattr(settings, "AI_RATE_LIMIT_TIMES", 15),
    seconds=getattr(settings, "AI_RATE_LIMIT_SECONDS", 60),
)


@router.post("", response_model=ChatResponse)
def grounded_chat(
    chat_req: ChatRequest,
    raw_request: Request,
    credentials=Depends(security_scheme),
    db: Session = Depends(get_db),
):
    """Answer user questions with citations grounded strictly in verified Sahay content.

    Supports:
    - Demo Mode: pre-written verified explanations, no network call.
    - Live Mode: calls Gemini/OpenAI API if keys configured, with automatic fallback.
    - Rate Limiting: serves fallback response without throwing raw 429 errors.
    """
    current_user = None
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload and "sub" in payload:
            current_user = get_user_by_id(db, payload["sub"])

    user_key = f"user:{current_user.id}" if current_user else None
    is_limited = chat_rate_limiter.check_rate_limit(raw_request, key=user_key)

    return answer_grounded_chat(db, chat_req, current_user, rate_limited=is_limited)
