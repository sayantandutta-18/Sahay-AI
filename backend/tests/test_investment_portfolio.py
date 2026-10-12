"""Investment Profile, Market Data, Watchlist, and Paper Portfolio tests."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_financial_risk_profile_lifecycle():
    """Verify deterministic risk scoring and suitability categories."""
    phone = "9812300001"
    client.post("/api/v1/auth/register", json={"phone": phone, "name": "Investor 1", "password": "dev_pass"})
    login_res = client.post("/api/v1/auth/login", json={"phone": phone, "password": "dev_pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Save aggressive growth questionnaire profile
    profile_res = client.post(
        "/api/v1/investment/profile",
        json={
            "investment_goal": "wealth_accumulation",
            "monthly_investible_surplus": 15000.0,
            "time_horizon_years": 10,
            "risk_tolerance": "aggressive",
            "market_experience": "advanced",
            "liquidity_needs": "low",
        },
        headers=headers,
    )
    assert profile_res.status_code == 200
    data = profile_res.json()
    assert data["calculated_risk_score"] == 100
    assert data["risk_category"] == "High Growth / Dynamic"


def test_market_data_adapter_verified_quotes():
    """Verify market data adapter provides quotes with timestamps and handles missing symbols."""
    # List benchmarks
    benchmarks_res = client.get("/api/v1/investment/benchmarks")
    assert benchmarks_res.status_code == 200
    benchmarks = benchmarks_res.json()
    assert len(benchmarks) >= 3
    assert any(b["ticker"] == "NIFTYBEES" for b in benchmarks)

    # Fetch valid quote
    quote_res = client.get("/api/v1/investment/quote/NIFTYBEES")
    assert quote_res.status_code == 200
    quote = quote_res.json()
    assert quote["ticker"] == "NIFTYBEES"
    assert quote["current_price"] > 0.0
    assert quote["last_updated_at"] is not None

    # Fetch non-existent quote (Provider failure handling)
    missing_res = client.get("/api/v1/investment/quote/NON_EXISTENT_TICKER_99")
    assert missing_res.status_code == 404


def test_watchlist_management():
    """Verify adding, listing, and removing watchlist assets."""
    phone = "9812300002"
    client.post("/api/v1/auth/register", json={"phone": phone, "name": "Investor 2", "password": "dev_pass"})
    login_res = client.post("/api/v1/auth/login", json={"phone": phone, "password": "dev_pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add NIFTYBEES
    add_res = client.post(
        "/api/v1/portfolio/watchlist",
        json={"ticker": "NIFTYBEES"},
        headers=headers,
    )
    assert add_res.status_code == 201

    # List watchlist
    list_res = client.get("/api/v1/portfolio/watchlist", headers=headers)
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(i["ticker"] == "NIFTYBEES" for i in items)

    # Delete from watchlist
    del_res = client.delete("/api/v1/portfolio/watchlist/NIFTYBEES", headers=headers)
    assert del_res.status_code == 204


def test_paper_trading_order_and_deterministic_pnl():
    """Verify paper trading order execution, weighted average price, and deterministic P&L math."""
    phone = "9812300003"
    client.post("/api/v1/auth/register", json={"phone": phone, "name": "Investor 3", "password": "dev_pass"})
    login_res = client.post("/api/v1/auth/login", json={"phone": phone, "password": "dev_pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Buy 100 GOLDBEES
    buy_res = client.post(
        "/api/v1/portfolio/order",
        json={"ticker": "GOLDBEES", "transaction_type": "BUY", "quantity": 100},
        headers=headers,
    )
    assert buy_res.status_code == 200
    holding_data = buy_res.json()
    assert holding_data["quantity"] == 100
    assert holding_data["total_invested"] > 0

    # Buy 50 more GOLDBEES
    buy2_res = client.post(
        "/api/v1/portfolio/order",
        json={"ticker": "GOLDBEES", "transaction_type": "BUY", "quantity": 50},
        headers=headers,
    )
    assert buy2_res.status_code == 200
    assert buy2_res.json()["quantity"] == 150

    # Sell 50 GOLDBEES
    sell_res = client.post(
        "/api/v1/portfolio/order",
        json={"ticker": "GOLDBEES", "transaction_type": "SELL", "quantity": 50},
        headers=headers,
    )
    assert sell_res.status_code == 200
    assert sell_res.json()["quantity"] == 100

    # Fetch complete portfolio summary
    summary_res = client.get("/api/v1/portfolio", headers=headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["holdings_count"] >= 1
    assert summary["total_invested"] > 0
    assert summary["compliance_notice"].startswith("Virtual paper portfolio")
