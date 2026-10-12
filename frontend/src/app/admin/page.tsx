"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, History, Database, Plus, CheckCircle2 } from "lucide-react";

const auditLogs = [
  {
    id: "audit-1",
    timestamp: "2026-03-12 14:22:10 UTC",
    action: "SCHEME_RULE_UPDATED",
    user: "admin@sahay.gov.in",
    details: "PMEGP Rule Set bumped to v1.4.2 (Updated manufacturing project ceiling to 50 Lakhs)",
  },
  {
    id: "audit-2",
    timestamp: "2026-03-10 09:15:44 UTC",
    action: "SCHEME_VERIFIED",
    user: "compliance@sahay.gov.in",
    details: "Banglashree guidelines reverified against official MSME&T gazette notification",
  },
  {
    id: "audit-3",
    timestamp: "2026-03-08 17:40:02 UTC",
    action: "AUTH_ROLE_ELEVATED",
    user: "superadmin@sahay.gov.in",
    details: "Granted Scheme Auditor privileges to Sayantan Dutta",
  },
];

export default function AdminConsolePage() {
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
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Add New Verified Scheme
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-slate-500 font-medium">Active Scheme Rule Sets</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">18 Production Sets</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">100% Versioned & Audited</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 font-medium">Pending Approvals</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">0 Pending</h3>
            <p className="text-[11px] text-slate-400 mt-1">All live rules approved</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 font-medium">Audit Trail Entries</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">1,429 Logged</h3>
            <p className="text-[11px] text-slate-400 mt-1">Immutable PostgreSQL log</p>
          </Card>
        </div>

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
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {log.action}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200">{log.details}</p>
                  <p className="text-slate-400 text-[10px]">Author: {log.user}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
