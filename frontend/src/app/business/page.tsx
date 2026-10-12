"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { calculateEmi, calculatePricing, calculateCashFlow } from "@/lib/api";
import {
  EmiCalculationResult,
  PricingCalculationResult,
  CashFlowCalculationResult,
} from "@/types";
import { Calculator, DollarSign, Activity, ShieldCheck } from "lucide-react";

export default function BusinessAdvisorPage() {
  // EMI state
  const [loanPrincipal, setLoanPrincipal] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [emiResult, setEmiResult] = useState<EmiCalculationResult | null>(null);

  // Pricing state
  const [unitCost, setUnitCost] = useState<number>(120);
  const [targetMargin, setTargetMargin] = useState<number>(25);
  const [overhead, setOverhead] = useState<number>(20000);
  const [pricingResult, setPricingResult] = useState<PricingCalculationResult | null>(null);

  // Cash Flow state
  const [revenue, setRevenue] = useState<number>(125000);
  const [expense, setExpense] = useState<number>(75000);
  const [existingEmi, setExistingEmi] = useState<number>(12000);
  const [cashFlowResult, setCashFlowResult] = useState<CashFlowCalculationResult | null>(null);

  // Synchronize EMI calculation with backend
  useEffect(() => {
    if (loanPrincipal > 0 && interestRate >= 0 && tenureYears > 0) {
      calculateEmi({
        principal: loanPrincipal,
        annual_interest_rate: interestRate,
        tenure_months: tenureYears * 12,
      })
        .then(setEmiResult)
        .catch(() => {});
    }
  }, [loanPrincipal, interestRate, tenureYears]);

  // Synchronize Pricing calculation with backend
  useEffect(() => {
    if (unitCost > 0 && targetMargin >= 0 && targetMargin < 100) {
      calculatePricing({
        unit_cost: unitCost,
        target_margin_pct: targetMargin,
        packaging_logistics_cost: 0,
        fixed_overhead_monthly: overhead,
      })
        .then(setPricingResult)
        .catch(() => {});
    }
  }, [unitCost, targetMargin, overhead]);

  // Synchronize Cash Flow evaluation with backend
  useEffect(() => {
    if (revenue >= 0 && expense >= 0) {
      calculateCashFlow({
        monthly_revenue: revenue,
        monthly_expense: expense,
        existing_debt_emi: existingEmi,
      })
        .then(setCashFlowResult)
        .catch(() => {});
    }
  }, [revenue, expense, existingEmi]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Micro-Enterprise Business Advisor
            </h1>
            <p className="text-xs text-slate-500">
              Deterministic financial calculations backed by Python services. AI explains results without modifying math.
            </p>
          </div>
          <Badge variant="brand" size="md">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Auditable Algorithms
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EMI Calculator */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                  Loan & Mudra EMI Calculator
                </CardTitle>
                <Badge variant="neutral" size="sm">Reducing Balance</Badge>
              </div>
              <CardDescription>
                Accurate monthly installment, interest outflow, and repayment breakdown.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Loan Amount (₹)"
                  type="number"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                />
                <Input
                  label="Rate (% p.a.)"
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                />
                <Input
                  label="Tenure (Years)"
                  type="number"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                />
              </div>

              {emiResult && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Monthly Installment (EMI)</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{emiResult.monthly_emi.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Interest Payable</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ₹{emiResult.total_interest.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Payment (P + I)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ₹{emiResult.total_payment.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 font-mono">
                    {emiResult.authority}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Advisor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Product Pricing & Break-Even Advisor
                </CardTitle>
                <Badge variant="neutral" size="sm">Cost-Plus</Badge>
              </div>
              <CardDescription>
                Suggested selling price, unit margin, markup %, and minimum break-even sales.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Unit Cost (₹)"
                  type="number"
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value))}
                />
                <Input
                  label="Target Margin (%)"
                  type="number"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                />
                <Input
                  label="Monthly Rent (₹)"
                  type="number"
                  value={overhead}
                  onChange={(e) => setOverhead(Number(e.target.value))}
                />
              </div>

              {pricingResult && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Suggested Selling Price</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{pricingResult.suggested_selling_price.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Gross Profit / Unit</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ₹{pricingResult.gross_profit_per_unit.toLocaleString("en-IN")} ({pricingResult.markup_percentage}% markup)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Monthly Break-Even Volume</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {pricingResult.monthly_break_even_units.toLocaleString("en-IN")} units
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 font-mono">
                    {pricingResult.authority}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Cash Flow & Solvency Scorecard */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Enterprise Solvency & Cash Flow Scorecard
              </CardTitle>
              {cashFlowResult && (
                <Badge
                  variant={
                    cashFlowResult.business_health_grade.includes("Grade A")
                      ? "success"
                      : cashFlowResult.business_health_grade.includes("Grade B")
                      ? "info"
                      : "warning"
                  }
                  size="md"
                >
                  {cashFlowResult.business_health_grade}
                </Badge>
              )}
            </div>
            <CardDescription>
              Evaluate operational surplus, Debt Service Coverage Ratio (DSCR), and readiness for new bank financing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Monthly Receipts / Sales (₹)"
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
              />
              <Input
                label="Monthly Operating Cost (₹)"
                type="number"
                value={expense}
                onChange={(e) => setExpense(Number(e.target.value))}
              />
              <Input
                label="Current Loan Repayments (₹)"
                type="number"
                value={existingEmi}
                onChange={(e) => setExistingEmi(Number(e.target.value))}
              />
            </div>

            {cashFlowResult && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <p className="text-slate-400">Net Monthly Surplus</p>
                  <p className={`text-base font-bold mt-0.5 ${
                    cashFlowResult.net_surplus_after_debt >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                  }`}>
                    ₹{cashFlowResult.net_surplus_after_debt.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Operating Margin</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {cashFlowResult.operating_margin_percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Debt Coverage (DSCR)</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {cashFlowResult.debt_service_coverage_ratio}x
                  </p>
                </div>
              </div>
            )}

            {cashFlowResult && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">Recommendation:</span>{" "}
                {cashFlowResult.recommendation}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
