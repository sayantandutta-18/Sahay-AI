"use client";

import React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { HealthIndicator } from "@/components/ui/HealthIndicator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ScrollText,
  FileText,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Calculator,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Enterprise Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Welcome back, Ramesh Sharma • Sharma Agro Handicrafts (Kolkata, WB)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/matches">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                Run Scheme Matcher
              </Button>
            </Link>
          </div>
        </div>

        {/* Live System Connectivity & Health Status */}
        <HealthIndicator />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Eligible Schemes</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4 Active</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ScrollText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-3 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> High match with PMEGP & CGTMSE
            </p>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Applications</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">2 Pending</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-3 font-medium">
              1 Document awaiting verification
            </p>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Documents Uploaded</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">5 Verified</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Udyam, PAN, Bank Statements valid
            </p>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Market Academy</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Level 2</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-3 font-medium">
              3/8 Lessons Completed
            </p>
          </Card>
        </div>

        {/* Quick Module Launchers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-emerald-600" />
                  Government Scheme Matches
                </CardTitle>
                <Link href="/schemes" className="text-xs text-emerald-600 hover:underline">
                  View All
                </Link>
              </div>
              <CardDescription>
                Auditable deterministic eligibility evaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    PMEGP (Prime Minister Employment Generation)
                  </h4>
                  <p className="text-xs text-slate-500">Up to 35% subsidy on ₹25 Lakhs project</p>
                </div>
                <Badge variant="success">95% Fit</Badge>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Pradhan Mantri Mudra Yojana (Tarun)
                  </h4>
                  <p className="text-xs text-slate-500">Collateral-free credit up to ₹10 Lakhs</p>
                </div>
                <Badge variant="success">90% Fit</Badge>
              </div>

              <div className="pt-2">
                <Link href="/matches">
                  <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View Detailed Match Reasons & Missing Documents
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  AI Decision Support & Assistant
                </CardTitle>
                <Badge variant="brand" size="sm">RAG Grounded</Badge>
              </div>
              <CardDescription>
                Ask questions in English, Hindi, or Bengali grounded in verified government data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                  💡 Prompt Suggestions:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>&quot;How do I get an Udyam certificate for my workshop?&quot;</li>
                  <li>&quot;What subsidy rate applies to rural manufacturing in WB?&quot;</li>
                  <li>&quot;Calculate my monthly EMI for a 5-year ₹5 Lakh loan at 9%&quot;</li>
                </ul>
              </div>

              <div className="pt-2 flex gap-2">
                <Link href="/chat" className="flex-1">
                  <Button size="sm" className="w-full" leftIcon={<MessageSquare className="w-4 h-4" />}>
                    Open AI Chat
                  </Button>
                </Link>
                <Link href="/business" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full" leftIcon={<Calculator className="w-4 h-4" />}>
                    Business Tools
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance & Safety Guarantee Notice */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-start gap-3 text-xs text-slate-500">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Sahay Deterministic Authority Guarantee:
            </span>{" "}
            All government eligibility criteria and financial math are computed by deterministic backend services using verified official rules. The AI explainer provides plain-language assistance but cannot override eligibility or invent government policies.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
