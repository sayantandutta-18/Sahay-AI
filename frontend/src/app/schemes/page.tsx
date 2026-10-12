"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getSchemes } from "@/lib/api";
import { Scheme } from "@/types";
import { Search, ExternalLink, Calendar, Building, CheckCircle2 } from "lucide-react";

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const loadSchemes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSchemes({
        scheme_type: typeFilter,
        search: searchTerm,
      });
      setSchemes(data);
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to load government scheme library."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSchemes();
  };

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
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by scheme title, ministry, or keyword (press Enter)..."
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
        </form>

        {error && (
          <ErrorBanner
            title="Failed to Load Schemes"
            message={error}
            onRetry={loadSchemes}
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : schemes.length === 0 ? (
          <Empty
            title="No Matching Schemes Found"
            description="Try clearing your search keyword or switching the support type filter."
            actionLabel="Reset Search"
            onAction={() => {
              setSearchTerm("");
              setTypeFilter("all");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {schemes.map((s) => (
              <Card key={s.id} hover className="flex flex-col justify-between">
                <div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold leading-tight">
                        {s.name}
                      </CardTitle>
                      <Badge
                        variant={s.scheme_type === "subsidy" ? "success" : "info"}
                        size="sm"
                      >
                        {s.scheme_type.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {s.provider}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {s.short_description}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 font-medium">Max Limit:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{s.max_amount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {s.documents && s.documents.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                          Required Documents:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {s.documents.map((doc) => (
                            <span
                              key={doc.id}
                              className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {doc.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>

                <CardFooter>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    Verified: {s.last_verified_at}
                  </div>
                  <a
                    href={s.official_url}
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
        )}
      </div>
    </AppLayout>
  );
}
