"""Pydantic schemas for the deterministic Business Advisor tools."""

from typing import List, Optional
from pydantic import BaseModel, Field


class EmiCalculationRequest(BaseModel):
    principal: float = Field(..., gt=0.0, description="Loan principal amount in INR")
    annual_interest_rate: float = Field(..., ge=0.0, le=100.0, description="Annual interest rate percentage e.g. 9.5")
    tenure_months: int = Field(..., gt=0, le=360, description="Loan tenure in months (e.g. 60 for 5 years)")


class EmiCalculationResponse(BaseModel):
    principal: float
    annual_interest_rate: float
    tenure_months: int
    monthly_emi: float
    total_interest: float
    total_payment: float
    principal_percentage: float
    interest_percentage: float
    authority: str = "Sahay Deterministic Financial Math (Standard Reducing Balance)"


class PricingCalculationRequest(BaseModel):
    unit_cost: float = Field(..., gt=0.0, description="Direct cost of raw materials and labor per unit")
    target_margin_pct: float = Field(..., ge=0.0, lt=100.0, description="Target profit margin on selling price (0-99%)")
    packaging_logistics_cost: float = Field(default=0.0, ge=0.0, description="Additional logistics/packaging per unit")
    fixed_overhead_monthly: float = Field(default=0.0, ge=0.0, description="Monthly fixed costs (rent, utilities)")


class PricingCalculationResponse(BaseModel):
    unit_total_cost: float
    suggested_selling_price: float
    gross_profit_per_unit: float
    markup_percentage: float
    target_margin_percentage: float
    monthly_break_even_units: int
    authority: str = "Sahay Deterministic Pricing Model (Cost-Plus Margin)"


class CashFlowCalculationRequest(BaseModel):
    monthly_revenue: float = Field(..., ge=0.0, description="Gross monthly receipts/sales in INR")
    monthly_expense: float = Field(..., ge=0.0, description="Total operational expenses in INR")
    existing_debt_emi: float = Field(default=0.0, ge=0.0, description="Existing monthly loan repayments in INR")


class CashFlowCalculationResponse(BaseModel):
    monthly_revenue: float
    monthly_expense: float
    existing_debt_emi: float
    net_operating_income: float
    net_surplus_after_debt: float
    annual_projected_surplus: float
    operating_margin_percentage: float
    debt_service_coverage_ratio: float
    business_health_grade: str  # Excellent (A), Good (B), Vulnerable (C), Critical (D)
    recommendation: str
    authority: str = "Sahay Deterministic Micro-Enterprise Health Scorecard"
