"use client";

import React, { useEffect, useState } from "react";
import { checkApiConnectivity, API_BASE_URL } from "@/lib/api";
import { HealthResponse } from "@/types";
import { CheckCircle2, XCircle, RefreshCw, Database, Server, Clock } from "lucide-react";
import { Badge } from "./Badge";

export const HealthIndicator: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [latency, setLatency] = useState<number>(0);
  const [data, setData] = useState<HealthResponse | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const performHealthCheck = async () => {
    setLoading(true);
    const result = await checkApiConnectivity();
    setConnected(result.connected);
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
                connected ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                connected ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            Backend Health
          </span>
          <Badge variant={connected ? "success" : "danger"} size="sm">
            {connected ? "Connected" : "Disconnected"}
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
              {data?.database.status === "connected" ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Connected
                    {data.database.dialect && (
                      <span className="ml-1 text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                        {data.database.dialect}
                      </span>
                    )}
                    {typeof data.database.table_count === "number" && (
                      <span className="ml-1 text-[11px] text-slate-500 font-normal">
                        ({data.database.table_count} tables)
                      </span>
                    )}
                  </span>
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Disconnected
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

      {error && (
        <div className="mt-3 rounded-md bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs text-rose-700 dark:text-rose-300">
          <p className="font-medium">Connection Error:</p>
          <p className="font-mono text-[11px] mt-0.5">{error}</p>
        </div>
      )}
    </div>
  );
};
