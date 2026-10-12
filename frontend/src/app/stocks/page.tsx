"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShieldAlert, TrendingUp, AlertCircle, Clock } from "lucide-react";

export default function StockResearchPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Market Research & Decision Support
          </h1>
          <p className="text-xs text-slate-500">
            Uncertainty-aware analytical tools based on verified corporate fundamentals.
          </p>
        </div>

        {/* Mandatory Regulatory / Compliance Guard */}
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 p-4 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-rose-900 dark:text-rose-200">
              SEBI Compliance & Decision Support Notice:
            </span>{" "}
            Sahay does NOT provide guaranteed returns, tips, or automated execution. All analyses are framed strictly as educational decision-support highlighting valuation risk, leverage, and uncertainty. Real-money broker execution remains disabled pending regulatory certification.
          </div>
        </div>

        {/* Market Data Provider Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Market Data Provider Adapter</CardTitle>
              <Badge variant="warning" size="sm">
                Sandbox Mode (Simulated Adapter)
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1.5 mt-1">
              <Clock className="w-3.5 h-3.5" /> Data timestamps and provider uptime are verified per request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              When live provider credentials are configured in backend environment variables (`MARKET_DATA_PROVIDER_KEY`), real-time BSE/NSE quotes and quarterly filings will be surfaced via the backend provider abstraction. Live orders will never be placed automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
