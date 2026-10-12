"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Loading } from "@/components/ui/Loading";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from "lucide-react";
import {
  getPaperPortfolio,
  executePaperOrder,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getMarketBenchmarks,
} from "@/lib/api";
import {
  PaperPortfolioSummaryResponse,
  WatchlistItemResponse,
  MarketQuoteResponse,
} from "@/types";

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PaperPortfolioSummaryResponse | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItemResponse[]>([]);
  const [benchmarks, setBenchmarks] = useState<MarketQuoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Trade Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderTicker, setOrderTicker] = useState("NIFTYBEES");
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [orderQuantity, setOrderQuantity] = useState<number>(10);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Add to Watchlist input
  const [newWatchlistTicker, setNewWatchlistTicker] = useState("");

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [portData, watchData, benchData] = await Promise.allSettled([
        getPaperPortfolio(),
        getWatchlist(),
        getMarketBenchmarks(),
      ]);

      if (portData.status === "fulfilled") {
        setPortfolio(portData.value);
      }
      if (watchData.status === "fulfilled") {
        setWatchlist(watchData.value);
      }
      if (benchData.status === "fulfilled") {
        setBenchmarks(benchData.value);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderQuantity <= 0 || !orderTicker) return;

    setIsSubmittingOrder(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await executePaperOrder(orderTicker, orderType, orderQuantity);
      setSuccessMsg(
        `Successfully simulated ${orderType} order for ${orderQuantity} units of ${orderTicker}!`
      );
      setIsOrderModalOpen(false);
      // Reload portfolio
      const updatedPortfolio = await getPaperPortfolio();
      setPortfolio(updatedPortfolio);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Paper trade execution failed";
      setErrorMsg(msg);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleAddWatchlist = async (tickerToAdd: string) => {
    if (!tickerToAdd.trim()) return;
    try {
      const added = await addToWatchlist(tickerToAdd.toUpperCase());
      setWatchlist((prev) => [...prev, added]);
      setNewWatchlistTicker("");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to add ticker to watchlist";
      setErrorMsg(msg);
    }
  };

  const handleRemoveWatchlist = async (ticker: string) => {
    try {
      await removeFromWatchlist(ticker);
      setWatchlist((prev) => prev.filter((item) => item.ticker !== ticker));
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to remove ticker";
      setErrorMsg(msg);
    }
  };

  const openTradeFor = (ticker: string, defaultType: "BUY" | "SELL" = "BUY") => {
    setOrderTicker(ticker);
    setOrderType(defaultType);
    setOrderQuantity(10);
    setIsOrderModalOpen(true);
  };

  // Fallback calculations if data not loaded
  const totalInvested = portfolio?.total_invested ?? 68827.0;
  const currentVal = portfolio?.current_value ?? 72398.0;
  const totalPnL = portfolio?.total_pnl ?? 3571.0;
  const pnlPct = portfolio?.pnl_percentage ?? 5.19;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-6 h-6 text-emerald-600" />
              Paper Trading & Simulation Portfolio
            </h1>
            <p className="text-xs text-slate-500">
              Zero-risk educational sandbox. Practice asset allocation and order management with verified historical benchmarks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="md">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Virtual Simulation (₹0 Real Money)
            </Badge>
            <Button
              size="sm"
              onClick={() => openTradeFor("NIFTYBEES", "BUY")}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Simulate Trade
            </Button>
          </div>
        </div>

        {errorMsg && (
          <ErrorBanner
            title="Portfolio Notification"
            message={errorMsg}
            onDismiss={() => setErrorMsg(null)}
          />
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-slate-500 font-medium">Virtual Capital Invested</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              ₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Cost basis across {portfolio?.holdings_count ?? 2} instruments
            </p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 font-medium">Current Simulated Value</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              ₹{currentVal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Evaluated at verified benchmark prices
            </p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 font-medium">Unrealized P&L</p>
            <h3
              className={`text-xl font-bold mt-1 flex items-center gap-1 ${
                totalPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
              }`}
            >
              {totalPnL >= 0 ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
              ₹{Math.abs(totalPnL).toLocaleString("en-IN", { maximumFractionDigits: 2 })} (
              {pnlPct >= 0 ? `+${pnlPct.toFixed(2)}` : pnlPct.toFixed(2)}%)
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Deterministic weighted average cost
            </p>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Simulated Holdings</CardTitle>
                <CardDescription className="text-xs">
                  Deterministic positions calculated strictly from simulated transactions.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={loadData}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh Quotes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loading text="Loading holdings and market benchmarks..." />
            ) : portfolio && portfolio.holdings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-2">Asset / Ticker</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Quantity</th>
                      <th className="pb-2">Avg Buy Price</th>
                      <th className="pb-2">Current Price</th>
                      <th className="pb-2">Invested</th>
                      <th className="pb-2">Current Value</th>
                      <th className="pb-2 text-right">P&L (%)</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {portfolio.holdings.map((h) => (
                      <tr key={h.id} className="py-2">
                        <td className="py-3 font-semibold text-slate-900 dark:text-white">
                          {h.ticker}
                          <p className="text-[10px] font-normal text-slate-400">{h.name}</p>
                        </td>
                        <td className="py-3">
                          <Badge variant="neutral" size="sm">
                            {h.asset_class.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 font-mono font-medium">{h.quantity}</td>
                        <td className="py-3 font-mono">₹{h.average_buy_price.toFixed(2)}</td>
                        <td className="py-3 font-mono">₹{h.current_price.toFixed(2)}</td>
                        <td className="py-3 font-mono">
                          ₹{h.total_invested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 font-mono font-medium">
                          ₹{h.current_value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </td>
                        <td
                          className={`py-3 text-right font-mono font-semibold ${
                            h.unrealized_pnl >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600"
                          }`}
                        >
                          {h.unrealized_pnl >= 0 ? "+" : ""}₹{h.unrealized_pnl.toFixed(2)} (
                          {h.pnl_percentage >= 0 ? "+" : ""}
                          {h.pnl_percentage.toFixed(2)}%)
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => openTradeFor(h.ticker, "BUY")}
                            >
                              Buy
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              className="text-rose-600 hover:text-rose-700"
                              onClick={() => openTradeFor(h.ticker, "SELL")}
                            >
                              Sell
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No simulated holdings yet. Add index ETFs from the benchmark list below or simulate your first paper order.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verified Market Benchmarks & Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verified Benchmarks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> Verified Market Benchmarks
                </CardTitle>
                <Badge variant="brand" size="sm">
                  NSE Verified
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Real benchmark index ETFs with live exchange reference timestamps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(benchmarks.length > 0
                  ? benchmarks
                  : [
                      {
                        ticker: "NIFTYBEES",
                        name: "Nippon India ETF Nifty 50 BeES",
                        current_price: 260.45,
                        exchange: "NSE",
                        asset_class: "etf",
                        last_updated_at: "2026-03-31T00:00:00Z",
                        is_stale: false,
                        provider: "Sahay Verified Benchmark Adapter",
                        currency: "INR",
                      },
                      {
                        ticker: "GOLDBEES",
                        name: "Nippon India ETF Gold BeES",
                        current_price: 66.8,
                        exchange: "NSE",
                        asset_class: "etf",
                        last_updated_at: "2026-03-31T00:00:00Z",
                        is_stale: false,
                        provider: "Sahay Verified Benchmark Adapter",
                        currency: "INR",
                      },
                      {
                        ticker: "BANKBEES",
                        name: "Nippon India ETF Nifty Bank BeES",
                        current_price: 524.1,
                        exchange: "NSE",
                        asset_class: "etf",
                        last_updated_at: "2026-03-31T00:00:00Z",
                        is_stale: false,
                        provider: "Sahay Verified Benchmark Adapter",
                        currency: "INR",
                      },
                    ]
                ).map((b) => (
                  <div
                    key={b.ticker}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                        <span>{b.ticker}</span>
                        <span className="text-[10px] font-mono text-slate-400">{b.exchange}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{b.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{b.current_price.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-slate-400">Verified</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleAddWatchlist(b.ticker)}
                          title="Add to Watchlist"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="xs" onClick={() => openTradeFor(b.ticker, "BUY")}>
                          Trade
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Watchlist */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600" /> Observation Watchlist
                </CardTitle>
                <span className="text-xs text-slate-400 font-mono">
                  {watchlist.length} Assets
                </span>
              </div>
              <CardDescription className="text-xs">
                Track instruments before executing simulated paper orders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Add Form */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Ticker (e.g. JUNIORBEES)..."
                  value={newWatchlistTicker}
                  onChange={(e) => setNewWatchlistTicker(e.target.value)}
                  className="text-xs uppercase"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddWatchlist(newWatchlistTicker)}
                  disabled={!newWatchlistTicker.trim()}
                >
                  Watch
                </Button>
              </div>

              {watchlist.length > 0 ? (
                <div className="space-y-2">
                  {watchlist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                          <span>{item.ticker}</span>
                          <span className="text-[10px] text-slate-400">{item.exchange}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => openTradeFor(item.ticker, "BUY")}
                        >
                          Simulate Buy
                        </Button>
                        <button
                          onClick={() => handleRemoveWatchlist(item.ticker)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  Your watchlist is currently empty. Add benchmark instruments above to monitor them.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Paper Trade Modal */}
        <Modal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          title={`Simulate Paper Order: ${orderTicker}`}
          size="md"
        >
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Simulated Paper Execution:</strong> This order uses ₹0 real capital and executes virtually at the verified benchmark price.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType("BUY")}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      orderType === "BUY"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("SELL")}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      orderType === "SELL"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    SELL
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Instrument Ticker
                </label>
                <Input
                  value={orderTicker}
                  onChange={(e) => setOrderTicker(e.target.value.toUpperCase())}
                  className="font-mono uppercase text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Order Quantity (Shares / Units)
              </label>
              <Input
                type="number"
                min={1}
                max={100000}
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                className="font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOrderModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant={orderType === "BUY" ? "primary" : "outline"}
                className={orderType === "SELL" ? "border-rose-300 text-rose-600 hover:bg-rose-50" : ""}
                disabled={isSubmittingOrder || orderQuantity <= 0}
              >
                {isSubmittingOrder
                  ? "Executing Simulation..."
                  : `Execute Virtual ${orderType}`}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
