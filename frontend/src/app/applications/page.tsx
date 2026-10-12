"use client";

import React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Clock, CheckCircle2, ChevronRight, Lock } from "lucide-react";

const applications = [
  {
    id: "app-101",
    schemeName: "Prime Minister Employment Generation Programme (PMEGP)",
    status: "in_progress",
    statusBadge: "warning",
    statusLabel: "In Progress (65%)",
    timeline: [
      { step: "Eligibility Verified", done: true },
      { step: "Document Checklist", done: true },
      { step: "Project Report DPR Upload", done: false },
      { step: "Bank Submission Consent", done: false },
    ],
    lastUpdate: "Yesterday, 4:30 PM",
  },
  {
    id: "app-102",
    schemeName: "Pradhan Mantri MUDRA Yojana - Tarun",
    status: "submitted",
    statusBadge: "info",
    statusLabel: "Submitted to Nodal Agency",
    timeline: [
      { step: "Eligibility Verified", done: true },
      { step: "Document Checklist", done: true },
      { step: "Application Finalized", done: true },
      { step: "Lender Verification Underway", done: false },
    ],
    lastUpdate: "3 days ago",
  },
];

export default function ApplicationsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Application Tracker
            </h1>
            <p className="text-xs text-slate-500">
              Track multi-stage government scheme submissions and document checklists.
            </p>
          </div>
          <Link href="/matches">
            <Button size="sm">Apply for New Scheme</Button>
          </Link>
        </div>

        {/* Consent Notice */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
          <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">
              Granular & Revocable Data Sharing Consent:
            </span>{" "}
            Before any scheme dossier or profile data is transmitted to an empanelled lender, Sahay requires your explicit digital consent showing the exact data fields transmitted.
          </div>
        </div>

        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base">{app.schemeName}</CardTitle>
                  <Badge variant={app.statusBadge as "warning" | "info"} size="md">
                    {app.statusLabel}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5" /> Updated: {app.lastUpdate}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                  {app.timeline.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                        step.done
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          step.done ? "text-emerald-600" : "text-slate-300"
                        }`}
                      />
                      <span className="truncate">{step.step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Link href="/documents" className="text-xs text-emerald-600 hover:underline">
                  Manage Attached Documents
                </Link>
                <Button size="sm" variant="outline" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Continue Checklist
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
