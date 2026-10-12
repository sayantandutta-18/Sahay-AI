"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = true,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {showSidebar && <Sidebar />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
