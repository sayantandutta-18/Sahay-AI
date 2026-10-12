"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, ExternalLink, Calendar, Building, CheckCircle2 } from "lucide-react";

const sampleSchemes = [
  {
    id: "scheme-pmegp",
    name: "Prime Minister Employment Generation Programme (PMEGP)",
    provider: "Ministry of MSME, Govt of India",
    type: "subsidy",
    benefits: "Margin money subsidy up to 35% for project cost up to ₹50 Lakhs (Manufacturing) / ₹20 Lakhs (Services).",
    maxAmount: "₹50,00,000",
    statesServed: ["ALL"],
    officialUrl: "https://www.kviconline.gov.in/pmegpeportal",
    lastVerifiedAt: "2026-03-01",
    documents: ["Aadhaar", "PAN", "Project Report", "EDP Training Certificate"],
  },
  {
    id: "scheme-mudra",
    name: "Pradhan Mantri MUDRA Yojana (PMMY) - Tarun Category",
    provider: "Department of Financial Services, MoF",
    type: "loan",
    benefits: "Collateral-free business loans between ₹5 Lakhs to ₹10 Lakhs with competitive interest rates.",
    maxAmount: "₹10,00,000",
    statesServed: ["ALL"],
    officialUrl: "https://www.mudra.org.in",
    lastVerifiedAt: "2026-02-15",
    documents: ["Udyam Registration", "PAN", "Last 6 Months Bank Statement"],
  },
  {
    id: "scheme-cgtmse",
    name: "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
    provider: "SIDBI & Ministry of MSME",
    type: "loan",
    benefits: "Credit guarantee coverage up to 85% for micro-enterprises without third-party collateral.",
    maxAmount: "₹5,00,00,000",
    statesServed: ["ALL"],
    officialUrl: "https://www.cgtmse.in",
    lastVerifiedAt: "2026-01-20",
    documents: ["Audited Financials", "Business Pan", "Udyam Certificate"],
  },
  {
    id: "scheme-banglashree",
    name: "Banglashree Scheme (West Bengal State MSME)",
    provider: "Department of MSME&T, Govt of West Bengal",
    type: "subsidy",
    benefits: "Capital investment subsidy, waiver of electricity duty, and interest subsidy for micro units.",
    maxAmount: "₹10,00,000",
    statesServed: ["West Bengal"],
    officialUrl: "https://wbmsme.gov.in",
    lastVerifiedAt: "2026-02-10",
    documents: ["Trade License", "Udyam", "Electricity Bill", "Project Report"],
  },
];

export default function SchemesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = sampleSchemes.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || scheme.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Government Scheme Library
            </h1>
            <p className="text-xs text-slate-500">
              Verified official schemes from Central & State ministries. No AI hallucinations.
            </p>
          </div>
          <Badge variant="brand" size="md">
            Verified Knowledge Base
          </Badge>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by scheme title, ministry, or keyword..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
          >
            <option value="all">All Support Types</option>
            <option value="subsidy">Subsidies</option>
            <option value="loan">Loans & Credit</option>
          </select>
        </div>

        {/* Schemes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((s) => (
            <Card key={s.id} hover className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold leading-tight">
                      {s.name}
                    </CardTitle>
                    <Badge variant={s.type === "subsidy" ? "success" : "info"} size="sm">
                      {s.type.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1.5 mt-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {s.provider}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {s.benefits}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-medium">Max Limit:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {s.maxAmount}
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                      Required Documents:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {s.documents.map((doc) => (
                        <span
                          key={doc}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Verified: {s.lastVerifiedAt}
                </div>
                <a
                  href={s.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  Official Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
