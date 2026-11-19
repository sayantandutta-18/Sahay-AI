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


def test_checkpoint6_readiness_radar_assessment_and_disclaimer():
    """Verify Checkpoint 6 5-dimension readiness assessment and prominent disclaimer."""
    payload = {
        "annual_turnover": 800000.0,
        "monthly_revenue": 80000.0,
        "monthly_expense": 45000.0,
        "existing_loans": 5000.0,
        "months_in_operation": 18,
        "has_udyam": True,
        "has_pan": True,
        "has_gst": False,
        "has_bank_account": True,
        "has_aadhaar": True,
        "record_keeping_type": "bank_recorded",
    }
    res = client.post("/api/v1/business/readiness", json=payload)
    assert res.status_code == 200
    data = res.json()

    # Must state clearly that it is an estimated readiness indicator, not official
    assert data["is_official_decision"] is False
    assert "estimated micro-business readiness indicator" in data["disclaimer"].lower()
    assert 0 <= data["overall_readiness_score"] <= 100

    # Exactly 5 dimensions
    dims = {d["dimension_key"]: d for d in data["dimensions"]}
    expected_keys = {"capital", "documents", "vintage", "income", "record_keeping"}
    assert set(dims.keys()) == expected_keys

    # Check that each dimension has an explicit explanation and valid score
    for key in expected_keys:
        dim = dims[key]
        assert 0 <= dim["score"] <= 100
        assert len(dim["formula_explanation"]) > 10
        assert len(dim["assessment_tier"]) > 2

    # Detailed dimension assertions:
    # 1. Capital: Net surplus = 80000 - 45000 - 5000 = 30000. Margin = 30000/80000 = 37.5% (> 25% -> 100 pts)
    assert dims["capital"]["score"] == 100
    assert "Strong Reserves" in dims["capital"]["assessment_tier"]

    # 2. Documents: 4 of 5 verified (Aadhaar, PAN, Bank, Udyam) -> 80 pts
    assert dims["documents"]["score"] == 80
    assert "80/100" in dims["documents"]["formula_explanation"]

    # 3. Vintage: 18 months (12-24 months -> 75 pts)
    assert dims["vintage"]["score"] == 75
    assert "18 months" in dims["vintage"]["formula_explanation"]

    # 4. Income: Turnover 800k (200k - 1M -> 70 pts)
    assert dims["income"]["score"] == 70

    # 5. Record-keeping: Udyam + Bank -> 75 pts
    assert dims["record_keeping"]["score"] == 75


def test_checkpoint6_readiness_edge_cases_and_formalization():
    """Verify minimal zero-input edge cases and fully formal maximum scores."""
    # Minimal / zero input
    res_zero = client.post(
        "/api/v1/business/readiness",
        json={
            "annual_turnover": 0.0,
            "monthly_revenue": 0.0,
            "monthly_expense": 0.0,
            "existing_loans": 0.0,
            "months_in_operation": 2,
            "has_udyam": False,
            "has_pan": False,
            "has_gst": False,
            "has_bank_account": False,
            "has_aadhaar": False,
            "record_keeping_type": "informal",
        },
    )
    assert res_zero.status_code == 200
    data_z = res_zero.json()
    dims_z = {d["dimension_key"]: d for d in data_z["dimensions"]}

    assert dims_z["capital"]["score"] == 0
    assert dims_z["documents"]["score"] == 0
    assert dims_z["vintage"]["score"] == 20
    assert dims_z["income"]["score"] == 15
    assert dims_z["record_keeping"]["score"] == 20
    assert data_z["overall_readiness_score"] == round((0 + 0 + 20 + 15 + 20) / 5)

    # Fully formalized enterprise
    res_formal = client.post(
        "/api/v1/business/readiness",
        json={
            "annual_turnover": 3500000.0,
            "monthly_revenue": 300000.0,
            "monthly_expense": 180000.0,
            "existing_loans": 20000.0,
            "months_in_operation": 36,
            "has_udyam": True,
            "has_pan": True,
            "has_gst": True,
            "has_bank_account": True,
            "has_aadhaar": True,
            "record_keeping_type": "formal_accounting",
        },
    )
    assert res_formal.status_code == 200
    data_f = res_formal.json()
    dims_f = {d["dimension_key"]: d for d in data_f["dimensions"]}

    assert dims_f["capital"]["score"] == 100
    assert dims_f["documents"]["score"] == 100
    assert dims_f["vintage"]["score"] == 100
    assert dims_f["income"]["score"] == 100
    assert dims_f["record_keeping"]["score"] == 100
    assert data_f["overall_readiness_score"] == 100
