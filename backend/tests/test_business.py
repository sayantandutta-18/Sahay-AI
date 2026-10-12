"""Business Advisor deterministic formula unit and endpoint tests."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_loan_emi_standard_calculation():
    """Verify standard loan reducing balance formula."""
    res = client.post(
        "/api/v1/business/emi",
        json={
            "principal": 500000.0,
            "annual_interest_rate": 9.5,
            "tenure_months": 60,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["monthly_emi"] > 10000.0
    assert data["monthly_emi"] < 11000.0  # Approx ~10,500
    assert data["total_payment"] > 500000.0
    assert round(data["total_interest"] + data["principal"], 2) == round(data["total_payment"], 2)
    assert data["principal_percentage"] > 70.0


def test_loan_emi_zero_interest_edge_case():
    """Verify 0% interest subsidy edge case produces pure principal division."""
    res = client.post(
        "/api/v1/business/emi",
        json={
            "principal": 120000.0,
            "annual_interest_rate": 0.0,
            "tenure_months": 12,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["monthly_emi"] == 10000.0
    assert data["total_interest"] == 0.0
    assert data["total_payment"] == 120000.0


def test_product_pricing_and_break_even():
    """Verify cost-plus margin and break-even unit formulas."""
    res = client.post(
        "/api/v1/business/pricing",
        json={
            "unit_cost": 120.0,
            "packaging_logistics_cost": 10.0,
            "target_margin_pct": 25.0,
            "fixed_overhead_monthly": 43330.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["unit_total_cost"] == 130.0
    # Price = 130 / 0.75 = 173.33
    assert data["suggested_selling_price"] == 173.33
    assert data["gross_profit_per_unit"] == 43.33
    assert data["monthly_break_even_units"] == 1000


def test_enterprise_cash_flow_and_health_grade():
    """Verify operating surplus, DSCR, and solvency grading."""
    # Healthy enterprise
    res_healthy = client.post(
        "/api/v1/business/cash-flow",
        json={
            "monthly_revenue": 150000.0,
            "monthly_expense": 80000.0,
            "existing_debt_emi": 15000.0,
        },
    )
    assert res_healthy.status_code == 200
    data_h = res_healthy.json()
    assert data_h["net_operating_income"] == 70000.0
    assert data_h["net_surplus_after_debt"] == 55000.0
    assert data_h["debt_service_coverage_ratio"] == 4.67
    assert "Grade A" in data_h["business_health_grade"]

    # Deficit enterprise
    res_deficit = client.post(
        "/api/v1/business/cash-flow",
        json={
            "monthly_revenue": 40000.0,
            "monthly_expense": 55000.0,
            "existing_debt_emi": 10000.0,
        },
    )
    assert res_deficit.status_code == 200
    data_d = res_deficit.json()
    assert data_d["net_surplus_after_debt"] == -25000.0
    assert "Grade D" in data_d["business_health_grade"]
