"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calculator, DollarSign, PieChart, TrendingUp, CheckCircle2 } from "lucide-react";

export default function BusinessAdvisorPage() {
  // EMI Calculator state
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [tenureYears, setTenureYears] = useState<number>(5);

  // Pricing Advisor state
  const [unitCost, setUnitCost] = useState<number>(120);
  const [targetMarginPct, setTargetMarginPct] = useState<number>(25);

  // EMI Math (Deterministic)
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const emi =
    loanAmount && interestRate && tenureYears
      ? Math.round(
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : 0;
  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  // Pricing Math (Deterministic)
  const suggestedSellingPrice =
    targetMarginPct < 100
      ? Math.round(unitCost / (1 - targetMarginPct / 100))
      : unitCost;
  const grossProfitPerUnit = suggestedSellingPrice - unitCost;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Micro-Enterprise Business Advisor
          </h1>
          <p className="text-xs text-slate-500">
            Deterministic financial calculators and bookkeeping decision support for entrepreneurs.
          </p>
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
                <Badge variant="brand" size="sm">Deterministic</Badge>
              </div>
              <CardDescription>
                Calculate monthly installment and total borrowing cost accurately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Loan (₹)"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                />
                <Input
                  label="Annual Rate (%)"
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

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Monthly EMI</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{emi.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Total Interest Payable</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    ₹{totalInterest.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Total Loan Outflow</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    ₹{totalPayment.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Advisor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Product Pricing & Margin Advisor
                </CardTitle>
                <Badge variant="brand" size="sm">Cost-Plus Margin</Badge>
              </div>
              <CardDescription>
                Determine optimal wholesale and retail prices based on product unit economics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Unit Production Cost (₹)"
                  type="number"
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value))}
                />
                <Input
                  label="Target Margin (%)"
                  type="number"
                  value={targetMarginPct}
                  onChange={(e) => setTargetMarginPct(Number(e.target.value))}
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Suggested Selling Price</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{suggestedSellingPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Gross Margin per Unit</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    ₹{grossProfitPerUnit.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Effective Markup Ratio</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {((grossProfitPerUnit / (unitCost || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
