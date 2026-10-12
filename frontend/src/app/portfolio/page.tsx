"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PieChart, TrendingUp, ShieldCheck } from "lucide-react";

const paperHoldings = [
  {
    ticker: "NIFTYBEES",
    name: "Nippon India ETF Nifty 50 BeES",
    qty: 250,
    avgPrice: 245.5,
    currentPrice: 258.2,
    assetClass: "Index ETF",
  },
  {
    ticker: "GOLDBEES",
    name: "Nippon India ETF Gold BeES",
    qty: 120,
    avgPrice: 62.1,
    currentPrice: 65.4,
    assetClass: "Commodity ETF",
  },
];

export default function PortfolioPage() {
  const totalInvested = paperHoldings.reduce(
    (acc, h) => acc + h.qty * h.avgPrice,
    0
  );
  const totalCurrentValue = paperHoldings.reduce(
    (acc, h) => acc + h.qty * h.currentPrice,
    0
  );
  const totalPnL = totalCurrentValue - totalInvested;
  const pnlPercentage = (totalPnL / totalInvested) * 100;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-6 h-6 text-emerald-600" />
              Paper Trading & Simulation Portfolio
            </h1>
            <p className="text-xs text-slate-500">
              Zero-risk learning sandbox. Test allocation strategies without real money.
            </p>
          </div>
          <Badge variant="brand" size="md">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Virtual Simulation (₹0 Real Money)
          </Badge>
        </div>

        {/* Portfolio Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-slate-500 font-medium">Virtual Capital Invested</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              ₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </h3>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 font-medium">Current Simulated Value</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              ₹{totalCurrentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </h3>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 font-medium">Unrealized P&L</p>
            <h3
              className={`text-xl font-bold mt-1 flex items-center gap-1 ${
                totalPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              ₹{totalPnL.toLocaleString("en-IN", { maximumFractionDigits: 2 })} (
              {pnlPercentage.toFixed(2)}%)
            </h3>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Simulated Holdings</CardTitle>
            <CardDescription>
              Deterministic calculations based on benchmark historical indices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-2">Asset / Ticker</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Quantity</th>
                    <th className="pb-2">Avg Buy Price</th>
                    <th className="pb-2">Last Price</th>
                    <th className="pb-2 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paperHoldings.map((h) => {
                    const holdingPnL = (h.currentPrice - h.avgPrice) * h.qty;
                    return (
                      <tr key={h.ticker} className="py-2">
                        <td className="py-3 font-semibold text-slate-900 dark:text-white">
                          {h.ticker}
                          <p className="text-[10px] font-normal text-slate-400">{h.name}</p>
                        </td>
                        <td className="py-3">
                          <Badge variant="neutral" size="sm">{h.assetClass}</Badge>
                        </td>
                        <td className="py-3 font-mono">{h.qty}</td>
                        <td className="py-3 font-mono">₹{h.avgPrice.toFixed(2)}</td>
                        <td className="py-3 font-mono">₹{h.currentPrice.toFixed(2)}</td>
                        <td
                          className={`py-3 text-right font-mono font-semibold ${
                            holdingPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                          }`}
                        >
                          +₹{holdingPnL.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
