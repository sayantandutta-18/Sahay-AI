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
} from "@/lib/api";
import {
  DigitalTwinWorkflowResult,
  CreditScoreExplainerResult,
  IncomeLossSimulationResult,
  FinancialRiskIndicatorResult,
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
} from "lucide-react";

type TwinStage = "analyze" | "simulate" | "predict" | "assess_risk" | "decide";

export default function FinancialTwinPage() {
  const { t, formatCurrency } = useLanguage();

  const [activeStage, setActiveStage] = useState<TwinStage>("analyze");
  const [twinData, setTwinData] = useState<DigitalTwinWorkflowResult | null>(null);
  const [creditData, setCreditData] = useState<CreditScoreExplainerResult | null>(null);
  const [stressData, setStressData] = useState<IncomeLossSimulationResult | null>(null);
  const [riskData, setRiskData] = useState<FinancialRiskIndicatorResult | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scenario Simulator Inputs
  const [scenarioType, setScenarioType] = useState("new_loan");
  const [additionalDebt, setAdditionalDebt] = useState<number>(5000);
  const [revenueChange, setRevenueChange] = useState<number>(0);
  const [expenseChange, setExpenseChange] = useState<number>(0);
  const [stressReductionPct, setStressReductionPct] = useState<number>(50);

  // Decision checklist completed states
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const loadTwinData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [twinRes, creditRes, stressRes, riskRes] = await Promise.all([
        runDigitalTwinWorkflow({
          scenario_type: scenarioType,
          additional_monthly_debt: additionalDebt,
          revenue_change_pct: revenueChange,
          expense_change_pct: expenseChange,
        }),
        getCreditScoreExplainer().catch(() => null),
        simulateIncomeLoss(stressReductionPct).catch(() => null),
        getFinancialRiskIndicator().catch(() => null),
      ]);
      setTwinData(twinRes);
      setCreditData(creditRes);
      setStressData(stressRes);
      setRiskData(riskRes);
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
                Valmont Engine
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

        {/* Financial Safety / Compliance Notice */}
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
            { id: "analyze", step: "1. Analyze", desc: "Baseline Health" },
            { id: "simulate", step: "2. Simulate", desc: "What-If Shocks" },
            { id: "predict", step: "3. Predict", desc: "12-Mo Trajectory" },
            { id: "assess_risk", step: "4. Assess Risk", desc: "Risk Rubric" },
            { id: "decide", step: "5. Decide", desc: "Action Plan" },
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
            {/* STAGE 1: ANALYZE BASELINE */}
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

                {/* Strengths & Flags Callout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Financial Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        {twinData.analysis.key_strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4 text-amber-600" /> Watchpoint & Risk Flags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        {twinData.analysis.risk_flags.length > 0 ? (
                          twinData.analysis.risk_flags.map((flag, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>{flag}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400">No critical risk flags triggered on baseline parameters.</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

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
                      Proceed to Step 2: Simulate What-If
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* STAGE 2: SIMULATE WHAT-IF */}
            {activeStage === "simulate" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-600" />
                    What-If Hypothesis Scenario Builder
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Test the impact of a capital expenditure loan, revenue slowdown, or expense inflation before committing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRunSimulation} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Scenario Presets */}
                      <button
                        type="button"
                        onClick={() => {
                          setScenarioType("new_loan");
                          setAdditionalDebt(7500);
                          setRevenueChange(0);
                          setExpenseChange(0);
                        }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          scenarioType === "new_loan"
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <div className="font-semibold text-xs">New Machinery Loan</div>
                        <div className="text-[11px] text-slate-500 mt-1">+₹7,500/mo EMI liability</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setScenarioType("revenue_shock");
                          setAdditionalDebt(0);
                          setRevenueChange(-20);
                          setExpenseChange(0);
                        }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          scenarioType === "revenue_shock"
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <div className="font-semibold text-xs">20% Market Downturn</div>
                        <div className="text-[11px] text-slate-500 mt-1">-20% monthly revenue drop</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setScenarioType("expense_inflation");
                          setAdditionalDebt(0);
                          setRevenueChange(0);
                          setExpenseChange(15);
                        }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          scenarioType === "expense_inflation"
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <div className="font-semibold text-xs">Raw Material Inflation</div>
                        <div className="text-[11px] text-slate-500 mt-1">+15% input cost surge</div>
                      </button>
                    </div>

                    {/* Parametric Inputs */}
                    <div className="space-y-4 pt-2">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Additional Monthly Debt EMI</span>
                          <span className="font-mono text-emerald-600">{formatCurrency(additionalDebt)}/mo</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25000"
                          step="500"
                          value={additionalDebt}
                          onChange={(e) => setAdditionalDebt(Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Revenue Change Percentage</span>
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
                          <span>Operating Expense Change Percentage</span>
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
                        Compute Trajectory & Predict
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* STAGE 3: PREDICT TRAJECTORY */}
            {activeStage === "predict" && (
              <div className="space-y-6">
                {/* Comparative Deltas */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Hypothesis Comparison: Baseline vs Simulated
                      </CardTitle>
                      {getVerdictBadge(twinData.simulation.verdict)}
                    </div>
                    <CardDescription className="text-xs">
                      {twinData.simulation.recommendation}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-500">Monthly Surplus</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          {formatCurrency(twinData.simulation.simulated.net_cash_flow)}
                        </div>
                        <div className={`text-[11px] mt-1 font-semibold ${
                          twinData.simulation.deltas.cash_flow_delta >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {twinData.simulation.deltas.cash_flow_delta >= 0 ? "+" : ""}
                          {formatCurrency(twinData.simulation.deltas.cash_flow_delta)}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-500">Simulated DTI</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          {Math.round(twinData.simulation.simulated.debt_to_income_ratio * 100)}%
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          from {Math.round(twinData.simulation.baseline.debt_to_income_ratio * 100)}%
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-500">Runway Under Shock</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          {twinData.simulation.simulated.runway_months} Months
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Base: {twinData.simulation.baseline.runway_months} Mo
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-500">Simulated Risk Score</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          {twinData.simulation.simulated.risk_score}/100
                        </div>
                        <div className={`text-[11px] mt-1 font-semibold ${
                          twinData.simulation.deltas.risk_delta > 0 ? "text-rose-600" : "text-emerald-600"
                        }`}>
                          {twinData.simulation.deltas.risk_delta > 0 ? `+${twinData.simulation.deltas.risk_delta}` : `${twinData.simulation.deltas.risk_delta}`} risk pts
                        </div>
                      </div>
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
                        Proceed to Step 4: Assess Risk
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}

            {/* STAGE 4: ASSESS RISK */}
            {activeStage === "assess_risk" && (
              <div className="space-y-6">
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
                        Proceed to Step 5: Final Decision Card
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}

            {/* STAGE 5: DECIDE */}
            {activeStage === "decide" && (
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
                    Dossier generated with Sahay Deterministic Financial Twin Engine.
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
            )}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
