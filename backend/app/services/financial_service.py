"""Valmont-inspired Financial Intelligence & Digital Twin deterministic services.

Deterministic calculation engines for:
- Financial Health Analysis
- Emergency Fund Runway
- Job/Income Loss Stress Simulator
- What-If Scenario Modeler
- Credit Score Factors Explainer
- Explainable Risk Indicator Rubric
- Rule-based Transaction Fraud Detection
- End-to-End Digital Twin Workflow: Analyze -> Simulate -> Predict -> Assess Risk -> Decide
"""

from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from app.models.financial_twin import (
    FinancialRecord,
    FinancialTransaction,
    FinancialTwinScenario,
)
from app.models.business_profile import BusinessProfile
from app.schemas.financial import (
    MonthTrajectory,
    FinancialHealthResponse,
    EmergencyFundResponse,
    IncomeLossSimulationResponse,
    WhatIfSimulationRequest,
    WhatIfSimulationResponse,
    CreditFactor,
    CreditScoreExplainerResponse,
    RiskDimension,
    FinancialRiskIndicatorResponse,
    FraudAlert,
    DigitalTwinDecision,
    DigitalTwinWorkflowResponse,
)


COMPLIANCE_DISCLAIMER = (
    "Sahay provides educational simulations and financial decision-support analytics. "
    "Sahay is an independent software companion and not a registered credit rating agency, SEBI-registered "
    "investment adviser, or banking institution. Simulations do not guarantee loan approvals, "
    "credit rating changes, or investment performance."
)


def get_or_create_financial_record(db: Session, user_id: str) -> FinancialRecord:
    """Retrieve existing financial record or initialize with realistic MSME parameters."""
    record = db.query(FinancialRecord).filter(FinancialRecord.user_id == user_id).first()
    if record:
        return record

    # Check if business profile exists to calibrate income and expense defaults
    bp = db.query(BusinessProfile).filter(BusinessProfile.user_id == user_id).first()
    monthly_income = bp.monthly_revenue if (bp and bp.monthly_revenue > 0) else 65000.0
    monthly_expense = bp.monthly_expense if (bp and bp.monthly_expense > 0) else 38000.0
    existing_debt = bp.existing_loans / 24.0 if (bp and bp.existing_loans > 0) else 6000.0

    essential_expenses = round(monthly_expense * 0.70, 2)
    discretionary_expenses = round(monthly_expense * 0.30, 2)
    liquid_savings = round(essential_expenses * 3.5, 2)

    new_record = FinancialRecord(
        user_id=user_id,
        monthly_income=monthly_income,
        essential_expenses=essential_expenses,
        discretionary_expenses=discretionary_expenses,
        monthly_debt_emi=round(existing_debt, 2),
        liquid_savings=liquid_savings,
        estimated_credit_score=728,
        credit_utilization_pct=26.5,
        on_time_payment_pct=98.0,
        credit_history_months=30,
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


def get_financial_record_for_user_or_preview(db: Session, user: Optional[Any]) -> FinancialRecord:
    """Retrieve financial record for authenticated user or return transient demo record for guest preview."""
    if user and getattr(user, "id", None):
        return get_or_create_financial_record(db, user.id)

    # In-memory transient demo profile (realistic micro-enterprise baseline)
    return FinancialRecord(
        id="transient-demo-preview",
        user_id="demo-preview",
        monthly_income=65000.0,
        essential_expenses=26600.0,
        discretionary_expenses=11400.0,
        monthly_debt_emi=6000.0,
        liquid_savings=93100.0,
        estimated_credit_score=728,
        credit_utilization_pct=26.5,
        on_time_payment_pct=98.0,
        credit_history_months=30,
    )


def calculate_financial_health(record: FinancialRecord) -> FinancialHealthResponse:
    """Compute deterministic financial health metrics, debt-to-income, and grade."""
    total_expenses = record.essential_expenses + record.discretionary_expenses
    debt_emi = record.monthly_debt_emi
    net_cash_flow = round(record.monthly_income - total_expenses - debt_emi, 2)

    dti = round(debt_emi / record.monthly_income, 3) if record.monthly_income > 0 else 1.0
    savings_rate = (
        round(max(0.0, net_cash_flow / record.monthly_income * 100.0), 1)
        if record.monthly_income > 0
        else 0.0
    )
    runway_months = (
        round(record.liquid_savings / record.essential_expenses, 1)
        if record.essential_expenses > 0
        else 0.0
    )

    # Deterministic grading rubric
    if dti <= 0.25 and runway_months >= 3.0 and savings_rate >= 18.0:
        grade = "A"
    elif dti <= 0.38 and runway_months >= 2.0 and savings_rate >= 10.0:
        grade = "B"
    elif dti <= 0.50 and runway_months >= 1.0:
        grade = "C"
    else:
        grade = "D"

    key_strengths: List[str] = []
    risk_flags: List[str] = []

    if dti <= 0.30:
        key_strengths.append(f"Comfortable Debt-to-Income ratio at {round(dti * 100, 1)}% (< 35% benchmark).")
    else:
        risk_flags.append(f"Elevated Debt-to-Income ratio at {round(dti * 100, 1)}% (> 35% warning threshold).")

    if runway_months >= 3.0:
        key_strengths.append(f"Liquid emergency reserves cover {runway_months} months of essential operations.")
    else:
        risk_flags.append(f"Low emergency runway ({runway_months} months). Target is 3-6 months.")

    if net_cash_flow > 0:
        key_strengths.append(f"Positive monthly surplus of ₹{net_cash_flow:,.0f} available for reinvestment.")
    else:
        risk_flags.append(f"Negative net monthly cash flow (₹{net_cash_flow:,.0f}). Immediate budget rebalancing needed.")

    if savings_rate >= 15.0:
        key_strengths.append(f"Strong business savings rate at {savings_rate}%.")

    return FinancialHealthResponse(
        monthly_income=round(record.monthly_income, 2),
        monthly_expenses=round(total_expenses, 2),
        monthly_debt_emi=round(debt_emi, 2),
        net_cash_flow=net_cash_flow,
        debt_to_income_ratio=dti,
        savings_rate_pct=savings_rate,
        emergency_fund_months=runway_months,
        health_grade=grade,
        key_strengths=key_strengths,
        risk_flags=risk_flags,
    )


def calculate_emergency_fund(record: FinancialRecord) -> EmergencyFundResponse:
    """Analyze emergency fund adequacy, target buffer, and runway months."""
    essentials = record.essential_expenses
    liquid_savings = record.liquid_savings
    runway_months = round(liquid_savings / essentials, 1) if essentials > 0 else 0.0
    recommended_target = round(essentials * 6.0, 2)  # 6-month buffer for micro-entrepreneurs
    shortfall_or_surplus = round(liquid_savings - recommended_target, 2)

    if runway_months >= 6.0:
        status = "robust"
    elif runway_months >= 3.0:
        status = "adequate"
    elif runway_months >= 1.5:
        status = "warning"
    else:
        status = "critical"

    actionable_plan: List[str] = []
    if shortfall_or_surplus < 0:
        gap = abs(shortfall_or_surplus)
        suggested_monthly_saving = round(gap / 12.0, 2)
        actionable_plan.append(
            f"Reserve Shortfall: ₹{gap:,.0f} needed to reach the 6-month resilience threshold."
        )
        actionable_plan.append(
            f"Allocate ₹{suggested_monthly_saving:,.0f} monthly from surplus into a high-liquidity bank deposit."
        )
        actionable_plan.append(
            "Temporarily trim discretionary expenditure to accelerate reserve accumulation."
        )
    else:
        actionable_plan.append(
            f"Reserve Surplus: ₹{shortfall_or_surplus:,.0f} above 6-month resilience requirement."
        )
        actionable_plan.append(
            "Surplus funds can be safely deployed into working capital expansion or debt prepayment."
        )

    return EmergencyFundResponse(
        essential_monthly_expenses=essentials,
        liquid_savings=liquid_savings,
        current_runway_months=runway_months,
        recommended_target_amount=recommended_target,
        shortfall_or_surplus=shortfall_or_surplus,
        status=status,
        actionable_plan=actionable_plan,
    )


def simulate_income_loss(
    record: FinancialRecord,
    reduction_pct: float = 50.0,
) -> IncomeLossSimulationResponse:
    """Simulate income reduction and project month-by-month reserve depletion."""
    fraction_remaining = 1.0 - (reduction_pct / 100.0)
    simulated_income = round(record.monthly_income * fraction_remaining, 2)

    # Under stress, discretionary spending is frozen
    austere_expenses = round(record.essential_expenses + record.monthly_debt_emi, 2)
    monthly_burn = round(max(0.0, austere_expenses - simulated_income), 2)

    trajectory: List[MonthTrajectory] = []
    running_balance = record.liquid_savings
    months_until_exhaustion = 99.0

    for m in range(1, 13):
        starting_bal = round(running_balance, 2)
        ending_bal = round(starting_bal + simulated_income - austere_expenses, 2)

        if ending_bal <= 0 and months_until_exhaustion == 99.0:
            # Linear interpolation for fractional month
            deficit = austere_expenses - simulated_income
            if deficit > 0:
                months_until_exhaustion = round((m - 1) + (starting_bal / deficit), 1)
            else:
                months_until_exhaustion = float(m)

        runway_status = "solvent" if ending_bal > 0 else "exhausted"
        trajectory.append(
            MonthTrajectory(
                month=m,
                starting_balance=max(0.0, starting_bal),
                income=simulated_income,
                expenses=austere_expenses,
                ending_balance=max(0.0, ending_bal),
                runway_status=runway_status,
            )
        )
        running_balance = max(0.0, ending_bal)

    if months_until_exhaustion == 99.0 and monthly_burn == 0:
        austerity_runway = 99.0
    elif monthly_burn > 0:
        austerity_runway = round(record.liquid_savings / monthly_burn, 1)
    else:
        austerity_runway = 99.0

    return IncomeLossSimulationResponse(
        income_reduction_pct=reduction_pct,
        months_until_exhaustion=min(months_until_exhaustion, austerity_runway),
        monthly_burn_rate=monthly_burn,
        austere_monthly_expenses=austere_expenses,
        runway_with_austerity_months=austerity_runway,
        trajectory=trajectory,
    )


def calculate_risk_indicator(record: FinancialRecord) -> FinancialRiskIndicatorResponse:
    """Deterministic 0-100 financial risk indicator with 4 explainable dimensions."""
    essentials = record.essential_expenses
    runway = record.liquid_savings / essentials if essentials > 0 else 0.0
    dti = record.monthly_debt_emi / record.monthly_income if record.monthly_income > 0 else 1.0

    # Dimension 1: Liquidity Risk (Weight 30%)
    if runway >= 6.0:
        liq_score = 12.0
        liq_desc = "Robust liquid cushion (>6 months essentials)."
    elif runway >= 3.0:
        liq_score = 30.0
        liq_desc = "Adequate emergency liquidity (3-6 months)."
    elif runway >= 1.5:
        liq_score = 65.0
        liq_desc = "Borderline liquidity buffer (<3 months)."
    else:
        liq_score = 92.0
        liq_desc = "Severe liquidity risk (<1.5 months reserves)."

    # Dimension 2: Leverage / Debt Burden Risk (Weight 30%)
    if dti <= 0.20:
        lev_score = 15.0
        lev_desc = "Low debt obligations relative to income (<20%)."
    elif dti <= 0.35:
        lev_score = 35.0
        lev_desc = "Manageable debt-to-income ratio (20-35%)."
    elif dti <= 0.50:
        lev_score = 70.0
        lev_desc = "High debt burden (35-50% of monthly income)."
    else:
        lev_score = 95.0
        lev_desc = "Critical debt stress (>50% of income committed to debt)."

    # Dimension 3: Cash Flow Margin Risk (Weight 20%)
    total_exp = record.essential_expenses + record.discretionary_expenses + record.monthly_debt_emi
    surplus_pct = ((record.monthly_income - total_exp) / record.monthly_income * 100.0) if record.monthly_income > 0 else -100.0
    if surplus_pct >= 25.0:
        cf_score = 10.0
        cf_desc = "Strong operating cash surplus (>25% net margin)."
    elif surplus_pct >= 10.0:
        cf_score = 35.0
        cf_desc = "Positive operating cushion (10-25% net margin)."
    elif surplus_pct >= 0.0:
        cf_score = 60.0
        cf_desc = "Slim cash flow surplus (<10% net margin)."
    else:
        cf_score = 90.0
        cf_desc = "Cash flow deficit; expenses exceed income."

    # Dimension 4: Operational Expense Rigidity (Weight 20%)
    rigidity_pct = (record.essential_expenses / total_exp * 100.0) if total_exp > 0 else 50.0
    if rigidity_pct <= 60.0:
        rig_score = 25.0
        rig_desc = "Flexible cost structure; high discretionary adjustment capacity."
    elif rigidity_pct <= 80.0:
        rig_score = 50.0
        rig_desc = "Moderate expense flexibility under revenue shocks."
    else:
        rig_score = 80.0
        rig_desc = "High fixed expense rigidity; difficult to downscale quickly."

    dimensions = [
        RiskDimension(dimension="Liquidity Cushion", score=liq_score, weight=0.30, assessment=liq_desc),
        RiskDimension(dimension="Debt Leverage", score=lev_score, weight=0.30, assessment=lev_desc),
        RiskDimension(dimension="Cash Flow Margin", score=cf_score, weight=0.20, assessment=cf_desc),
        RiskDimension(dimension="Expense Rigidity", score=rig_score, weight=0.20, assessment=rig_desc),
    ]

    overall_score = round(sum(d.score * d.weight for d in dimensions), 1)

    if overall_score <= 25.0:
        risk_level = "Low"
    elif overall_score <= 50.0:
        risk_level = "Moderate"
    elif overall_score <= 75.0:
        risk_level = "Elevated"
    else:
        risk_level = "High"

    top_vulnerabilities: List[str] = []
    mitigation_steps: List[str] = []

    if lev_score >= 60:
        top_vulnerabilities.append("Debt service commitments consume an outsized share of monthly income.")
        mitigation_steps.append("Prioritize high-interest loan prepayment or explore MSME loan restructuring.")
    if liq_score >= 60:
        top_vulnerabilities.append("Emergency savings do not provide sufficient shock absorption.")
        mitigation_steps.append("Automate monthly transfers into liquid reserves before non-essential purchases.")
    if cf_score >= 60:
        top_vulnerabilities.append("Narrow operating cash margin leaves little room for revenue dips.")
        mitigation_steps.append("Audit recurring vendor costs and optimize product pricing margins.")

    if not top_vulnerabilities:
        top_vulnerabilities.append("No immediate structural solvency vulnerabilities identified.")
        mitigation_steps.append("Maintain current financial discipline and avoid unneeded leverage.")

    return FinancialRiskIndicatorResponse(
        overall_risk_score=overall_score,
        risk_level=risk_level,
        dimensions=dimensions,
        top_vulnerabilities=top_vulnerabilities,
        mitigation_steps=mitigation_steps,
        compliance_disclaimer=COMPLIANCE_DISCLAIMER,
    )


def simulate_what_if(
    record: FinancialRecord,
    req: WhatIfSimulationRequest,
) -> WhatIfSimulationResponse:
    """Simulate hypothetical financial events (loan EMI, revenue shock, inflation)."""
    # 1. Baseline
    b_total_exp = record.essential_expenses + record.discretionary_expenses
    b_cash_flow = round(record.monthly_income - b_total_exp - record.monthly_debt_emi, 2)
    b_dti = round(record.monthly_debt_emi / record.monthly_income, 3) if record.monthly_income > 0 else 1.0
    b_runway = round(record.liquid_savings / record.essential_expenses, 1) if record.essential_expenses > 0 else 0.0
    b_risk = calculate_risk_indicator(record).overall_risk_score

    # 2. Simulated
    sim_income = round(record.monthly_income * (1.0 + req.revenue_change_pct / 100.0), 2)
    sim_essentials = round(record.essential_expenses * (1.0 + req.expense_change_pct / 100.0), 2)
    sim_discretionary = round(record.discretionary_expenses * (1.0 + req.expense_change_pct / 100.0), 2)
    sim_debt = round(record.monthly_debt_emi + req.additional_monthly_debt, 2)
    sim_total_exp = sim_essentials + sim_discretionary
    sim_cash_flow = round(sim_income - sim_total_exp - sim_debt, 2)
    sim_dti = round(sim_debt / sim_income, 3) if sim_income > 0 else 1.0
    sim_runway = round(record.liquid_savings / sim_essentials, 1) if sim_essentials > 0 else 0.0

    # Mock cloned record for risk computation
    sim_record = FinancialRecord(
        user_id=record.user_id,
        monthly_income=sim_income,
        essential_expenses=sim_essentials,
        discretionary_expenses=sim_discretionary,
        monthly_debt_emi=sim_debt,
        liquid_savings=record.liquid_savings,
        estimated_credit_score=record.estimated_credit_score,
        credit_utilization_pct=min(95.0, record.credit_utilization_pct + (req.additional_monthly_debt / 1000.0)),
        on_time_payment_pct=record.on_time_payment_pct,
        credit_history_months=record.credit_history_months,
    )
    sim_risk = calculate_risk_indicator(sim_record).overall_risk_score

    deltas = {
        "cash_flow_delta": round(sim_cash_flow - b_cash_flow, 2),
        "dti_delta": round((sim_dti - b_dti) * 100.0, 1),
        "risk_delta": round(sim_risk - b_risk, 1),
    }

    # Determine verdict
    if sim_cash_flow < 0 or sim_dti > 0.50 or sim_risk > 65.0:
        verdict = "critical"
        rec = (
            f"Under this scenario, your monthly cash flow becomes negative (₹{sim_cash_flow:,.0f}) "
            f"or DTI exceeds 50%. This would trigger cash depletion within {sim_runway} months. Not recommended."
        )
    elif sim_dti > 0.38 or sim_risk > 45.0 or sim_cash_flow < 4000.0:
        verdict = "caution"
        rec = (
            f"This scenario leaves a slender monthly surplus of ₹{sim_cash_flow:,.0f}. "
            f"DTI increases to {round(sim_dti * 100, 1)}%. Feasible only if discretionary spending is tightened by 15%."
        )
    else:
        verdict = "safe"
        rec = (
            f"The scenario is financially sustainable. Projected monthly surplus remains healthy at ₹{sim_cash_flow:,.0f} "
            f"with a manageable DTI of {round(sim_dti * 100, 1)}%."
        )

    desc = req.description or f"Scenario: {req.scenario_type.replace('_', ' ').title()}"

    return WhatIfSimulationResponse(
        scenario_type=req.scenario_type,
        scenario_description=desc,
        baseline={
            "net_cash_flow": b_cash_flow,
            "debt_to_income_ratio": b_dti,
            "runway_months": b_runway,
            "risk_score": b_risk,
        },
        simulated={
            "net_cash_flow": sim_cash_flow,
            "debt_to_income_ratio": sim_dti,
            "runway_months": sim_runway,
            "risk_score": sim_risk,
        },
        deltas=deltas,
        recommendation=rec,
        verdict=verdict,
    )


def explain_credit_score(record: FinancialRecord) -> CreditScoreExplainerResponse:
    """Deconstruct estimated credit score into transparent standard factors."""
    score = record.estimated_credit_score

    if score >= 750:
        band = "Excellent"
    elif score >= 700:
        band = "Good"
    elif score >= 650:
        band = "Fair"
    else:
        band = "Needs Improvement"

    factors = [
        CreditFactor(
            factor="Repayment Track Record",
            weight_pct=35,
            status="excellent" if record.on_time_payment_pct >= 98 else "good" if record.on_time_payment_pct >= 90 else "critical",
            impact=f"{record.on_time_payment_pct}% on-time EMI repayments logged.",
            recommendation="Never miss an EMI due date; set up NACH/e-mandate auto-debit to protect this factor.",
        ),
        CreditFactor(
            factor="Credit Utilization Ratio",
            weight_pct=30,
            status="excellent" if record.credit_utilization_pct <= 30 else "needs_attention" if record.credit_utilization_pct <= 50 else "critical",
            impact=f"{record.credit_utilization_pct}% of total sanctioned credit limit currently drawn.",
            recommendation="Keep ongoing credit card/working capital drawdowns strictly below 30% of total limit.",
        ),
        CreditFactor(
            factor="Credit Vintage & History Length",
            weight_pct=15,
            status="excellent" if record.credit_history_months >= 36 else "good" if record.credit_history_months >= 18 else "needs_attention",
            impact=f"{record.credit_history_months} months of documented active credit history.",
            recommendation="Retain your oldest active credit facility open to preserve credit history longevity.",
        ),
        CreditFactor(
            factor="Credit Facility Mix",
            weight_pct=10,
            status="good",
            impact="Balanced mix of working capital line and term equipment credit.",
            recommendation="Avoid taking multiple short-term unsecured app loans that skew credit mix unfavorably.",
        ),
        CreditFactor(
            factor="Recent Credit Enquiries",
            weight_pct=10,
            status="excellent",
            impact="Low recent hard bureau enquiries.",
            recommendation="Do not apply for multiple loans simultaneously across multiple lenders.",
        ),
    ]

    return CreditScoreExplainerResponse(
        estimated_score=score,
        score_band=band,
        factors=factors,
        compliance_disclaimer=COMPLIANCE_DISCLAIMER,
    )


def detect_transaction_fraud(
    title: str,
    amount: float,
    category: str,
    recent_transactions: List[FinancialTransaction],
) -> Tuple[bool, Optional[str]]:
    """Rule-based anomaly detection for unusual transactions."""
    text_lower = title.lower()

    # Rule 1: High-risk suspicious keywords
    suspicious_keywords = ["lottery", "crypto", "urgent refund", "otp verification", "wire prize", "secret fee"]
    for kw in suspicious_keywords:
        if kw in text_lower:
            return True, f"Suspicious keyword match: '{kw}'. High risk of social engineering or unauthorized transfer."

    # Rule 2: Single transaction spike (> ₹2,50,000 without vendor verification)
    if amount >= 250000.0:
        return True, "High value alert: Transaction exceeds single-debit threshold of ₹2,50,000."

    # Rule 3: Rapid duplicate transaction detection (same amount within recent list)
    duplicates = [t for t in recent_transactions if t.amount == amount and t.title.lower() == text_lower]
    if len(duplicates) >= 1:
        return True, f"Duplicate charge alert: Identical debit of ₹{amount:,.0f} detected in recent history."

    # Rule 4: High velocity check (> 3 transactions > ₹20,000 in recent window)
    large_recent = [t for t in recent_transactions if t.amount >= 20000.0]
    if len(large_recent) >= 3 and amount >= 20000.0:
        return True, "High velocity warning: Multiple large debits logged in close succession."

    return False, None


def run_digital_twin_workflow(
    db: Session,
    user_id: Optional[str] = None,
    scenario_data: Optional[Dict[str, Any]] = None,
) -> DigitalTwinWorkflowResponse:
    """Execute the full Valmont-inspired Digital Twin workflow:
    Analyze -> Simulate -> Predict -> Assess Risk -> Decide
    """
    if user_id and user_id not in ["demo", "preview", "guest-preview", "demo-preview"]:
        record = get_or_create_financial_record(db, user_id)
    else:
        record = get_financial_record_for_user_or_preview(db, None)

    # 1. ANALYZE
    health = calculate_financial_health(record)
    emergency = calculate_emergency_fund(record)

    # 2. SIMULATE & PREDICT
    scenario_type = scenario_data.get("scenario_type", "new_loan") if scenario_data else "new_loan"
    add_debt = float(scenario_data.get("additional_monthly_debt", 5000.0)) if scenario_data else 5000.0
    rev_change = float(scenario_data.get("revenue_change_pct", 0.0)) if scenario_data else 0.0
    exp_change = float(scenario_data.get("expense_change_pct", 0.0)) if scenario_data else 0.0

    sim_req = WhatIfSimulationRequest(
        scenario_type=scenario_type,
        additional_monthly_debt=add_debt,
        revenue_change_pct=rev_change,
        expense_change_pct=exp_change,
        description=f"Twin Scenario: {scenario_type.replace('_', ' ').title()}",
    )
    sim_result = simulate_what_if(record, sim_req)

    # 3. ASSESS RISK
    risk_indicator = calculate_risk_indicator(record)

    # 4. DECIDE
    if sim_result.verdict == "safe":
        decision_action = "PROCEED"
        summary = (
            f"Decision Verdict: Viable. Your projected cash flow remains surplus by ₹{sim_result.simulated['net_cash_flow']:,.0f}/mo. "
            f"Your debt coverage stays healthy."
        )
        checklist = [
            "Ensure loan tenure is matched to equipment asset life",
            "Maintain minimum 3 months emergency buffer in liquid account",
            "Review pricing margin quarterly",
        ]
    elif sim_result.verdict == "caution":
        decision_action = "PROCEED_WITH_CAUTION"
        summary = (
            f"Decision Verdict: Proceed with Caution. Monthly cash surplus drops to ₹{sim_result.simulated['net_cash_flow']:,.0f}. "
            f"A small revenue dip would compress margins."
        )
        checklist = [
            "Identify 10-15% in non-essential operating expense cuts prior to commitment",
            "Negotiate for a longer repayment tenure to reduce monthly EMI",
            "Ensure receivables collection cycle is shortened to under 30 days",
        ]
    else:
        decision_action = "DO_NOT_PROCEED"
        summary = (
            f"Decision Verdict: Not Recommended in Current State. "
            f"This scenario triggers cash depletion within {sim_result.simulated['runway_months']} months."
        )
        checklist = [
            "Postpone capital expenditure until monthly revenue increases by at least 20%",
            "Apply for interest-subsidized schemes like PMEGP rather than commercial high-rate debt",
            "Rebuild liquid reserves to at least 4 months of essential operations first",
        ]

    decision = DigitalTwinDecision(
        action=decision_action,
        summary=summary,
        checklist=checklist,
    )

    # Persist scenario record only for authenticated users
    if user_id:
        scenario_db = FinancialTwinScenario(
            user_id=user_id,
            scenario_name=sim_result.scenario_description,
            scenario_type=scenario_type,
            parameters=scenario_data or {},
            projected_metrics=sim_result.simulated,
            risk_score=sim_result.simulated["risk_score"],
            verdict=sim_result.verdict,
        )
        db.add(scenario_db)
        db.commit()

    return DigitalTwinWorkflowResponse(
        analysis=health,
        emergency_fund=emergency,
        risk_indicator=risk_indicator,
        simulation=sim_result,
        decision=decision,
    )
