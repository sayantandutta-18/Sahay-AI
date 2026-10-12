"""Deterministic Business Advisor calculation endpoints."""

from fastapi import APIRouter
from app.schemas.business import (
    EmiCalculationRequest,
    EmiCalculationResponse,
    PricingCalculationRequest,
    PricingCalculationResponse,
    CashFlowCalculationRequest,
    CashFlowCalculationResponse,
)
from app.services.business_service import (
    calculate_loan_emi,
    calculate_product_pricing,
    calculate_cash_flow,
)

router = APIRouter(prefix="/business", tags=["Business Advisor"])


@router.post("/emi", response_model=EmiCalculationResponse)
def compute_loan_emi(request: EmiCalculationRequest):
    """Compute reducing-balance loan EMI, total interest, and outflow."""
    return calculate_loan_emi(request)


@router.post("/pricing", response_model=PricingCalculationResponse)
def compute_pricing_margin(request: PricingCalculationRequest):
    """Compute product selling price, profit per unit, markup, and break-even sales units."""
    return calculate_product_pricing(request)


@router.post("/cash-flow", response_model=CashFlowCalculationResponse)
def evaluate_enterprise_cash_flow(request: CashFlowCalculationRequest):
    """Compute net operating surplus, debt coverage ratio, and business health grade."""
    return calculate_cash_flow(request)
