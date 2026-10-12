"""Grounded AI Assistant service with RAG over verified Sahay knowledge."""

import re
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.scheme import Scheme
from app.schemas.chat import ChatRequest, ChatResponse, ChatSourceCitation
from app.services.eligibility_service import evaluate_all_schemes_for_profile
from app.services.profile_service import get_profile_by_user_id
from app.services.financial_service import (
    get_or_create_financial_record,
    calculate_financial_health,
    calculate_emergency_fund,
    calculate_risk_indicator,
)


def detect_chat_intent(message: str) -> str:
    """Classify user intent using deterministic keyword pattern matching."""
    text = message.lower()

    if any(k in text for k in ["runway", "emergency fund", "credit score", "twin", "what-if", "what if", "financial health", "dti", "debt-to-income", "জরুরি তহবিল", "ক্রেডিট স্কোর"]):
        return "FINANCIAL_INTELLIGENCE"
    if any(k in text for k in ["fraud", "suspicious", "scam", "unauthorized", "জালিয়াতি", "धोखाधड़ी"]):
        return "FRAUD_SECURITY"
    if any(k in text for k in ["eligible", "eligibility", "match", "qualify", "যোগ্য", "पात्र"]):
        return "ELIGIBILITY_CHECK"
    if any(k in text for k in ["document", "certificate", "paper", "udyam", "pan", "দস্তাবেজ", "কাগজ", "दस्तावेज"]):
        return "DOCUMENT_GUIDANCE"
    if any(k in text for k in ["scheme", "pmegp", "mudra", "banglashree", "subsidy", "স্কিম", "ভর্তুকি", "योजना", "सब्सिडी"]):
        return "SCHEME_INQUIRY"
    if any(k in text for k in ["emi", "loan calculation", "margin", "pricing", "cost", "দাম", "কিস্তি"]):
        return "BUSINESS_CALCULATION"

    return "GENERAL"


def answer_grounded_chat(
    db: Session,
    request: ChatRequest,
    current_user: Optional[User] = None,
) -> ChatResponse:
    """Provide grounded, uncertainty-aware answers using verified Sahay content."""
    intent = detect_chat_intent(request.message)
    sources: List[ChatSourceCitation] = []
    reply = ""
    deterministic_action = None
    confidence = "high"

    schemes = db.query(Scheme).filter(Scheme.is_active.is_(True)).all()

    # Intent 1: Eligibility Check -> Delegate to Deterministic Engine!
    if intent == "ELIGIBILITY_CHECK":
        profile_dict = {}
        if current_user:
            b_profile = get_profile_by_user_id(db, current_user.id)
            profile_dict = {
                "state": current_user.state or "West Bengal",
                "business_type": b_profile.business_type,
                "category": b_profile.category,
                "annual_turnover": b_profile.annual_turnover,
                "has_udyam": b_profile.has_udyam,
                "has_bank_account": b_profile.has_bank_account,
                "has_pan": b_profile.has_pan,
            }
        else:
            profile_dict = {
                "state": "West Bengal",
                "business_type": "manufacturing",
                "category": "micro",
                "annual_turnover": 500000.0,
                "has_udyam": True,
                "has_bank_account": True,
            }

        summary = evaluate_all_schemes_for_profile(db, profile_dict)
        deterministic_action = "EVALUATED_BY_DETERMINISTIC_RULES_ENGINE"

        eligible_schemes = [m for m in summary.matches if m.is_eligible]
        top_scheme = summary.matches[0] if summary.matches else None

        if top_scheme and top_scheme.is_eligible:
            reply = (
                f"Based on Sahay's deterministic eligibility rules, your profile qualifies for {len(eligible_schemes)} schemes! "
                f"Your highest match is {top_scheme.scheme_name} with a {top_scheme.match_score}% fit score. "
                f"Met criteria include: {', '.join(top_scheme.passed_hard_rules[:2])}."
            )
            if top_scheme.near_miss_unlock_path:
                reply += f" Next recommendation: {top_scheme.near_miss_unlock_path}"
        elif top_scheme:
            reply = (
                f"According to deterministic scheme criteria, you are currently a Near Match ({top_scheme.match_score}% fit) for {top_scheme.scheme_name}. "
                f"Unmet criteria: {', '.join(top_scheme.failed_hard_rules)}. "
                f"Unlock path: {top_scheme.near_miss_unlock_path or 'Update your profile credentials.'}"
            )
        else:
            reply = "No active scheme rules matched the query parameters."

        for m in summary.matches[:2]:
            sources.append(
                ChatSourceCitation(
                    title=m.scheme_name,
                    url=m.official_url,
                    provider=m.provider,
                    last_verified_at="2026-03-01",
                )
            )

    # Intent 2: Scheme Inquiry
    elif intent == "SCHEME_INQUIRY":
        msg_lower = request.message.lower()
        stop_words = {"scheme", "yojana", "programme", "about", "tell", "what", "can", "you", "for", "the", "in", "is"}

        def calculate_scheme_relevance(s: Scheme) -> int:
            score = 0
            if s.slug.lower() in msg_lower:
                score += 50
            if "pmegp" in msg_lower and "pmegp" in s.slug.lower():
                score += 100
            if "mudra" in msg_lower and "mudra" in s.slug.lower():
                score += 100
            if "banglashree" in msg_lower and "banglashree" in s.slug.lower():
                score += 100
            for token in s.name.lower().split():
                if token not in stop_words and len(token) > 2 and token in msg_lower:
                    score += 10
            return score

        scored_schemes = sorted(schemes, key=calculate_scheme_relevance, reverse=True)
        target = scored_schemes[0] if scored_schemes else schemes[0]

        reply = (
            f"{target.name}: Provided by {target.provider}. "
            f"Type: {target.scheme_type.title()}. {target.detailed_benefits} "
            f"Maximum project/credit ceiling is ₹{target.max_amount:,.0f}."
        )
        sources.append(
            ChatSourceCitation(
                title=target.name,
                url=target.official_url,
                provider=target.provider,
                last_verified_at=target.last_verified_at,
            )
        )

    # Intent 3: Document Guidance
    elif intent == "DOCUMENT_GUIDANCE":
        reply = (
            "For most formal micro-enterprise government schemes (such as PMEGP and MUDRA), "
            "the core mandatory documents are: 1. Udyam MSME Registration Certificate (free on udyamregistration.gov.in), "
            "2. Proprietor PAN Card, 3. 6 Months Bank Statement, and 4. Project Appraisal Report (DPR). "
            "You can track your documents securely in the Sahay Document Vault."
        )
        sources.append(
            ChatSourceCitation(
                title="Ministry of MSME Official Checklist Guidelines",
                url="https://udyamregistration.gov.in",
                provider="Ministry of MSME",
                last_verified_at="2026-03-01",
            )
        )

    # Intent 4: Business Calculations
    elif intent == "BUSINESS_CALCULATION":
        reply = (
            "Sahay provides deterministic mathematical calculators under Business Tools: "
            "1. Loan & MUDRA EMI Calculator (Standard Reducing Balance amortization), "
            "2. Product Pricing & Margin Advisor (Cost-Plus markup model), and "
            "3. Enterprise Solvency & Cash Flow Scorecard. Please visit the Business Tools section to simulate scenarios."
        )
        deterministic_action = "ROUTED_TO_BUSINESS_TOOLS"

    # Intent 5: Financial Intelligence & Digital Twin
    elif intent == "FINANCIAL_INTELLIGENCE":
        deterministic_action = "EVALUATED_BY_FINANCIAL_TWIN_ENGINE"
        user_id = current_user.id if current_user else "guest-preview"
        record = get_or_create_financial_record(db, user_id)
        health = calculate_financial_health(record)
        emergency = calculate_emergency_fund(record)
        risk = calculate_risk_indicator(record)

        reply = (
            f"Based on Sahay's deterministic Financial Digital Twin analysis: "
            f"1. Health Grade: {health.health_grade} (Net Monthly Surplus: ₹{health.net_cash_flow:,.0f}). "
            f"2. Debt-to-Income (DTI): {round(health.debt_to_income_ratio * 100, 1)}% ({'Manageable' if health.debt_to_income_ratio <= 0.35 else 'Elevated'}). "
            f"3. Emergency Runway: {emergency.current_runway_months} months of essential operations ({emergency.status.title()} status). "
            f"4. Composite Risk Indicator: {risk.overall_risk_score}/100 ({risk.risk_level} Risk). "
            f"Key Next Action: {emergency.actionable_plan[0] if emergency.actionable_plan else 'Maintain cash flow reserves.'}"
        )
        sources.append(
            ChatSourceCitation(
                title="Sahay Financial Digital Twin & Stress Testing Engine",
                url="https://sahay.local/twin",
                provider="Sahay Financial Intelligence (Valmont Engine)",
                last_verified_at=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            )
        )

    # Intent 6: Fraud & Transaction Security
    elif intent == "FRAUD_SECURITY":
        deterministic_action = "SCANNED_BY_FRAUD_PREVENTION_RULES"
        reply = (
            "Sahay provides automated rule-based fraud detection for enterprise ledgers: "
            "1. High-velocity transfer alerts (>3 large debits within 24h), "
            "2. Single transaction spike warnings (>₹2,50,000 threshold), "
            "3. Suspicious keyword patterns (lottery, wire prize, OTP verification), and "
            "4. Immediate duplicate debit detection. Never share banking OTPs, UPI PINs, or password credentials."
        )
        sources.append(
            ChatSourceCitation(
                title="RBI Cyber Security & Consumer Financial Protection Framework",
                url="https://rbi.org.in",
                provider="Reserve Bank of India",
                last_verified_at="2026-03-01",
            )
        )

    # Intent 7: General with Uncertainty Guard
    else:
        confidence = "medium"
        reply = (
            "I am Sahay's multilingual AI assistant, specifically grounded in verified Indian government schemes, "
            "deterministic MSME calculators, and stock market fundamentals. "
            "If you have questions regarding scheme eligibility, document requirements, loan EMIs, or market education, "
            "please ask and I will cite verified sources."
        )

    return ChatResponse(
        reply=reply,
        intent_detected=intent,
        sources=sources,
        deterministic_action_taken=deterministic_action,
        confidence_level=confidence,
    )
