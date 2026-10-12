"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Loading";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getAdminStats, getAdminAuditLogs } from "@/lib/api";
import { AdminStats, AuditLogItem } from "@/types";
import { ShieldCheck, History, Database, Plus, RefreshCw } from "lucide-react";

export default function AdminConsolePage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, logsData] = await Promise.all([
        getAdminStats(),
        getAdminAuditLogs(20),
      ]);
      setStats(statsData);
      setAuditLogs(logsData);
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Administrative privileges required (Role: admin)."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              Administrative Console & Audit Logs
            </h1>
            <p className="text-xs text-slate-500">
              Role-Based Access Control (RBAC) • Manage scheme rules, verification workflows, and auditable history.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAdminData}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Refresh
            </Button>
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add Verified Scheme
            </Button>
          </div>
        </div>

        {error && (
          <ErrorBanner
            title="Access Control Notice"
            message={error}
            onRetry={loadAdminData}
          />
        )}

        {/* Overview Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <p className="text-xs text-slate-500 font-medium">Registered Users</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {stats?.total_users ?? 0}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Active Accounts</p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500 font-medium">Verified Schemes</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {stats?.total_schemes ?? 0}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Versioned & Audited</p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500 font-medium">Total Applications</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {stats?.total_applications ?? 0}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Checklists Active</p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500 font-medium">Audit Events</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {stats?.total_audit_events ?? 0}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Immutable Log Records</p>
            </Card>
          </div>
        )}

        {/* Audit Log Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" /> System Action Audit Log
              </CardTitle>
              <Badge variant="neutral" size="sm">Immutable Ledger</Badge>
            </div>
            <CardDescription>
              All administrative modifications to eligibility logic and scheme definitions are tracked here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No administrative events recorded in audit log yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                        {log.action}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200">{log.details}</p>
                    <p className="text-slate-400 text-[10px]">
                      Resource: {log.resource_type}:{log.resource_id} • IP: {log.ip_address}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
