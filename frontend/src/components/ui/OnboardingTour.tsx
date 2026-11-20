"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/lib/i18n";
import { TOUR_STEPS_CONFIG, TourStepConfig } from "@/lib/tour";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Search,
  MapPin,
  CheckSquare,
} from "lucide-react";

export interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  storageKey?: string;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  storageKey = "sahay_tour_seen",
}) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const tourCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update target element coordinates whenever step changes or on window resize/scroll
  const updateTargetPosition = () => {
    if (!isOpen) return;
    const step = TOUR_STEPS_CONFIG[currentStep];
    if (!step) return;

    const el = document.querySelector(step.selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        updateTargetPosition();
      }, 100);

      window.addEventListener("resize", updateTargetPosition);
      window.addEventListener("scroll", updateTargetPosition, { passive: true });

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateTargetPosition);
        window.removeEventListener("scroll", updateTargetPosition);
      };
    }
  }, [isOpen, currentStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS_CONFIG.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, "true");
      } catch (e) {
        // storage disabled
      }
    }
    setCurrentStep(0);
    onClose();
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, "true");
      } catch (e) {
        // storage disabled
      }
    }
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const step = TOUR_STEPS_CONFIG[currentStep];
  const isLastStep = currentStep === TOUR_STEPS_CONFIG.length - 1;
  const isFirstStep = currentStep === 0;

  const title = t.tour[step.titleKey];
  const desc = t.tour[step.descKey];
  const stepLabel = t.tour.stepIndicator
    .replace("{current}", String(currentStep + 1))
    .replace("{total}", String(TOUR_STEPS_CONFIG.length));

  const renderStepIcon = (iconName: string) => {
    switch (iconName) {
      case "search":
        return <Search className="w-5 h-5 text-emerald-500" />;
      case "map":
        return <MapPin className="w-5 h-5 text-sky-500" />;
      case "compare":
        return <CheckSquare className="w-5 h-5 text-indigo-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-500" />;
    }
  };

  // Position calculation for tour card
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  let cardStyle: React.CSSProperties = {};

  if (!isMobile && targetRect) {
    const cardWidth = 380;
    const padding = 16;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Check if there is room below
    const spaceBelow = screenHeight - targetRect.bottom;
    const placeAbove = spaceBelow < 260 && targetRect.top > 260;

    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    if (left < padding) left = padding;
    if (left + cardWidth > screenWidth - padding) {
      left = screenWidth - cardWidth - padding;
    }

    const top = placeAbove
      ? Math.max(padding, targetRect.top - 240)
      : Math.min(screenHeight - 260, targetRect.bottom + 16);

    cardStyle = {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      zIndex: 100,
    };
  }

  return createPortal(
    <div className="fixed inset-0 z-90 pointer-events-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-[2px] transition-opacity"
        onClick={handleSkip}
      />

      {/* Target Element Spotlight Highlight Ring */}
      {targetRect && (
        <div
          style={{
            position: "fixed",
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            borderRadius: "16px",
            boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.65), 0 0 25px 4px rgba(16, 185, 129, 0.5)",
            zIndex: 95,
            pointerEvents: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="border-2 border-emerald-400 dark:border-emerald-300 animate-pulse"
        />
      )}

      {/* Tour Dialogue Box */}
      <div
        ref={tourCardRef}
        style={isMobile ? undefined : cardStyle}
        className={
          isMobile
            ? "fixed bottom-4 left-4 right-4 z-100 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5"
            : targetRect
            ? "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 animate-in zoom-in-95"
            : "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-100 w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
        }
      >
        {/* Header with Step Indicator & Close */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
              {renderStepIcon(step.iconName)}
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {stepLabel}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              {t.tour.skip}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
            {title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS_CONFIG.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? "w-6 bg-emerald-600 dark:bg-emerald-400"
                    : "w-2 bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.tour.prev}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.tour.finish}</span>
                </>
              ) : (
                <>
                  <span>{t.tour.next}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
