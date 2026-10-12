"""Grounded AI Assistant /chat endpoint."""

from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import security_scheme
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import answer_grounded_chat
from app.services.user_service import get_user_by_id
from app.core.security import decode_access_token

router = APIRouter(prefix="/chat", tags=["AI Assistant (RAG)"])


@router.post("", response_model=ChatResponse)
def grounded_chat(
    request: ChatRequest,
    credentials=Depends(security_scheme),
    db: Session = Depends(get_db),
):
    """Answer user questions with citations grounded strictly in verified Sahay content."""
    current_user = None
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload and "sub" in payload:
            current_user = get_user_by_id(db, payload["sub"])

    return answer_grounded_chat(db, request, current_user)
