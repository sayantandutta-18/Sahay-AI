"use client";

import React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GraduationCap, BookOpen, CheckCircle, Award, ArrowRight } from "lucide-react";

const academyModules = [
  {
    id: "mod-1",
    level: "Beginner",
    title: "Foundations of Financial Markets & Inflation",
    description: "Understand why inflation erodes savings, how equities protect purchasing power, and difference between debt and equity.",
    lessonsCount: 5,
    completed: 5,
    status: "Completed",
  },
  {
    id: "mod-2",
    level: "Beginner",
    title: "Mutual Funds, ETFs & Index Investing",
    description: "Low-cost index investing (Nifty 50), diversified mutual funds, expense ratios, and Systematic Investment Plans (SIP).",
    lessonsCount: 4,
    completed: 3,
    status: "In Progress",
  },
  {
    id: "mod-3",
    level: "Intermediate",
    title: "Financial Statements & Valuation Ratios",
    description: "Learn how to read a balance sheet, understanding P/E (Price to Earnings), P/B, EPS, Return on Equity (ROE), and operating cash flows.",
    lessonsCount: 6,
    completed: 0,
    status: "Locked",
  },
  {
    id: "mod-4",
    level: "Advanced",
    title: "Risk Management, Asset Allocation & Portfolio Hedging",
    description: "Capital preservation techniques, emergency liquidity funds, diversification across non-correlated asset classes.",
    lessonsCount: 4,
    completed: 0,
    status: "Locked",
  },
];

export default function AcademyPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-purple-600" />
              Stock Market Academy
            </h1>
            <p className="text-xs text-slate-500">
              Structured financial education for entrepreneurs. Educational content kept strictly separate from personalized recommendations.
            </p>
          </div>
          <Link href="/portfolio">
            <Button size="sm" variant="outline" className="border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300">
              Open Paper Portfolio
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {academyModules.map((m) => (
            <Card key={m.id} hover className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        m.level === "Beginner"
                          ? "success"
                          : m.level === "Intermediate"
                          ? "info"
                          : "warning"
                      }
                      size="sm"
                    >
                      {m.level}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      {m.completed}/{m.lessonsCount} Lessons
                    </span>
                  </div>
                  <CardTitle className="text-base mt-2">{m.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {m.description}
                  </CardDescription>
                </CardHeader>
              </div>

              <CardFooter>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>{m.status}</span>
                </div>
                <Button
                  size="sm"
                  variant={m.status === "Completed" ? "outline" : "primary"}
                  disabled={m.status === "Locked"}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {m.status === "Completed" ? "Review Quiz" : m.status === "Locked" ? "Locked" : "Continue Lesson"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
