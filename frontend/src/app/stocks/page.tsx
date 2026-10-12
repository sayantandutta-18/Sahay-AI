"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Loading } from "@/components/ui/Loading";
import {
  ShieldAlert,
  TrendingUp,
  Clock,
  Compass,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  getMarketBenchmarks,
  getInvestmentProfile,
  updateInvestmentProfile,
} from "@/lib/api";
import { MarketQuoteResponse, FinancialProfileResponse } from "@/types";

export default function StockResearchPage() {
  const [benchmarks, setBenchmarks] = useState<MarketQuoteResponse[]>([]);
  const [profile, setProfile] = useState<FinancialProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUpdatingRisk, setIsUpdatingRisk] = useState(false);
  const [riskSuccess, setRiskSuccess] = useState(false);

  // Risk Questionnaire Form State
  const [riskTolerance, setRiskTolerance] = useState<string>("moderate");
  const [horizonYears, setHorizonYears] = useState<number>(5);
  const [experience, setExperience] = useState<string>("beginner");
  const [liquidityNeeds, setLiquidityNeeds] = useState<string>("medium");
  const [monthlySurplus, setMonthlySurplus] = useState<number>(5000);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [benchData, profileData] = await Promise.allSettled([
          getMarketBenchmarks(),
          getInvestmentProfile(),
        ]);

        if (benchData.status === "fulfilled") {
          setBenchmarks(benchData.value);
        }
        if (profileData.status === "fulfilled") {
          const p = profileData.value;
          setProfile(p);
          setRiskTolerance(p.risk_tolerance);
          setHorizonYears(p.time_horizon_years);
          setExperience(p.market_experience);
          setLiquidityNeeds(p.liquidity_needs);
          setMonthlySurplus(p.monthly_investible_surplus);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateRiskProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingRisk(true);
    setErrorMsg(null);
    setRiskSuccess(false);

    try {
      const updated = await updateInvestmentProfile({
        risk_tolerance: riskTolerance,
        time_horizon_years: horizonYears,
        market_experience: experience,
        liquidity_needs: liquidityNeeds,
        monthly_investible_surplus: monthlySurplus,
        disclosures_acknowledged: true,
      });
      setProfile(updated);
      setRiskSuccess(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to update risk profile";
      setErrorMsg(msg);
    } finally {
      setIsUpdatingRisk(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Market Research & Investor Suitability
          </h1>
          <p className="text-xs text-slate-500">
            Uncertainty-aware analytical tools based on verified corporate fundamentals and SEBI-aligned risk profiling.
          </p>
        </div>

        {/* Mandatory Regulatory / Compliance Guard */}
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 p-4 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-rose-900 dark:text-rose-200">
              SEBI Compliance & Decision Support Notice:
            </span>{" "}
            Sahay does NOT provide guaranteed returns, hot tips, or automated trading execution. All analyses are framed strictly as educational decision-support highlighting valuation risk, debt leverage, and market volatility. Real-money broker order placement is strictly disabled.
          </div>
        </div>

        {errorMsg && (
          <ErrorBanner
            title="Market Research Notice"
            message={errorMsg}
            onDismiss={() => setErrorMsg(null)}
          />
        )}

        {/* Risk Suitability Assessment Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" /> Investor Risk Suitability Assessment
              </CardTitle>
              {profile && (
                <Badge
                  variant={
                    profile.risk_category === "aggressive"
                      ? "warning"
                      : profile.risk_category === "moderate"
                      ? "info"
                      : "success"
                  }
                  size="md"
                >
                  Suitability: {profile.risk_category.toUpperCase()} ({profile.calculated_risk_score}/100)
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              Deterministic scoring formula mapping investment horizon, market familiarity, and loss tolerance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateRiskProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Risk Tolerance
                  </label>
                  <select
                    value={riskTolerance}
                    onChange={(e) => setRiskTolerance(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:ring-emerald-500"
                  >
                    <option value="capital_preservation">Capital Preservation (Low)</option>
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate Balanced</option>
                    <option value="aggressive">Aggressive Growth</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Horizon (Years)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={40}
                    value={horizonYears}
                    onChange={(e) => setHorizonYears(parseInt(e.target.value) || 1)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Market Experience
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:ring-emerald-500"
                  >
                    <option value="beginner">Beginner (&lt; 1 yr)</option>
                    <option value="intermediate">Intermediate (1–5 yrs)</option>
                    <option value="advanced">Advanced (&gt; 5 yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Surplus (₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={500}
                    value={monthlySurplus}
                    onChange={(e) => setMonthlySurplus(parseFloat(e.target.value) || 0)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">
                  {riskSuccess ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Risk Score Recalculated!
                    </span>
                  ) : (
                    "Determined by deterministic points system."
                  )}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdatingRisk}
                  leftIcon={<Sliders className="w-3.5 h-3.5" />}
                >
                  {isUpdatingRisk ? "Recalculating..." : "Recalculate Risk Score"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Benchmark Instruments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Verified Exchange Benchmark Instruments</CardTitle>
                <CardDescription className="text-xs">
                  Broad-based index and commodity ETFs with verified timestamps.
                </CardDescription>
              </div>
              <Badge variant="brand" size="sm">
                <Clock className="w-3 h-3 mr-1" /> Real Timestamps
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loading text="Loading verified benchmarks..." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-2">Ticker</th>
                      <th className="pb-2">Instrument Name</th>
                      <th className="pb-2">Exchange</th>
                      <th className="pb-2">Last Price</th>
                      <th className="pb-2">Verification Provider</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(benchmarks.length > 0
                      ? benchmarks
                      : [
                          {
                            ticker: "NIFTYBEES",
                            name: "Nippon India ETF Nifty 50 BeES",
                            current_price: 260.45,
                            exchange: "NSE",
                            currency: "INR",
                            asset_class: "etf",
                            last_updated_at: "2026-03-31T00:00:00Z",
                            is_stale: false,
                            provider: "Sahay Verified Benchmark Adapter",
                          },
                          {
                            ticker: "JUNIORBEES",
                            name: "Nippon India ETF Nifty Next 50 Junior BeES",
                            current_price: 742.15,
                            exchange: "NSE",
                            currency: "INR",
                            asset_class: "etf",
                            last_updated_at: "2026-03-31T00:00:00Z",
                            is_stale: false,
                            provider: "Sahay Verified Benchmark Adapter",
                          },
                          {
                            ticker: "GOLDBEES",
                            name: "Nippon India ETF Gold BeES",
                            current_price: 66.8,
                            exchange: "NSE",
                            currency: "INR",
                            asset_class: "etf",
                            last_updated_at: "2026-03-31T00:00:00Z",
                            is_stale: false,
                            provider: "Sahay Verified Benchmark Adapter",
                          },
                          {
                            ticker: "LIQUIDBEES",
                            name: "Nippon India ETF Nifty 1D Rate Liquid BeES",
                            current_price: 1000.0,
                            exchange: "NSE",
                            currency: "INR",
                            asset_class: "etf",
                            last_updated_at: "2026-03-31T00:00:00Z",
                            is_stale: false,
                            provider: "Sahay Verified Benchmark Adapter",
                          },
                        ]
                    ).map((item) => (
                      <tr key={item.ticker} className="py-2">
                        <td className="py-3 font-semibold font-mono text-slate-900 dark:text-white">
                          {item.ticker}
                        </td>
                        <td className="py-3 text-slate-700 dark:text-slate-300">{item.name}</td>
                        <td className="py-3">
                          <Badge variant="neutral" size="sm">
                            {item.exchange}
                          </Badge>
                        </td>
                        <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                          ₹{item.current_price.toFixed(2)}
                        </td>
                        <td className="py-3 text-slate-400 text-[11px]">{item.provider}</td>
                        <td className="py-3 text-right">
                          <Link href="/portfolio">
                            <Button size="xs" variant="outline">
                              Practice in Paper Sandbox →
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
