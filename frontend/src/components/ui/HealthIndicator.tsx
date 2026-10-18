"use client";

import React, { useEffect, useState } from "react";
import { checkApiConnectivity, API_BASE_URL } from "@/lib/api";
import { HealthResponse } from "@/types";
import { CheckCircle2, XCircle, RefreshCw, Database, Server, Clock, AlertCircle } from "lucide-react";
import { Badge } from "./Badge";

export const HealthIndicator: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [isWakingUp, setIsWakingUp] = useState<boolean>(false);
  const [latency, setLatency] = useState<number>(0);
  const [data, setData] = useState<HealthResponse | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const performHealthCheck = async () => {
    setLoading(true);
    const result = await checkApiConnectivity();
    setConnected(result.connected);
    setIsWakingUp(result.isWakingUp ?? false);
    setLatency(result.latencyMs);
    setData(result.data);
    setError(result.error);
    setLoading(false);
  };

  useEffect(() => {
    performHealthCheck();
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                connected ? "bg-emerald-400" : isWakingUp ? "bg-amber-400" : "bg-rose-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                connected ? "bg-emerald-500" : isWakingUp ? "bg-amber-500" : "bg-rose-500"
              }`}
            />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            Backend Health
          </span>
          <Badge
            variant={connected ? "success" : isWakingUp ? "warning" : "danger"}
            size="sm"
          >
            {connected ? "Connected" : isWakingUp ? "Waking Up..." : "Disconnected"}
          </Badge>
        </div>

        <button
          onClick={performHealthCheck}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Checking..." : "Re-test"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Server className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="truncate">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">API URL</p>
            <p className="font-mono text-slate-800 dark:text-slate-200 truncate">{API_BASE_URL}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Database className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Database</p>
            <p className="font-medium flex items-center gap-1">
              {connected && data?.database?.status === "connected" ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Connected
                    {data.database.dialect && (
                      <span className="ml-1 text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                        {data.database.dialect}
                      </span>
                    )}
                    {data.database.journal_mode && (
                      <span className="ml-1 text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300">
                        {data.database.journal_mode}
                      </span>
                    )}
                    {typeof data.database.table_count === "number" && (
                      <span className="ml-1 text-[11px] text-slate-500 font-normal">
                        ({data.database.table_count} tables)
                      </span>
                    )}
                  </span>
                </span>
              ) : connected && data?.database?.status !== "connected" ? (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Disconnected
                  {data?.database?.error && (
                    <span className="ml-1 text-[10px] text-rose-500 font-mono truncate max-w-[120px]">
                      ({data.database.error})
                    </span>
                  )}
                </span>
              ) : isWakingUp ? (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-pulse" /> Awaiting Server Spin-Up
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" /> Unavailable (API Offline)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Latency</p>
            <p className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {latency > 0 ? `${latency} ms` : "---"}
            </p>
          </div>
        </div>
      </div>

      {isWakingUp && (
        <div className="mt-3 rounded-md bg-amber-50 dark:bg-amber-950/40 p-2.5 text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />
          <div>
            <p className="font-semibold">Backend Instance Starting (Render Free Tier):</p>
            <p className="text-[11px] mt-0.5">
              Render automatically sleeps free instances after inactivity. The server is warming up and will respond in ~20–30 seconds. Click &ldquo;Re-test&rdquo; to refresh.
            </p>
          </div>
        </div>
      )}

      {error && !isWakingUp && (
        <div className="mt-3 rounded-md bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
          <p className="font-semibold flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            Connection Diagnostics:
          </p>
          <p className="font-mono text-[11px] mt-1 text-rose-600 dark:text-rose-300">{error}</p>
          {error.includes("Failed to fetch") && (
            <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-400">
              Note: In modern browsers, &ldquo;Failed to fetch&rdquo; typically indicates a network timeout, unreachable server, or a CORS origin rejection.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
