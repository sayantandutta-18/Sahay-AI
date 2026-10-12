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
