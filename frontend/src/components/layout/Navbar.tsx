"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Globe, Menu, X, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SupportedLanguage, getStoredLanguage, setStoredLanguage } from "@/lib/i18n";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>("en");

  useEffect(() => {
    setSelectedLang(getStoredLanguage());
    const onLangChange = () => setSelectedLang(getStoredLanguage());
    window.addEventListener("languagechange", onLangChange);
    return () => window.removeEventListener("languagechange", onLangChange);
  }, []);

  const handleLangChange = (code: SupportedLanguage) => {
    setSelectedLang(code);
    setStoredLanguage(code);
  };

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "bn", label: "বাংলা" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                SAHAY
              </span>
              <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                सहाय
              </span>
            </div>
          </Link>
          <Badge variant="brand" size="sm" className="hidden sm:inline-flex">
            Micro-Enterprise AI
          </Badge>
        </div>

        {/* Right side navigation & Language Selector */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLangChange(lang.code)}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedLang === lang.code
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            Dashboard
          </Link>

          <Link
            href="/admin"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Dashboard
          </Link>
          <Link
            href="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Schemes
          </Link>
          <Link
            href="/business"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Business Tools
          </Link>
          <Link
            href="/academy"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Market Academy
          </Link>
        </div>
      )}
    </header>
  );
};
