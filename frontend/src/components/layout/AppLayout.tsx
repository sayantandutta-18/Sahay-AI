"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useLanguage } from "@/lib/i18n";

export interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = true,
}) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-semibold text-xs transition-all"
      >
        {t.a11y?.skipToContent || "Skip to main content"}
      </a>

      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {showSidebar && <Sidebar />}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto focus:outline-hidden"
        >
          {children}
        </main>
      </div>
    </div>
  );
};
