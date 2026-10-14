"""Sahay-AI Financial Intelligence, Fraud Detection, and Digital Twin tests."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.models.user import User
from app.models.financial_twin import FinancialRecord
from app.database.session import SessionLocal

client = TestClient(app)


@pytest.fixture
def auth_headers():
    """Create a test user and generate an authorization bearer token."""
    db = SessionLocal()
    user = db.query(User).filter(User.phone == "9988776655").first()
    if not user:
        user = User(
            phone="9988776655",
            name="Ramesh Sharma",
            role="entrepreneur",
            language="en",
            state="West Bengal",
            district="Kolkata",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(subject=user.id)
    db.close()
    return {"Authorization": f"Bearer {token}"}


def test_financial_health_endpoint(auth_headers):
    """Verify deterministic financial health metrics, DTI, savings rate, and grade."""
    res = client.get("/api/v1/financial/health", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["monthly_income"] > 0
    assert data["monthly_expenses"] > 0
    assert 0 <= data["debt_to_income_ratio"] <= 1.0
    assert data["health_grade"] in ["A", "B", "C", "D"]
    assert len(data["key_strengths"]) > 0 or len(data["risk_flags"]) > 0


def test_emergency_fund_runway_endpoint(auth_headers):
    """Verify emergency fund runway analysis and 6-month buffer calculation."""
    res = client.get("/api/v1/financial/emergency-fund", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["essential_monthly_expenses"] > 0
    assert data["liquid_savings"] >= 0
    assert data["current_runway_months"] >= 0
    assert data["recommended_target_amount"] == pytest.approx(
        data["essential_monthly_expenses"] * 6.0, 0.1
    )
    assert data["status"] in ["critical", "warning", "adequate", "robust"]
    assert len(data["actionable_plan"]) > 0


def test_income_loss_stress_simulator(auth_headers):
    """Verify 12-month reserve exhaustion trajectory under 50% income reduction."""
    res = client.post(
        "/api/v1/financial/simulate/income-loss",
        json={"income_reduction_pct": 50.0},
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["income_reduction_pct"] == 50.0
    assert data["months_until_exhaustion"] > 0
    assert len(data["trajectory"]) == 12
    assert data["trajectory"][0]["month"] == 1
    assert data["trajectory"][0]["runway_status"] in ["solvent", "exhausted"]


def test_what_if_scenario_modeler(auth_headers):
    """Verify what-if scenario comparison of baseline vs simulated loan shock."""
    res = client.post(
        "/api/v1/financial/simulate/what-if",
        json={
            "scenario_type": "new_loan",
            "additional_monthly_debt": 7500.0,
            "revenue_change_pct": 0.0,
            "expense_change_pct": 0.0,
            "description": "Equipment Loan EMI Simulation",
        },
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_type"] == "new_loan"
    assert "baseline" in data
    assert "simulated" in data
    assert "deltas" in data
    assert data["verdict"] in ["safe", "caution", "critical"]
    assert data["simulated"]["debt_to_income_ratio"] > data["baseline"]["debt_to_income_ratio"]
    assert data["deltas"]["cash_flow_delta"] < 0  # Added debt reduces monthly cash flow


def test_credit_score_explainer(auth_headers):
    """Verify 5-pillar credit score educational explainer and regulatory disclaimer."""
    res = client.get("/api/v1/financial/credit-explainer", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert 300 <= data["estimated_score"] <= 900
    assert data["score_band"] in ["Excellent", "Good", "Fair", "Needs Improvement"]
    assert len(data["factors"]) == 5
    total_weights = sum(f["weight_pct"] for f in data["factors"])
    assert total_weights == 100
    assert "Sahay is an independent software companion" in data["compliance_disclaimer"]


def test_explainable_risk_indicator(auth_headers):
    """Verify 4-dimension composite risk indicator (0-100 rubric)."""
    res = client.get("/api/v1/financial/risk-indicator", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert 0 <= data["overall_risk_score"] <= 100
    assert data["risk_level"] in ["Low", "Moderate", "Elevated", "High"]
    assert len(data["dimensions"]) == 4
    total_weight = sum(d["weight"] for d in data["dimensions"])
    assert pytest.approx(total_weight, 0.01) == 1.0
    assert len(data["mitigation_steps"]) > 0


def test_digital_twin_workflow(auth_headers):
    """Verify full Sahay-AI workflow: Analyze -> Simulate -> Predict -> Assess Risk -> Decide."""
    res = client.post(
        "/api/v1/financial/twin/workflow",
        json={
            "scenario_type": "new_loan",
            "additional_monthly_debt": 5000.0,
            "revenue_change_pct": 10.0,
            "expense_change_pct": 5.0,
        },
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    # 1. Analyze
    assert "analysis" in data
    # 2. Simulate & Predict
    assert "simulation" in data
    # 3. Assess Risk
    assert "risk_indicator" in data
    # 4. Decide
    assert "decision" in data
    assert data["decision"]["action"] in ["PROCEED", "PROCEED_WITH_CAUTION", "DO_NOT_PROCEED"]
    assert len(data["decision"]["checklist"]) > 0


def test_fraud_detection_rules(auth_headers):
    """Verify rule-based fraud detection on transaction recording."""
    # 1. Normal transaction
    res1 = client.post(
        "/api/v1/financial/transactions",
        json={
            "title": "Raw Materials Cotton Yarn Purchase",
            "category": "raw_materials",
            "amount": 15000.0,
            "transaction_type": "expense",
            "is_essential": True,
            "vendor_name": "Bengal Handloom Suppliers",
        },
        headers=auth_headers,
    )
    assert res1.status_code == 200
    assert res1.json()["is_flagged_fraud"] is False

    # 2. Suspicious transaction with scam keywords
    res2 = client.post(
        "/api/v1/financial/transactions",
        json={
            "title": "Urgent lottery deposit fee wire",
            "category": "general",
            "amount": 45000.0,
            "transaction_type": "expense",
            "is_essential": False,
        },
        headers=auth_headers,
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["is_flagged_fraud"] is True
    assert "keyword match" in data2["fraud_reason"].lower()

    # 3. Fetch fraud alerts
    alerts_res = client.get("/api/v1/financial/fraud-alerts", headers=auth_headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 1
    assert any("Urgent lottery" in a["title"] for a in alerts)


def test_chat_financial_and_fraud_routing(auth_headers):
    """Verify Grounded Assistant routes financial questions to deterministic Twin engine."""
    # Financial inquiry
    res = client.post(
        "/api/v1/chat",
        json={"message": "Can you explain my emergency fund runway and debt-to-income?"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent_detected"] == "FINANCIAL_INTELLIGENCE"
    assert data["deterministic_action_taken"] == "EVALUATED_BY_FINANCIAL_TWIN_ENGINE"
    assert "Financial Digital Twin" in data["reply"]
    assert "Emergency Runway" in data["reply"]

    # Fraud inquiry
    res_fraud = client.post(
        "/api/v1/chat",
        json={"message": "How do you detect fraud and unauthorized transactions?"},
        headers=auth_headers,
    )
    assert res_fraud.status_code == 200
    data_fraud = res_fraud.json()
    assert data_fraud["intent_detected"] == "FRAUD_SECURITY"
    assert data_fraud["deterministic_action_taken"] == "SCANNED_BY_FRAUD_PREVENTION_RULES"
    assert "fraud detection" in data_fraud["reply"].lower()


def test_guest_unauthenticated_digital_twin_workflow():
    """Verify that guests can run what-if simulations and twin workflows using isolated transient demo data."""
    res = client.post(
        "/api/v1/financial/twin/workflow",
        json={"scenario_type": "new_loan", "additional_monthly_debt": 5000},
    )
    assert res.status_code == 200
    data = res.json()
    assert "analysis" in data
    assert "simulation" in data
    assert "decision" in data
    assert data["decision"]["action"] in ["PROCEED", "PROCEED_WITH_CAUTION", "DO_NOT_PROCEED"]
    assert len(data["decision"]["checklist"]) > 0
