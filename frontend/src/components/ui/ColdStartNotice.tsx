"use client";

import React, { useEffect, useState } from "react";
import { Server, Sparkles, X, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export const ColdStartNotice: React.FC = () => {
  const { t } = useLanguage();
  const [isWaking, setIsWaking] = useState(false);
  const [justConnected, setJustConnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const handleColdStartEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ waking: boolean; endpoint?: string }>;
      if (customEvent.detail?.waking) {
        setIsWaking(true);
        setJustConnected(false);
        setDismissed(false);
      } else {
        if (isWaking) {
          setIsWaking(false);
          setJustConnected(true);
          const hideTimer = setTimeout(() => {
            setJustConnected(false);
          }, 3000);
          return () => clearTimeout(hideTimer);
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("sahay-coldstart", handleColdStartEvent);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("sahay-coldstart", handleColdStartEvent);
      }
      if (timer) clearInterval(timer);
    };
  }, [isWaking]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isWaking) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWaking]);

  if (dismissed || (!isWaking && !justConnected)) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="w-full bg-linear-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-orange-950/40 border-b border-amber-300/50 dark:border-amber-700/50 text-amber-900 dark:text-amber-200 px-4 py-2.5 transition-all animate-fadeIn"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          {justConnected ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 animate-bounce" />
          ) : (
            <div className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <Server className="relative inline-flex h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
          )}

          <div className="truncate">
            <span className="font-semibold text-amber-950 dark:text-amber-100 mr-2">
              {justConnected ? t.coldStart.connectedMessage : t.coldStart.title}
            </span>
            <span className="hidden md:inline text-amber-800 dark:text-amber-300">
              {justConnected ? "" : t.coldStart.wakingMessage}
            </span>
            {isWaking && elapsedSeconds > 0 && (
              <span className="ml-2 font-mono text-[11px] bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-200">
                {elapsedSeconds}s
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
            <Sparkles className="w-3 h-3" />
            Render Free Tier
          </span>
          <button
            onClick={() => setDismissed(true)}
            aria-label={t.coldStart.dismiss}
            title={t.coldStart.dismiss}
            className="p-1 text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-100 rounded-md hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
