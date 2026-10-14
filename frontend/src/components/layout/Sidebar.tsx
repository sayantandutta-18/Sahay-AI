"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle2,
  ScrollText,
  CheckCircle,
  FileText,
  FolderLock,
  MessageSquare,
  Calculator,
  GraduationCap,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Sparkles,
  Cpu,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const navSections: { section: string; items: NavItem[] }[] = [
  {
    section: "Core Hub",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Profile & Business", href: "/profile", icon: UserCircle2 },
      { name: "Onboarding Wizard", href: "/onboarding", icon: Sparkles },
    ],
  },
  {
    section: "Government Schemes",
    items: [
      { name: "Scheme Library", href: "/schemes", icon: ScrollText },
      { name: "Eligibility Matches", href: "/matches", icon: CheckCircle },
      { name: "My Applications", href: "/applications", icon: FileText },
      { name: "Document Vault", href: "/documents", icon: FolderLock },
    ],
  },
  {
    section: "Intelligence & Business",
    items: [
      { name: "Financial Digital Twin", href: "/twin", icon: Cpu, tag: "AI Twin" },
      { name: "AI Assistant (RAG)", href: "/chat", icon: MessageSquare },
      { name: "Business Advisor", href: "/business", icon: Calculator },
      { name: "Market Academy", href: "/academy", icon: GraduationCap },
      { name: "Candlestick & Markets", href: "/stocks", icon: TrendingUp, tag: "Charts" },
      { name: "Paper Portfolio", href: "/portfolio", icon: PieChart },
    ],
  },
  {
    section: "System",
    items: [
      { name: "Admin Console", href: "/admin", icon: ShieldCheck, tag: "RBAC" },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden md:block p-4 space-y-6">
      {navSections.map((sec) => (
        <div key={sec.section}>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            {sec.section}
          </p>
          <div className="space-y-0.5">
            {sec.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.tag && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.tag}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
};
