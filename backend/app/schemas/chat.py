"""Pydantic schemas for Grounded AI Assistant and RAG."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatSourceCitation(BaseModel):
    title: str = Field(..., description="Document or scheme title")
    url: Optional[str] = Field(default=None, description="Official government portal URL")
    provider: Optional[str] = Field(default=None, description="Ministry or institution")
    last_verified_at: Optional[str] = Field(default=None, description="Verification date YYYY-MM-DD")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=2, description="Natural-language prompt in English, Hindi, or Bengali")
    conversation_id: Optional[str] = None
    language_preference: Optional[str] = Field(default="en", description="en, hi, bn")
    mode: Optional[str] = Field(default="auto", description="Execution mode: 'auto', 'demo', or 'live'")


class ChatResponse(BaseModel):
    reply: str = Field(..., description="Grounded, uncertainty-aware answer")
    intent_detected: str = Field(..., description="SCHEME_INQUIRY, ELIGIBILITY_CHECK, DOCUMENT_GUIDANCE, BUSINESS_CALCULATION, GENERAL")
    sources: List[ChatSourceCitation] = []
    deterministic_action_taken: Optional[str] = None
    confidence_level: str = Field(default="high", description="high, medium, uncertain")
    compliance_disclaimer: str = Field(
        default="Answers are grounded strictly in verified Sahay schemes and calculations. The AI does not invent eligibility, grant amounts, or stock advice."
    )
    mode_used: str = Field(default="demo", description="The mode that produced this response: 'demo', 'live', or 'fallback'")
    fallback_reason: Optional[str] = Field(default=None, description="Detailed explanation if fallback was triggered")
    legal_disclaimer: str = Field(
        default="Disclaimer: Sahay AI provides informational guidance based on public government guidelines and deterministic calculations. Answers do not constitute legal, tax, or formal credit approval. Official sanctions are issued solely by respective banks and government nodal agencies."
    )
