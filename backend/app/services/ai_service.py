import json
import logging
import urllib.request
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.core.config import settings
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

logger = logging.getLogger(__name__)


def call_llm_service(prompt: str, system_prompt: str = "") -> tuple[Optional[str], Optional[str]]:
    """Pluggable LLM invocation helper.

    When LLM_PROVIDER and API key are configured, dispatches an external
    API call with strict timeouts. Returns (reply_text, None) on success,
    or (None, error_reason) on failure or if mock/none.
    """
    api_key = (
        settings.LLM_API_KEY
        or getattr(settings, "GEMINI_API_KEY", "")
        or getattr(settings, "OPENAI_API_KEY", "")
    )
    provider = settings.LLM_PROVIDER.lower() if settings.LLM_PROVIDER else "mock"

    if not api_key or provider in ["mock", "none", ""]:
        return None, "No external LLM API key configured in environment (GEMINI_API_KEY or OPENAI_API_KEY)"

    try:
        if provider == "gemini":
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": f"{system_prompt}\n\nUser Question:\n{prompt}"}]}]
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        return parts[0]["text"].strip(), None
                return None, "Gemini returned empty candidate content"
        elif provider == "openai":
            url = "https://api.openai.com/v1/chat/completions"
            payload = {
                "model": settings.LLM_MODEL or "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt or "You are Sahay AI, an MSME advisory assistant."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                choices = data.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content", "").strip(), None
                return None, "OpenAI returned empty choices"
        else:
            return None, f"Unsupported LLM provider: {provider}"
    except Exception as exc:
        logger.warning("Pluggable LLM invocation failed or timed out: %s", exc)
        return None, str(exc)


def detect_chat_intent(message: str) -> str:
    """Classify user intent using deterministic keyword pattern matching."""
    text = message.lower()

    if any(k in text for k in ["runway", "emergency fund", "credit score", "twin", "what-if", "what if", "financial health", "dti", "debt-to-income", "afford", "affordability", "without income", "income loss", "job loss", "50k", "50000 loan", "জরুরি তহবিল", "ক্রেডিট স্কোর", "লোন কি সম্ভব"]):
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
    rate_limited: bool = False,
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
        if not schemes:
            reply = "No active verified schemes currently registered in Sahay's directory."
        else:
            msg_lower = request.message.lower()
            stop_words = {"scheme", "yojana", "programme", "about", "tell", "what", "can", "you", "for", "the", "in", "is"}

            def calculate_scheme_relevance(s: Scheme) -> int:
                score = 0
                s_name_lower = s.name.lower()
                s_slug_lower = s.slug.lower()

                if s_slug_lower in msg_lower:
                    score += 50
                if "pmegp" in msg_lower and ("pmegp" in s_slug_lower or "pmegp" in s_name_lower):
                    score += 100
                if ("mudra" in msg_lower or "pmmy" in msg_lower) and ("mudra" in s_name_lower or "pmmy" in s_slug_lower):
                    score += 100
                if "banglashree" in msg_lower and ("banglashree" in s_slug_lower or "banglashree" in s_name_lower):
                    score += 100
                if ("svanidhi" in msg_lower or "street vendor" in msg_lower) and ("svanidhi" in s_slug_lower or "svanidhi" in s_name_lower):
                    score += 100
                if ("stand up" in msg_lower or "standup" in msg_lower) and ("stand-up" in s_slug_lower or "stand-up" in s_name_lower):
                    score += 100

                for token in s_name_lower.split():
                    if token not in stop_words and len(token) > 2 and token in msg_lower:
                        score += 10
                return score

            scored_schemes = sorted(schemes, key=calculate_scheme_relevance, reverse=True)
            target = scored_schemes[0]
            last_verified = target.last_verified_at or datetime.now(timezone.utc).strftime("%Y-%m-%d")

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
                    last_verified_at=last_verified,
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
        if current_user:
            record = get_or_create_financial_record(db, current_user.id)
        else:
            from app.models.financial_twin import FinancialRecord
            record = FinancialRecord(
                id="transient-preview",
                user_id="preview",
                monthly_income=65000.0,
                monthly_expenses=38000.0,
                total_savings=140000.0,
                emergency_fund_target=200000.0,
                monthly_debt_obligations=12000.0,
                total_debt=250000.0,
                credit_score=720,
                credit_score_status="good",
                last_credit_check_date=datetime.now(timezone.utc),
            )
        health = calculate_financial_health(record)
        emergency = calculate_emergency_fund(record)
        risk = calculate_risk_indicator(record)
        msg_lower = request.message.lower()

        if any(w in msg_lower for w in ["afford", "50k", "50000", "loan"]):
            # Standard MSME micro-loan: ₹50,000 at 12% for 24 months = ₹2,354/mo
            hypothetical_emi = 2354.0
            new_surplus = health.net_cash_flow - hypothetical_emi
            post_dti = round(((record.monthly_debt_obligations + hypothetical_emi) / max(record.monthly_income, 1.0)) * 100, 1)
            can_afford = new_surplus > 0 and post_dti <= 45.0
            verdict = "Yes, you can sustainably afford this loan" if can_afford else "Caution: High leverage risk"

            reply = (
                f"{verdict}. For a ₹50,000 equipment loan (12% p.a., 24-mo tenure), estimated EMI is ₹{hypothetical_emi:,.0f}/month. "
                f"With your current net monthly surplus of ₹{health.net_cash_flow:,.0f}, your post-loan surplus will be ₹{new_surplus:,.0f}/month. "
                f"Your Debt-to-Income (DTI) ratio shifts from {round(health.debt_to_income_ratio * 100, 1)}% to {post_dti}% "
                f"({'within safe MSME limits' if post_dti <= 35 else 'approaching elevated debt load'}). "
                f"You can stress-test this in the Sahay Financial Digital Twin."
            )
        elif any(w in msg_lower for w in ["without income", "income loss", "job loss", "loss of income"]):
            zero_income_months = round(record.total_savings / max(record.monthly_expenses, 1.0), 1)
            reply = (
                f"Based on your verified liquid savings of ₹{record.total_savings:,.0f} and essential monthly expenses of ₹{record.monthly_expenses:,.0f}, "
                f"you can sustain your enterprise for approximately {zero_income_months} months with zero revenue before liquid reserves are exhausted. "
                f"Target recommended reserve is 6 months (₹{emergency.recommended_target_amount:,.0f}). "
                f"Current Status: {emergency.status.title()}."
            )
        else:
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
                provider="Sahay-AI Financial Intelligence Engine",
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

    demo_reply = reply
    requested_mode = (request.mode or getattr(settings, "AI_MODE", "auto")).lower()
    api_key = (
        settings.LLM_API_KEY
        or getattr(settings, "GEMINI_API_KEY", "")
        or getattr(settings, "OPENAI_API_KEY", "")
    )
    has_key = bool(api_key and settings.LLM_PROVIDER not in ["mock", "none", ""])

    mode_used = "demo"
    fallback_reason: Optional[str] = None
    final_reply = demo_reply

    if rate_limited:
        mode_used = "fallback"
        fallback_reason = "Rate limit reached (too many requests per minute). Showing verified offline response."
        final_reply = demo_reply
    elif requested_mode == "demo" or getattr(settings, "AI_MODE", "").lower() == "demo":
        mode_used = "demo"
        fallback_reason = None
        final_reply = demo_reply
    elif requested_mode == "live":
        if not has_key:
            mode_used = "fallback"
            fallback_reason = "No external AI API key configured in environment (GEMINI_API_KEY or OPENAI_API_KEY). Showing verified offline response."
            final_reply = demo_reply
        else:
            sys_prompt = (
                "You are Sahay AI, an expert advisory assistant for Indian micro-entrepreneurs. "
                f"Respond in {request.language_preference or 'English'}. "
                "Explain schemes and calculations simply and accurately based strictly on official facts. "
                "Do not hallucinate unsupported benefits or legal approvals."
            )
            llm_text, err = call_llm_service(request.message, system_prompt=sys_prompt)
            if llm_text:
                mode_used = "live"
                fallback_reason = None
                final_reply = llm_text
            else:
                mode_used = "fallback"
                fallback_reason = f"Live AI call failed: {err}. Showing verified offline response."
                final_reply = demo_reply
    else:
        # Auto mode
        if has_key:
            sys_prompt = (
                "You are Sahay AI, an expert advisory assistant for Indian micro-entrepreneurs. "
                f"Respond in {request.language_preference or 'English'}. "
                "Explain schemes and calculations simply and accurately based strictly on official facts. "
                "Do not hallucinate unsupported benefits or legal approvals."
            )
            llm_text, err = call_llm_service(request.message, system_prompt=sys_prompt)
            if llm_text:
                mode_used = "live"
                fallback_reason = None
                final_reply = llm_text
            else:
                mode_used = "fallback"
                fallback_reason = f"Live AI call failed: {err}. Showing verified offline response."
                final_reply = demo_reply
        else:
            mode_used = "demo"
            fallback_reason = None
            final_reply = demo_reply

    legal_disclaimer = (
        "Disclaimer: Sahay AI provides informational guidance based on public government guidelines "
        "and deterministic calculations. Answers do not constitute legal, tax, or formal credit approval. "
        "Official sanctions are issued solely by respective banks and government nodal agencies."
    )

    return ChatResponse(
        reply=final_reply,
        intent_detected=intent,
        sources=sources,
        deterministic_action_taken=deterministic_action,
        confidence_level=confidence,
        mode_used=mode_used,
        fallback_reason=fallback_reason,
        legal_disclaimer=legal_disclaimer,
    )
