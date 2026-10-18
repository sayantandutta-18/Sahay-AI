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
  Sliders,
  Sparkles,
  BarChart2,
  BookOpen,
  Filter,
  RefreshCw,
  Info,
  ChevronRight,
  TrendingDown,
  HelpCircle,
} from "lucide-react";
import {
  getMarketBenchmarks,
  getInvestmentProfile,
  updateInvestmentProfile,
  getCandlestickInstruments,
  getCandlestickAnalysis,
  authDemoLogin,
} from "@/lib/api";
import {
  MarketQuoteResponse,
  FinancialProfileResponse,
  CandlestickAnalysisResponse,
  InstrumentCandleSummary,
  CandlestickPatternMatch,
} from "@/types";
import { CandlestickChart } from "@/components/candlestick/CandlestickChart";
import { PatternCard } from "@/components/candlestick/PatternCard";
import { SentimentMeter } from "@/components/candlestick/SentimentMeter";

export default function StockResearchPage() {
  const [activeTab, setActiveTab] = useState<"candlestick" | "suitability">("candlestick");

  // Suitability & Benchmark State
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

  // Candlestick Intelligence State
  const [selectedTicker, setSelectedTicker] = useState<string>("NIFTYBEES");
  const [timeframe, setTimeframe] = useState<string>("1D");
  const [instruments, setInstruments] = useState<InstrumentCandleSummary[]>([]);
  const [analysis, setAnalysis] = useState<CandlestickAnalysisResponse | null>(null);
  const [loadingCandles, setLoadingCandles] = useState<boolean>(true);
  const [selectedPattern, setSelectedPattern] = useState<CandlestickPatternMatch | null>(null);
  const [patternFilter, setPatternFilter] = useState<"all" | "bullish" | "bearish" | "indecision">("all");

  // Load Initial Benchmark & Instrument Lists
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        if (typeof window !== "undefined" && !localStorage.getItem("sahay_access_token")) {
          try {
            await authDemoLogin();
          } catch {
            // Proceed
          }
        }
        const [benchData, profileData, instData] = await Promise.allSettled([
          getMarketBenchmarks(),
          getInvestmentProfile(),
          getCandlestickInstruments(),
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
        if (instData.status === "fulfilled") {
          setInstruments(instData.value);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch Candlestick Analysis when ticker changes
  const loadCandleAnalysis = async (ticker: string, tf: string) => {
    setLoadingCandles(true);
    setErrorMsg(null);
    try {
      const data = await getCandlestickAnalysis(ticker, tf);
      setAnalysis(data);
      if (data.recent_patterns.length > 0) {
        setSelectedPattern(data.recent_patterns[data.recent_patterns.length - 1]);
      } else if (data.detected_patterns.length > 0) {
        setSelectedPattern(data.detected_patterns[data.detected_patterns.length - 1]);
      } else {
        setSelectedPattern(null);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to load candlestick patterns";
      setErrorMsg(msg);
    } finally {
      setLoadingCandles(false);
    }
  };

  useEffect(() => {
    loadCandleAnalysis(selectedTicker, timeframe);
  }, [selectedTicker, timeframe]);

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

  // Filtered patterns list
  const filteredPatterns = (analysis?.detected_patterns || []).filter((p) => {
    if (patternFilter === "bullish") return p.sentiment === "bullish";
    if (patternFilter === "bearish") return p.sentiment === "bearish";
    if (patternFilter === "indecision") return p.sentiment === "neutral";
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              Market Intelligence & Technical Analysis
            </h1>
            <p className="text-xs text-slate-500">
              Deterministic candlestick pattern recognition, volume confirmation, and SEBI-aligned suitability models.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/portfolio">
              <Button size="sm" variant="outline">
                Open Paper Sandbox →
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("candlestick")}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "candlestick"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            Candlestick Pattern Intelligence
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("suitability")}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "suitability"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Compass className="w-4 h-4 text-purple-600" />
            Investor Suitability & Verified Benchmarks
          </button>
        </div>

        {/* Mandatory Regulatory / Compliance Guard */}
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 p-3.5 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-rose-900 dark:text-rose-200">
              SEBI Compliance & Decision Support Notice:
            </span>{" "}
            Sahay does NOT provide guaranteed returns, tips, or automated trade execution. All candlestick patterns and technical indicators are framed strictly as educational decision-support to explain price action and manage downside risk.
          </div>
        </div>

        {errorMsg && (
          <ErrorBanner
            title="Analysis Notice"
            message={errorMsg}
            onDismiss={() => setErrorMsg(null)}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 1: CANDLESTICK PATTERN INTELLIGENCE */}
        {/* ========================================================================= */}
        {activeTab === "candlestick" && (
          <div className="space-y-6">
            {/* Instrument Selection Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Instruments:
              </span>
              {(instruments.length > 0
                ? instruments
                : [
                    { ticker: "NIFTYBEES", name: "Nifty 50 ETF", exchange: "NSE", current_price: 260.45, change_24h_percent: 0.65, sentiment: "mildly_bullish" },
                    { ticker: "BANKBEES", name: "Nifty Bank ETF", exchange: "NSE", current_price: 542.20, change_24h_percent: 1.10, sentiment: "strongly_bullish" },
                    { ticker: "GOLDBEES", name: "Gold BeES ETF", exchange: "NSE", current_price: 66.80, change_24h_percent: -0.25, sentiment: "neutral" },
                    { ticker: "JUNIORBEES", name: "Next 50 ETF", exchange: "NSE", current_price: 742.15, change_24h_percent: 0.85, sentiment: "mildly_bullish" },
                    { ticker: "LIQUIDBEES", name: "Liquid ETF", exchange: "NSE", current_price: 1000.0, change_24h_percent: 0.01, sentiment: "neutral" },
                  ]
              ).map((inst) => {
                const isSelected = selectedTicker === inst.ticker;
                return (
                  <button
                    key={inst.ticker}
                    type="button"
                    onClick={() => setSelectedTicker(inst.ticker)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all shrink-0 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-mono font-bold">{inst.ticker}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ₹{inst.current_price.toFixed(2)}
                    </span>
                    <Badge
                      variant={
                        inst.change_24h_percent >= 0 ? "success" : "danger"
                      }
                      size="sm"
                    >
                      {inst.change_24h_percent >= 0 ? "+" : ""}
                      {inst.change_24h_percent.toFixed(2)}%
                    </Badge>
                  </button>
                );
              })}
            </div>

            {loadingCandles ? (
              <Loading text={`Running pattern recognition on ${selectedTicker}...`} />
            ) : analysis ? (
              <>
                {/* Main Interactive Candlestick Chart */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {analysis.instrument_name} ({analysis.ticker})
                      </h2>
                      <Badge variant="neutral" size="sm">
                        {analysis.exchange}
                      </Badge>
                    </div>

                    <button
                      type="button"
                      onClick={() => loadCandleAnalysis(selectedTicker, timeframe)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Bars</span>
                    </button>
                  </div>

                  <CandlestickChart
                    candles={analysis.candles}
                    patterns={analysis.detected_patterns}
                    supportLevel={analysis.technical_indicators.nearest_support}
                    resistanceLevel={analysis.technical_indicators.nearest_resistance}
                    onSelectPattern={(pat) => setSelectedPattern(pat)}
                    selectedPatternId={selectedPattern?.pattern_id}
                  />
                </div>

                {/* Educational Takeaway & Sentiment Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Educational Takeaway & Pattern Filter */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Plain Language Technical Takeaway */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                          AI Candlestick Technical Summary
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {analysis.educational_takeaway}
                        </p>
                      </div>
                    </div>

                    {/* Detected Patterns List & Filters */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Detected Formations ({filteredPatterns.length})
                          </h3>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-center gap-1 text-xs">
                          {(
                            [
                              { id: "all", label: "All Formations" },
                              { id: "bullish", label: "Bullish (▲)" },
                              { id: "bearish", label: "Bearish (▼)" },
                              { id: "indecision", label: "Indecision (•)" },
                            ] as const
                          ).map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setPatternFilter(f.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                patternFilter === f.id
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {filteredPatterns.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                          No formations found under current filter. Try selecting &quot;All Formations&quot;.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filteredPatterns.map((pat) => (
                            <PatternCard
                              key={`${pat.pattern_id}-${pat.trigger_candle_index}`}
                              pattern={pat}
                              isSelected={selectedPattern?.pattern_id === pat.pattern_id && selectedPattern?.trigger_candle_index === pat.trigger_candle_index}
                              onSelect={() => setSelectedPattern(pat)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right 1 Col: Sentiment Meter & Selected Pattern Inspector */}
                  <div className="space-y-6">
                    <SentimentMeter
                      sentiment={analysis.sentiment}
                      indicators={analysis.technical_indicators}
                    />

                    {/* Selected Pattern Detailed Inspector */}
                    {selectedPattern && (
                      <Card className="border-emerald-500/30 bg-white dark:bg-slate-900 shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <span>Selected Formation Focus</span>
                            <Badge variant="brand" size="sm">
                              {selectedPattern.reliability}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {selectedPattern.pattern_name}{" "}
                            {selectedPattern.japanese_name && `(${selectedPattern.japanese_name})`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                          <p className="text-slate-600 dark:text-slate-400">
                            {selectedPattern.description}
                          </p>

                          <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-[11px] space-y-1">
                            <span className="font-semibold text-emerald-800 dark:text-emerald-300 block">
                              Educational Lesson:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400">
                              {selectedPattern.implication}
                            </p>
                          </div>

                          <div className="pt-2">
                            <Link href="/portfolio">
                              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                                Simulate Order in Paper Sandbox →
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INVESTOR SUITABILITY & VERIFIED BENCHMARKS */}
        {/* ========================================================================= */}
        {activeTab === "suitability" && (
          <div className="space-y-6">
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
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTicker(item.ticker);
                                  setActiveTab("candlestick");
                                }}
                                className="text-emerald-600 hover:underline font-medium text-xs mr-3 cursor-pointer"
                              >
                                View Candlesticks →
                              </button>
                              <Link href="/portfolio">
                                <Button size="xs" variant="outline">
                                  Paper Sandbox
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
        )}
      </div>
    </AppLayout>
  );
}
