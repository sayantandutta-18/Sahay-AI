"""Deterministic financial calculations and business advisor services.

Formulas are strictly mathematical and auditable.
The AI assistant provides natural-language explanations of these results,
but NEVER recalculates or overrides these deterministic formulas.
"""

import math
from app.schemas.business import (
    EmiCalculationRequest,
    EmiCalculationResponse,
    PricingCalculationRequest,
    PricingCalculationResponse,
    CashFlowCalculationRequest,
    CashFlowCalculationResponse,
    BusinessReadinessRequest,
    ReadinessDimensionScore,
    BusinessReadinessReportResponse,
)


def calculate_loan_emi(request: EmiCalculationRequest) -> EmiCalculationResponse:
    """Calculate monthly loan installment using standard reducing-balance amortization."""
    p = request.principal
    r_annual = request.annual_interest_rate
    n = request.tenure_months

    if r_annual == 0.0:
        monthly_emi = round(p / n, 2)
        total_payment = p
        total_interest = 0.0
    else:
        r_monthly = (r_annual / 100.0) / 12.0
        # Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
        compound_factor = math.pow(1.0 + r_monthly, n)
        monthly_emi = round(p * r_monthly * compound_factor / (compound_factor - 1.0), 2)
        total_payment = round(monthly_emi * n, 2)
        total_interest = round(total_payment - p, 2)

    principal_pct = round((p / total_payment) * 100.0, 1) if total_payment > 0 else 100.0
    interest_pct = round((total_interest / total_payment) * 100.0, 1) if total_payment > 0 else 0.0

    return EmiCalculationResponse(
        principal=p,
        annual_interest_rate=r_annual,
        tenure_months=n,
        monthly_emi=monthly_emi,
        total_interest=total_interest,
        total_payment=total_payment,
        principal_percentage=principal_pct,
        interest_percentage=interest_pct,
    )


def calculate_product_pricing(request: PricingCalculationRequest) -> PricingCalculationResponse:
    """Calculate target price, gross margin, markup, and break-even units."""
    total_unit_cost = round(request.unit_cost + request.packaging_logistics_cost, 2)
    margin_ratio = request.target_margin_pct / 100.0

    # Selling Price = Total Cost / (1 - Margin)
    if margin_ratio >= 1.0:
        margin_ratio = 0.99  # Cap to prevent division by zero

    suggested_price = round(total_unit_cost / (1.0 - margin_ratio), 2)
    gross_profit = round(suggested_price - total_unit_cost, 2)
    markup_pct = round((gross_profit / total_unit_cost) * 100.0, 1) if total_unit_cost > 0 else 0.0

    # Break-even units calculation
    if gross_profit > 0 and request.fixed_overhead_monthly > 0:
        break_even_units = math.ceil(request.fixed_overhead_monthly / gross_profit)
    else:
        break_even_units = 0

    return PricingCalculationResponse(
        unit_total_cost=total_unit_cost,
        suggested_selling_price=suggested_price,
        gross_profit_per_unit=gross_profit,
        markup_percentage=markup_pct,
        target_margin_percentage=request.target_margin_pct,
        monthly_break_even_units=break_even_units,
    )


def calculate_cash_flow(request: CashFlowCalculationRequest) -> CashFlowCalculationResponse:
    """Evaluate enterprise cash flow, operating margin, debt coverage ratio, and solvency grade."""
    rev = request.monthly_revenue
    exp = request.monthly_expense
    emi = request.existing_debt_emi

    net_operating_income = round(rev - exp, 2)
    net_surplus_after_debt = round(net_operating_income - emi, 2)
    annual_projected_surplus = round(net_surplus_after_debt * 12.0, 2)

    op_margin_pct = round((net_operating_income / rev) * 100.0, 1) if rev > 0 else 0.0

    # Debt Service Coverage Ratio (DSCR) = Net Operating Income / Debt Service
    if emi > 0:
        dscr = round(max(0.0, net_operating_income) / emi, 2)
    else:
        dscr = 99.0 if net_operating_income >= 0 else 0.0

    # Solvency & financial health grade classification
    if net_surplus_after_debt > 0 and (emi == 0 or dscr >= 1.5) and op_margin_pct >= 20:
        health_grade = "Excellent (Grade A)"
        recommendation = "Robust cash flow surplus and healthy debt coverage. Strong candidate for expansion credit."
    elif net_surplus_after_debt > 0 and (emi == 0 or dscr >= 1.2):
        health_grade = "Good (Grade B)"
        recommendation = "Positive operational cash flow capable of servicing current debt with modest buffer."
    elif net_surplus_after_debt >= 0:
        health_grade = "Vulnerable (Grade C)"
        recommendation = "Narrow buffer between receipts and expenses. Reduce operating costs before taking additional debt."
    else:
        health_grade = "Critical Deficit (Grade D)"
        recommendation = "Operating at a monthly deficit. Priority must be revenue recovery or debt restructuring."

    return CashFlowCalculationResponse(
        monthly_revenue=rev,
        monthly_expense=exp,
        existing_debt_emi=emi,
        net_operating_income=net_operating_income,
        net_surplus_after_debt=net_surplus_after_debt,
        annual_projected_surplus=annual_projected_surplus,
        operating_margin_percentage=op_margin_pct,
        debt_service_coverage_ratio=dscr,
        business_health_grade=health_grade,
        recommendation=recommendation,
    )


def evaluate_business_readiness(request: BusinessReadinessRequest) -> BusinessReadinessReportResponse:
    """Evaluate 5-dimension business readiness using deterministic scoring rules.

    Dimensions:
    1. capital: Financial buffer, net operating surplus, debt burden
    2. documents: Aadhaar, PAN, Bank, Udyam, GST (20 pts each)
    3. vintage: Months in active operation (0-100)
    4. income: Turnover volume & revenue recurring strength
    5. record_keeping: Transition from cash-only to verified digital/formal bookkeeping
    """
    dimensions = []

    # 1. Capital & Financial Buffer
    rev = request.monthly_revenue
    exp = request.monthly_expense
    debt = request.existing_loans
    net_surplus = round(rev - exp - debt, 2)

    if rev <= 0:
        cap_score = 0
        cap_tier = "Zero Revenue"
        cap_exp = "Zero monthly operational revenue recorded; unable to assess operational surplus."
    elif net_surplus < 0:
        cap_score = max(5, round(30 * (1.0 + net_surplus / (exp + debt + 1.0))))
        cap_tier = "Deficit"
        cap_exp = "Monthly operational expenses and debt exceed monthly receipts (operating deficit)."
    else:
        margin = net_surplus / rev
        if margin < 0.10:
            cap_score = 40
            cap_tier = "Tight Buffer"
            cap_exp = f"Net monthly surplus is positive but under 10% ({round(margin * 100, 1)}%) of revenue."
        elif margin < 0.25:
            cap_score = 70
            cap_tier = "Healthy Buffer"
            cap_exp = f"Net monthly surplus is healthy between 10% and 25% ({round(margin * 100, 1)}%) of revenue."
        else:
            cap_score = 100
            cap_tier = "Strong Reserves"
            cap_exp = f"Robust operational margin ({round(margin * 100, 1)}%) providing strong cash cushion for debt service."

    dimensions.append(
        ReadinessDimensionScore(
            dimension_key="capital",
            dimension_name="Capital & Financial Buffer",
            score=min(100, max(0, cap_score)),
            formula_explanation=cap_exp,
            assessment_tier=cap_tier,
        )
    )

    # 2. Document Readiness (20 points per credential)
    doc_flags = [
        request.has_aadhaar,
        request.has_pan,
        request.has_bank_account,
        request.has_udyam,
        request.has_gst,
    ]
    verified_count = sum(1 for f in doc_flags if f)
    doc_score = verified_count * 20
    if doc_score == 100:
        doc_tier = "Fully Documented"
        doc_exp = "All 5 core micro-enterprise credentials (Aadhaar, PAN, Bank, Udyam, GST) verified (20 pts each)."
    elif doc_score >= 60:
        doc_tier = "Substantially Documented"
        doc_exp = f"{verified_count} of 5 core credentials verified (20 pts each: {doc_score}/100)."
    elif doc_score >= 20:
        doc_tier = "Partially Documented"
        doc_exp = f"Only {verified_count} core credential verified (20 pts each: {doc_score}/100)."
    else:
        doc_tier = "Undocumented"
        doc_exp = "No core enterprise registration or banking credentials verified (0/100)."

    dimensions.append(
        ReadinessDimensionScore(
            dimension_key="documents",
            dimension_name="Document Readiness",
            score=doc_score,
            formula_explanation=doc_exp,
            assessment_tier=doc_tier,
        )
    )

    # 3. Business Vintage & Stability
    months = request.months_in_operation
    if months < 6:
        vin_score = 20
        vin_tier = "Seed / Early Inception"
        vin_exp = f"{months} months in operation (under 6 months benchmark for institutional lending)."
    elif months < 12:
        vin_score = 45
        vin_tier = "Early Stabilization"
        vin_exp = f"{months} months in operation (established preliminary operational baseline)."
    elif months < 24:
        vin_score = 75
        vin_tier = "Established Micro"
        vin_exp = f"{months} months in operation (over 1 year of consistent trading history)."
    else:
        vin_score = 100
        vin_tier = "Mature Operation"
        vin_exp = f"{months} months in operation (2+ years track record meeting formal banking tenure standards)."

    dimensions.append(
        ReadinessDimensionScore(
            dimension_key="vintage",
            dimension_name="Business Vintage & Stability",
            score=vin_score,
            formula_explanation=vin_exp,
            assessment_tier=vin_tier,
        )
    )

    # 4. Regular Income & Turnover
    effective_turnover = max(request.annual_turnover, rev * 12.0)
    if effective_turnover < 50_000:
        inc_score = 15
        inc_tier = "Subsistence Micro"
        inc_exp = f"Annual turnover (~₹{int(effective_turnover):,}) under ₹50,000 threshold."
    elif effective_turnover < 200_000:
        inc_score = 40
        inc_tier = "Emerging Enterprise"
        inc_exp = f"Annual turnover (~₹{int(effective_turnover):,}) between ₹50k and ₹2 Lakhs."
    elif effective_turnover < 1_000_000:
        inc_score = 70
        inc_tier = "Commercial Micro"
        inc_exp = f"Annual turnover (~₹{int(effective_turnover):,}) between ₹2 Lakhs and ₹10 Lakhs."
    elif effective_turnover < 2_500_000:
        inc_score = 85
        inc_tier = "Growth Enterprise"
        inc_exp = f"Annual turnover (~₹{int(effective_turnover):,}) between ₹10 Lakhs and ₹25 Lakhs."
    else:
        inc_score = 100
        inc_tier = "High Turnover"
        inc_exp = f"Annual turnover (~₹{int(effective_turnover):,}) meets or exceeds ₹25 Lakhs benchmark."

    dimensions.append(
        ReadinessDimensionScore(
            dimension_key="income",
            dimension_name="Regular Income & Turnover",
            score=inc_score,
            formula_explanation=inc_exp,
            assessment_tier=inc_tier,
        )
    )

    # 5. Record-Keeping & Formalization
    rk_type = request.record_keeping_type.lower()
    if rk_type == "formal_accounting" or (request.has_gst and request.has_bank_account and request.has_udyam):
        rec_score = 100
        rec_tier = "Auditable Digital Books"
        rec_exp = "Digital records with bank integration, active Udyam MSME, and GST returns."
    elif request.has_udyam and request.has_bank_account:
        rec_score = 75
        rec_tier = "Bank-Linked Formal"
        rec_exp = "Operating bank account verified with formal Udyam enterprise registration."
    elif request.has_bank_account or rk_type == "bank_recorded":
        rec_score = 50
        rec_tier = "Basic Bank Account"
        rec_exp = "Commercial bank account exists, but lacks formal MSME registration filings."
    else:
        rec_score = 20
        rec_tier = "Informal Cash Records"
        rec_exp = "Informal cash transactions without auditable institutional bank or tax trails."

    dimensions.append(
        ReadinessDimensionScore(
            dimension_key="record_keeping",
            dimension_name="Record-Keeping & Formalization",
            score=rec_score,
            formula_explanation=rec_exp,
            assessment_tier=rec_tier,
        )
    )

    overall_score = round(sum(d.score for d in dimensions) / len(dimensions))

    return BusinessReadinessReportResponse(
        overall_readiness_score=overall_score,
        is_official_decision=False,
        disclaimer=(
            "This score is an estimated micro-business readiness indicator, "
            "not an official government or institutional eligibility decision."
        ),
        dimensions=dimensions,
    )
