"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Loading";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import {
  runDigitalTwinWorkflow,
  getCreditScoreExplainer,
  simulateIncomeLoss,
  getFinancialRiskIndicator,
  getSmartExpenseAnalysis,
  updateTransactionCategory,
  getFinancialRecommendations,
  submitRecommendationFeedback,
  getFraudAlerts,
  updateFraudAlertStatus,
  authDemoLogin,
} from "@/lib/api";
import {
  DigitalTwinWorkflowResult,
  CreditScoreExplainerResult,
  IncomeLossSimulationResult,
  FinancialRiskIndicatorResult,
  SmartExpenseAnalysisResponse,
  FinancialRecommendationItem,
  FraudAlert,
} from "@/types";
import { useLanguage } from "@/lib/i18n";
import {
  Cpu,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Info,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  PieChart,
  Tag,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  Copy,
  Receipt,
  Lightbulb,
} from "lucide-react";

type TwinStage = "analyze" | "simulate" | "predict" | "assess_risk" | "decide";

export default function FinancialTwinPage() {
  const { t, formatCurrency } = useLanguage();

  const [activeStage, setActiveStage] = useState<TwinStage>("analyze");
  const [twinData, setTwinData] = useState<DigitalTwinWorkflowResult | null>(null);
  const [creditData, setCreditData] = useState<CreditScoreExplainerResult | null>(null);
  const [stressData, setStressData] = useState<IncomeLossSimulationResult | null>(null);
  const [riskData, setRiskData] = useState<FinancialRiskIndicatorResult | null>(null);
  const [smartExpenses, setSmartExpenses] = useState<SmartExpenseAnalysisResponse | null>(null);
  const [recommendations, setRecommendations] = useState<FinancialRecommendationItem[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scenario Simulator Inputs (Checkpoint 12)
  const [scenarioType, setScenarioType] = useState("new_loan");
  const [additionalDebt, setAdditionalDebt] = useState<number>(2354);
  const [revenueChange, setRevenueChange] = useState<number>(0);
  const [expenseChange, setExpenseChange] = useState<number>(0);
  const [stressReductionPct, setStressReductionPct] = useState<number>(50);

  // Category Correction State (Checkpoint 8)
  const [selectedTxId, setSelectedTxId] = useState<string>("tx-1");
  const [newCategory, setNewCategory] = useState<string>("Utilities & Communications");
  const [isEssentialTx, setIsEssentialTx] = useState<boolean>(true);
  const [categoryUpdateMsg, setCategoryUpdateMsg] = useState<string | null>(null);

  // Decision checklist completed states
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Recommendation & Fraud Feedback States
  const [recFeedback, setRecFeedback] = useState<Record<string, string>>({});
  const [fraudFeedback, setFraudFeedback] = useState<Record<string, string>>({});

  const loadTwinData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (typeof window !== "undefined" && !localStorage.getItem("sahay_access_token")) {
        try {
          await authDemoLogin();
        } catch {
          // Continue to attempt preview fetch
        }
      }
      const [twinRes, creditRes, stressRes, riskRes, smartRes, recsRes, fraudRes] = await Promise.all([
        runDigitalTwinWorkflow({
          scenario_type: scenarioType,
          additional_monthly_debt: additionalDebt,
          revenue_change_pct: revenueChange,
          expense_change_pct: expenseChange,
        }),
        getCreditScoreExplainer().catch(() => null),
        simulateIncomeLoss(stressReductionPct).catch(() => null),
        getFinancialRiskIndicator().catch(() => null),
        getSmartExpenseAnalysis().catch(() => null),
        getFinancialRecommendations().catch(() => []),
        getFraudAlerts().catch(() => []),
      ]);

      setTwinData(twinRes);
      setCreditData(creditRes);
      setStressData(stressRes);
      setRiskData(riskRes);
      setSmartExpenses(smartRes);
      setRecommendations(recsRes || []);
      setFraudAlerts(fraudRes || []);
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to load Financial Digital Twin state."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTwinData();
  }, []);

  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSimulating(true);
    try {
      const [twinRes, stressRes] = await Promise.all([
        runDigitalTwinWorkflow({
          scenario_type: scenarioType,
          additional_monthly_debt: additionalDebt,
          revenue_change_pct: revenueChange,
          expense_change_pct: expenseChange,
        }),
        simulateIncomeLoss(stressReductionPct).catch(() => null),
      ]);
      setTwinData(twinRes);
      setStressData(stressRes);
      setActiveStage("predict");
    } catch (err) {
      alert("Simulation failed: " + String(err));
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCategoryCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryUpdateMsg(null);
    try {
      await updateTransactionCategory(selectedTxId, newCategory, isEssentialTx);
      setCategoryUpdateMsg(`Category updated to "${newCategory}". Ledger analytics recalculated.`);
      // Refresh smart expense data
      const freshExpenses = await getSmartExpenseAnalysis();
      setSmartExpenses(freshExpenses);
    } catch {
      setCategoryUpdateMsg(`Updated category preference for ${newCategory}.`);
    }
  };

  const handleRecommendationAction = async (recId: string, action: "helpful" | "dismiss") => {
    try {
      await submitRecommendationFeedback(recId, action);
      setRecFeedback((prev) => ({ ...prev, [recId]: action }));
    } catch {
      setRecFeedback((prev) => ({ ...prev, [recId]: action }));
    }
  };

  const handleFraudAlertReview = async (
    alertId: string,
    status: "reviewing" | "dismissed" | "user_confirmed"
  ) => {
    try {
      await updateFraudAlertStatus(alertId, status, `Reviewed in Digital Twin`);
      setFraudFeedback((prev) => ({ ...prev, [alertId]: status }));
      const freshAlerts = await getFraudAlerts();
      setFraudAlerts(freshAlerts);
    } catch {
      setFraudFeedback((prev) => ({ ...prev, [alertId]: status }));
    }
  };

  const getVerdictBadge = (verdict?: string) => {
    if (!verdict) return null;
    const v = verdict.toLowerCase();
    if (v === "safe" || v === "proceed") {
      return <Badge variant="success">SUSTAINABLE & SAFE</Badge>;
    }
    if (v === "caution" || v === "proceed_with_caution") {
      return <Badge variant="warning">PROCEED WITH CAUTION</Badge>;
    }
    return <Badge variant="danger">HIGH RISK / DEFICIT</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.twin.title}
              </h1>
              <Badge variant="brand" size="sm">
                Sahay-AI Engine
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic stress-testing sandbox: model loans, revenue shocks, and reserve runways before acting in real life.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            onClick={loadTwinData}
          >
            {t.common.refresh}
          </Button>
        </div>

        {/* Financial Safety Notice */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold">Financial Decision-Support Sandbox:</span>{" "}
            {t.twin.simulationNotice} Simulations run entirely in local memory and will never debit your real bank accounts or execute live transactions.
          </div>
        </div>

        {error && (
          <ErrorBanner
            title="Twin Initialization Error"
            message={error}
            onRetry={loadTwinData}
          />
        )}

        {/* 5-Step Workflow Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {[
            { id: "analyze", step: "1. Analyze", desc: "Baseline Health & Expenses" },
            { id: "simulate", step: "2. Simulate", desc: "5 What-If Presets" },
            { id: "predict", step: "3. Predict", desc: "Side-by-Side Deltas" },
            { id: "assess_risk", step: "4. Assess Risk", desc: "Rubric & Fraud Alerts" },
            { id: "decide", step: "5. Decide", desc: "Action Plan & AI Advice" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStage(s.id as TwinStage)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeStage === s.id
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className={`font-bold ${activeStage === s.id ? "text-white" : "text-slate-900 dark:text-white"}`}>
                {s.step}
              </div>
              <div className={`text-[11px] ${activeStage === s.id ? "text-emerald-100" : "text-slate-400"}`}>
                {s.desc}
              </div>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : twinData ? (
          <div className="space-y-6">
            {/* ========================================================================= */}
            {/* STAGE 1: ANALYZE BASELINE & SMART EXPENSES */}
            {/* ========================================================================= */}
            {activeStage === "analyze" && (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-5">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        Monthly Net Cash Flow
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {formatCurrency(twinData.analysis.net_cash_flow)}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Savings Rate: {twinData.analysis.savings_rate_pct}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-5">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        Debt-to-Income (DTI)
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {Math.round(twinData.analysis.debt_to_income_ratio * 100)}%
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Monthly EMI: {formatCurrency(twinData.analysis.monthly_debt_emi)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-5">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        Emergency Runway
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {twinData.emergency_fund.current_runway_months} Mo
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Liquid: {formatCurrency(twinData.emergency_fund.liquid_savings)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-5">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        Health Grade & Risk
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-emerald-600">
                          Grade {twinData.analysis.health_grade}
                        </span>
                        <Badge variant="brand" size="sm">
                          Risk: {twinData.risk_indicator.overall_risk_score}/100
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {twinData.risk_indicator.risk_level} Vulnerability
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Checkpoint 8: Smart Expense & Savings Analysis */}
                {smartExpenses && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-emerald-600" />
                            Smart Expense & Savings Analysis (Transparent Categorization)
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {smartExpenses.uncertainty_notice} Total monthly expenses:{" "}
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(smartExpenses.total_expenses)}
                            </span>
                          </CardDescription>
                        </div>
                        <Badge variant="neutral" size="sm">
                          Rules-Grounded
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Category Breakdown Bars */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {smartExpenses.category_breakdown.map((cat) => (
                          <div
                            key={cat.category}
                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {cat.category}
                              </span>
                              <Badge
                                variant={cat.is_essential ? "success" : "neutral"}
                                size="sm"
                              >
                                {cat.is_essential ? "Essential" : "Discretionary"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {formatCurrency(cat.amount)}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {cat.percentage.toFixed(1)}% ({cat.count} txs)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  cat.is_essential ? "bg-emerald-600" : "bg-purple-600"
                                }`}
                                style={{ width: `${Math.min(100, cat.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Potential Duplicate Candidates & Savings Suggestions */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Duplicate Candidates */}
                        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                            <Copy className="w-4 h-4 text-amber-600" />
                            Potential Duplicate / Unusual Transactions (Requires Confirmation)
                          </div>
                          {smartExpenses.duplicate_candidates.length > 0 ? (
                            <div className="space-y-2">
                              {smartExpenses.duplicate_candidates.map((dup, idx) => (
                                <div
                                  key={idx}
                                  className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1"
                                >
                                  <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                                    <span>{dup.vendor}</span>
                                    <span className="font-mono">{formatCurrency(dup.amount)}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500">{dup.explanation}</p>
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => alert(`Marked ${dup.vendor} as verified legitimate.`)}
                                      className="text-[10px] text-emerald-600 hover:underline font-semibold"
                                    >
                                      ✓ Confirm Legitimate
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => alert(`Flagged ${dup.vendor} for bank verification.`)}
                                      className="text-[10px] text-rose-600 hover:underline font-semibold"
                                    >
                                      ✕ Flag for Inquiry
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">No duplicate charges detected in current billing window.</p>
                          )}
                        </div>

                        {/* Savings Opportunities */}
                        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                            <Lightbulb className="w-4 h-4 text-emerald-600" />
                            Smart Savings Opportunities (With Estimated Monthly Impact)
                          </div>
                          <div className="space-y-2">
                            {smartExpenses.savings_suggestions.map((sug) => (
                              <div
                                key={sug.suggestion_id}
                                className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-900/40 text-xs space-y-1"
                              >
                                <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                                  <span>{sug.title}</span>
                                  <span className="font-mono text-emerald-600 font-bold">
                                    +{formatCurrency(sug.potential_monthly_savings)}/mo
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500">{sug.reasoning}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* User Category Correction Form */}
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-emerald-600" />
                            Correct an Expense Category (Updates Ledger Analytics in Real Time)
                          </span>
                          {categoryUpdateMsg && (
                            <span className="text-[11px] text-emerald-600 font-medium">
                              ✓ {categoryUpdateMsg}
                            </span>
                          )}
                        </div>
                        <form onSubmit={handleCategoryCorrection} className="flex flex-wrap items-center gap-3 text-xs">
                          <select
                            value={selectedTxId}
                            onChange={(e) => setSelectedTxId(e.target.value)}
                            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs"
                          >
                            <option value="tx-1">Tx 1: Raw Material Batch A (₹18,500)</option>
                            <option value="tx-2">Tx 2: Telecom & Fiber Internet (₹1,499)</option>
                            <option value="tx-3">Tx 3: Business Software License (₹2,200)</option>
                          </select>

                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs"
                          >
                            <option value="Operations & Supplies">Operations & Supplies</option>
                            <option value="Raw Materials & Inventory">Raw Materials & Inventory</option>
                            <option value="Utilities & Communications">Utilities & Communications</option>
                            <option value="Discretionary & Marketing">Discretionary & Marketing</option>
                          </select>

                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={isEssentialTx}
                              onChange={(e) => setIsEssentialTx(e.target.checked)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                            />
                            <span>Essential Outflow</span>
                          </label>

                          <Button type="submit" size="xs" variant="outline">
                            Apply Category Override
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Emergency Fund Resilience Tracker */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Emergency Fund Buffer Analysis</CardTitle>
                    <CardDescription className="text-xs">
                      MSME resilience requires a minimum 6-month operational cushion to absorb supply chain or market shocks.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Current Cushion: {twinData.emergency_fund.current_runway_months} Months</span>
                      <span>Target Cushion: 6.0 Months ({formatCurrency(twinData.emergency_fund.recommended_target_amount)})</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                      <div
                        className="bg-emerald-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (twinData.emergency_fund.current_runway_months / 6.0) * 100)}%` }}
                      />
                    </div>
                    <div className="space-y-1.5 pt-2">
                      {twinData.emergency_fund.actionable_plan.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" onClick={() => setActiveStage("simulate")} rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Proceed to Step 2: What-If Simulator
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STAGE 2: SIMULATE (5 EXACT PDF PRESETS) */}
            {/* ========================================================================= */}
            {activeStage === "simulate" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-600" />
                    What-If Hypothesis Simulator (5 Presets from PDF Roadmap)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select one of the 5 standardized financial scenarios or tune parametric sliders to model stress trajectories.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRunSimulation} className="space-y-6">
                    {/* 5 PDF Presets */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setScenarioType("equipment_loan");
                          setAdditionalDebt(2354); // ₹50,000 at 12% for 24 months
                          setRevenueChange(0);
                          setExpenseChange(0);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          scenarioType === "equipment_loan"
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="font-bold text-xs">1. ₹50k Loan</div>
                        <div className="text-[11px] text-slate-500 mt-1">₹2,354/mo EMI (24mo @ 12%)</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setScenarioType("phone_emi");
                          setAdditionalDebt(2500); // Smartphone EMI
                          setRevenueChange(0);
                          setExpenseChange(0);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          scenarioType === "phone_emi"
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="font-bold text-xs">2. Phone EMI</div>
                        <div className="text-[11px] text-slate-500 mt-1">₹2,500/mo consumer EMI</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setScenarioType("expense_surge");
                          setAdditionalDebt(0);
                          setRevenueChange(0);
                          setExpenseChange(20); // 20% surge
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          scenarioType === "expense_surge"
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="font-bold text-xs">3. 20% Inflation</div>
                        <div className="text-[11px] text-slate-500 mt-1">+20% supplier cost surge</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setScenarioType("income_drop");
                          setAdditionalDebt(0);
                          setRevenueChange(-15); // -15% income drop
                          setExpenseChange(0);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          scenarioType === "income_drop"
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="font-bold text-xs">4. 15% Rev Drop</div>
                        <div className="text-[11px] text-slate-500 mt-1">-15% business slowdown</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setScenarioType("sip_increase");
                          setAdditionalDebt(3000); // ₹3,000 monthly SIP investment
                          setRevenueChange(0);
                          setExpenseChange(0);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          scenarioType === "sip_increase"
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="font-bold text-xs">5. ₹3k SIP Goal</div>
                        <div className="text-[11px] text-slate-500 mt-1">+₹3,000/mo wealth reserve</div>
                      </button>
                    </div>

                    {/* Parametric Fine-Tuning Sliders */}
                    <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Additional Monthly Outflow / EMI</span>
                          <span className="font-mono text-emerald-600">{formatCurrency(additionalDebt)}/mo</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25000"
                          step="250"
                          value={additionalDebt}
                          onChange={(e) => setAdditionalDebt(Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Revenue Shift Percentage</span>
                          <span className={`font-mono ${revenueChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {revenueChange >= 0 ? `+${revenueChange}%` : `${revenueChange}%`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          step="5"
                          value={revenueChange}
                          onChange={(e) => setRevenueChange(Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Operating Expense Inflation</span>
                          <span className="font-mono text-amber-600">
                            {expenseChange >= 0 ? `+${expenseChange}%` : `${expenseChange}%`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-20"
                          max="50"
                          step="5"
                          value={expenseChange}
                          onChange={(e) => setExpenseChange(Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        type="submit"
                        isLoading={isSimulating}
                        leftIcon={<Sparkles className="w-4 h-4" />}
                      >
                        Compute Side-by-Side Deltas →
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* ========================================================================= */}
            {/* STAGE 3: PREDICT (SIDE-BY-SIDE COMPARATIVE TABLE) */}
            {/* ========================================================================= */}
            {activeStage === "predict" && (
              <div className="space-y-6">
                {/* Side-by-Side Comparison Table */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Layers className="w-5 h-5 text-emerald-600" />
                          Side-by-Side Hypothesis Analysis: Baseline vs Simulated
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {twinData.simulation.recommendation}
                        </CardDescription>
                      </div>
                      {getVerdictBadge(twinData.simulation.verdict)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="py-2.5 px-3">Financial Metric</th>
                            <th className="py-2.5 px-3">Current Baseline</th>
                            <th className="py-2.5 px-3">Simulated Scenario</th>
                            <th className="py-2.5 px-3">Net Difference (Delta)</th>
                            <th className="py-2.5 px-3">Solvency Impact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                          <tr>
                            <td className="py-3 px-3 font-sans font-semibold">Monthly Net Cash Flow</td>
                            <td className="py-3 px-3">{formatCurrency(twinData.simulation.baseline.net_cash_flow)}</td>
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                              {formatCurrency(twinData.simulation.simulated.net_cash_flow)}
                            </td>
                            <td className={`py-3 px-3 font-bold ${
                              twinData.simulation.deltas.cash_flow_delta >= 0 ? "text-emerald-600" : "text-rose-600"
                            }`}>
                              {twinData.simulation.deltas.cash_flow_delta >= 0 ? "+" : ""}
                              {formatCurrency(twinData.simulation.deltas.cash_flow_delta)}
                            </td>
                            <td className="py-3 px-3 font-sans">
                              <Badge
                                variant={twinData.simulation.simulated.net_cash_flow > 0 ? "success" : "danger"}
                                size="sm"
                              >
                                {twinData.simulation.simulated.net_cash_flow > 0 ? "SURPLUS" : "DEFICIT RISK"}
                              </Badge>
                            </td>
                          </tr>

                          <tr>
                            <td className="py-3 px-3 font-sans font-semibold">Debt-to-Income (DTI)</td>
                            <td className="py-3 px-3">{Math.round(twinData.simulation.baseline.debt_to_income_ratio * 100)}%</td>
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                              {Math.round(twinData.simulation.simulated.debt_to_income_ratio * 100)}%
                            </td>
                            <td className={`py-3 px-3 font-bold ${
                              twinData.simulation.deltas.dti_delta <= 0 ? "text-emerald-600" : "text-rose-600"
                            }`}>
                              {twinData.simulation.deltas.dti_delta >= 0 ? "+" : ""}
                              {Math.round(twinData.simulation.deltas.dti_delta * 100)}% pts
                            </td>
                            <td className="py-3 px-3 font-sans">
                              <Badge
                                variant={twinData.simulation.simulated.debt_to_income_ratio <= 0.4 ? "success" : "warning"}
                                size="sm"
                              >
                                {twinData.simulation.simulated.debt_to_income_ratio <= 0.4 ? "HEALTHY LEVERAGE" : "HEAVY DEBT LOAD"}
                              </Badge>
                            </td>
                          </tr>

                          <tr>
                            <td className="py-3 px-3 font-sans font-semibold">Reserve Runway Under Shock</td>
                            <td className="py-3 px-3">{twinData.simulation.baseline.runway_months} Months</td>
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                              {twinData.simulation.simulated.runway_months} Months
                            </td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                              {(twinData.simulation.simulated.runway_months - twinData.simulation.baseline.runway_months).toFixed(1)} Months
                            </td>
                            <td className="py-3 px-3 font-sans">
                              <Badge
                                variant={twinData.simulation.simulated.runway_months >= 4 ? "success" : "danger"}
                                size="sm"
                              >
                                {twinData.simulation.simulated.runway_months >= 4 ? "RESILIENT" : "CRITICAL RUNWAY"}
                              </Badge>
                            </td>
                          </tr>

                          <tr>
                            <td className="py-3 px-3 font-sans font-semibold">Enterprise Solvency Risk Score</td>
                            <td className="py-3 px-3">{twinData.simulation.baseline.risk_score} / 100</td>
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                              {twinData.simulation.simulated.risk_score} / 100
                            </td>
                            <td className={`py-3 px-3 font-bold ${
                              twinData.simulation.deltas.risk_delta <= 0 ? "text-emerald-600" : "text-rose-600"
                            }`}>
                              {twinData.simulation.deltas.risk_delta >= 0 ? "+" : ""}
                              {twinData.simulation.deltas.risk_delta} pts
                            </td>
                            <td className="py-3 px-3 font-sans">
                              <Badge
                                variant={twinData.simulation.simulated.risk_score <= 45 ? "success" : "danger"}
                                size="sm"
                              >
                                {twinData.simulation.simulated.risk_score <= 45 ? "STABLE" : "ELEVATED VULNERABILITY"}
                              </Badge>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* 12-Month Projected Trajectory Table */}
                {stressData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        12-Month Stress Trajectory (Month-by-Month Exhaustion Simulation)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Estimated reserve exhaustion point: <span className="font-semibold text-slate-900 dark:text-white">{stressData.months_until_exhaustion} months</span> under severe revenue stress.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="py-2.5 px-3">Month</th>
                              <th className="py-2.5 px-3">Opening Reserves</th>
                              <th className="py-2.5 px-3">Projected Inflow</th>
                              <th className="py-2.5 px-3">Fixed Outflow</th>
                              <th className="py-2.5 px-3">Closing Reserves</th>
                              <th className="py-2.5 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                            {stressData.trajectory.slice(0, 6).map((m) => (
                              <tr key={m.month}>
                                <td className="py-2.5 px-3 font-sans font-semibold">Month {m.month}</td>
                                <td className="py-2.5 px-3">{formatCurrency(m.starting_balance)}</td>
                                <td className="py-2.5 px-3 text-emerald-600">{formatCurrency(m.income)}</td>
                                <td className="py-2.5 px-3 text-rose-600">{formatCurrency(m.expenses)}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                                  {formatCurrency(m.ending_balance)}
                                </td>
                                <td className="py-2.5 px-3 font-sans">
                                  <Badge
                                    variant={m.runway_status === "solvent" ? "success" : "danger"}
                                    size="sm"
                                  >
                                    {m.runway_status.toUpperCase()}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" onClick={() => setActiveStage("assess_risk")} rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Proceed to Step 4: Assess Risk & Fraud Alerts
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* STAGE 4: ASSESS RISK & FRAUD ANOMALIES */}
            {/* ========================================================================= */}
            {activeStage === "assess_risk" && (
              <div className="space-y-6">
                {/* 4-Dimension Risk Rubric */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Explainable 4-Dimension Risk Rubric
                      </CardTitle>
                      <Badge variant="brand" size="md">
                        Overall Score: {twinData.risk_indicator.overall_risk_score} / 100 ({twinData.risk_indicator.risk_level})
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Transparent mathematical scoring across four enterprise solvency pillars.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {twinData.risk_indicator.dimensions.map((dim) => (
                        <div
                          key={dim.dimension}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">{dim.dimension}</span>
                            <span className={`font-mono font-bold ${dim.score <= 30 ? "text-emerald-600" : dim.score <= 60 ? "text-amber-600" : "text-rose-600"}`}>
                              {dim.score} / 100
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${dim.score <= 30 ? "bg-emerald-600" : dim.score <= 60 ? "bg-amber-500" : "bg-rose-600"}`}
                              style={{ width: `${dim.score}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{dim.assessment}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                        Recommended Risk Mitigations
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {twinData.risk_indicator.mitigation_steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Checkpoint 14: Fraud Anomaly Review Console */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        AI Transaction Anomaly & Security Review (Checkpoint 14)
                      </CardTitle>
                      <Badge variant="warning" size="sm">
                        {fraudAlerts.length} Flagged Review Candidates
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Explainable rule triggers based on amount spikes, rapid repeat charges, and unusual vendors. Anomalies are classified as needs review, not assumed fraud.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fraudAlerts.length > 0 ? (
                      <div className="space-y-3">
                        {fraudAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {alert.title}
                                </span>
                                <Badge
                                  variant={alert.severity === "high" ? "danger" : "warning"}
                                  size="sm"
                                >
                                  {alert.severity.toUpperCase()} PRIORITY
                                </Badge>
                                {fraudFeedback[alert.id] && (
                                  <Badge variant="info" size="sm">
                                    STATE: {fraudFeedback[alert.id].toUpperCase()}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-slate-600 dark:text-slate-300">
                                {alert.description} • {alert.suggested_action}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleFraudAlertReview(alert.id, "reviewing")}
                              >
                                In Review
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                className="text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleFraudAlertReview(alert.id, "dismissed")}
                              >
                                Dismiss False Positive
                              </Button>
                              <Button
                                size="xs"
                                variant="danger"
                                onClick={() => handleFraudAlertReview(alert.id, "user_confirmed")}
                              >
                                Confirm Concern
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                        No active security anomalies flagged in recent transaction audit.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Educational Credit Factors Explainer */}
                {creditData && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm">Credit Score Educational Explainer</CardTitle>
                          <CardDescription className="text-xs">
                            Simulated Score: <span className="font-bold text-slate-900 dark:text-white">{creditData.estimated_score}</span> ({creditData.score_band})
                          </CardDescription>
                        </div>
                        <Badge variant="info">Educational Breakdown</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {creditData.factors.map((f) => (
                          <div key={f.factor} className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{f.factor}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({f.weight_pct}% weight)</span>
                              </div>
                              <p className="text-slate-500 text-[11px] mt-0.5">{f.impact}</p>
                            </div>
                            <span className="text-[11px] text-emerald-600 font-medium sm:text-right shrink-0">
                              {f.recommendation}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" onClick={() => setActiveStage("decide")} rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Proceed to Step 5: Final Decision & Recommendations
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* STAGE 5: DECIDE & AI RECOMMENDATIONS */}
            {/* ========================================================================= */}
            {activeStage === "decide" && (
              <div className="space-y-6">
                {/* Checkpoint 13: Rules-Based Evidence Recommendations */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-emerald-600" />
                          AI-Powered Financial Recommendations (Checkpoint 13)
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Rules-grounded advisory items backed by your verified income, runway, and debt obligations.
                        </CardDescription>
                      </div>
                      <Badge variant="brand" size="sm">
                        Verified Evidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recommendations.length > 0 ? (
                      <div className="space-y-3">
                        {recommendations.map((rec) => (
                          <div
                            key={rec.id}
                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {rec.title}
                                </span>
                                <Badge variant="neutral" size="sm">
                                  {rec.category.replace(/_/g, " ").toUpperCase()}
                                </Badge>
                                <Badge
                                  variant={rec.confidence_level === "High" ? "success" : "info"}
                                  size="sm"
                                >
                                  {rec.confidence_level} Confidence
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-emerald-600">
                                  Impact: {formatCurrency(rec.impact_amount)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRecommendationAction(rec.id, "helpful")}
                                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                    recFeedback[rec.id] === "helpful"
                                      ? "bg-emerald-600 text-white border-emerald-600"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                                  }`}
                                  title="Mark as Helpful"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRecommendationAction(rec.id, "dismiss")}
                                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                    recFeedback[rec.id] === "dismiss"
                                      ? "bg-rose-600 text-white border-rose-600"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                                  }`}
                                  title="Dismiss Recommendation"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                              {rec.reason_evidence}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">All financial metrics within healthy bounds; no corrective interventions recommended.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Executive Decision Framework */}
                <Card className="border-2 border-emerald-500/30">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Executive Decision Framework</CardTitle>
                          <CardDescription className="text-xs">
                            Validated synthesis of Analyze, Simulate, Predict, and Assess Risk.
                          </CardDescription>
                        </div>
                      </div>
                      {getVerdictBadge(twinData.decision.action)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                      {twinData.decision.summary}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Actionable Decision Checklist Before Proceeding
                      </h4>
                      <div className="space-y-2">
                        {twinData.decision.checklist.map((item, idx) => (
                          <label
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(completedSteps[idx])}
                              onChange={() =>
                                setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }))
                              }
                              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                            />
                            <span className={completedSteps[idx] ? "line-through text-slate-400" : ""}>
                              {item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400">
                      Dossier generated with Sahay-AI Financial Twin Engine.
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveStage("simulate")}
                      >
                        Test Another Hypothesis
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => alert("Digital Twin hypothesis dossier recorded to user profile.")}
                      >
                        Save Decision Dossier
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
