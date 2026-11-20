"use client";

import React, { useState } from "react";
import { Scheme } from "@/types";
import { INDIAN_STATES, IndiaStateInfo, countSchemesForState } from "@/lib/states";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  MapPin,
  List,
  Search,
  RotateCcw,
  CheckCircle2,
  Globe,
  Info,
  Layers,
  ChevronRight,
} from "lucide-react";

export interface IndiaStateMapProps {
  selectedState: string | null;
  onSelectState: (stateName: string) => void;
  onClearState: () => void;
  schemes: Scheme[];
}

export const IndiaStateMap: React.FC<IndiaStateMapProps> = ({
  selectedState,
  onSelectState,
  onClearState,
  schemes,
}) => {
  const { lang, t } = useLanguage();
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [hoveredState, setHoveredState] = useState<IndiaStateInfo | null>(null);
  const [listSearch, setListSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("all");

  const getStateLocalizedName = (state: IndiaStateInfo) => {
    if (lang === "bn") return state.nameBn || state.name;
    if (lang === "hi") return state.nameHi || state.name;
    return state.name;
  };

  const filteredStates = INDIAN_STATES.filter((state) => {
    const matchesSearch =
      !listSearch.trim() ||
      state.name.toLowerCase().includes(listSearch.toLowerCase()) ||
      state.nameHi.includes(listSearch) ||
      state.nameBn.includes(listSearch) ||
      state.code.toLowerCase().includes(listSearch.toLowerCase());

    const matchesZone = selectedZone === "all" || state.zone === selectedZone;

    return matchesSearch && matchesZone;
  });

  const zones = ["all", "East", "West", "North", "South", "Central", "North-East", "Union Territory"];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
      {/* Top Controls Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t.stateMap.title}
            </h2>
            {selectedState && selectedState !== "ALL" ? (
              <Badge variant="brand" size="sm">
                {selectedState}
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                {t.stateMap.allIndia}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.stateMap.subtitle}
          </p>
        </div>

        {/* View Switcher: Interactive Map vs Accessible List */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="inline-flex rounded-lg p-0.5 bg-slate-200 dark:bg-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === "map"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.stateMap.mapView}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t.stateMap.listView}</span>
            </button>
          </div>

          {selectedState && selectedState !== "ALL" && (
            <Button
              variant="outline"
              size="xs"
              onClick={onClearState}
              leftIcon={<RotateCcw className="w-3 h-3" />}
            >
              {t.stateMap.clearStateFilter}
            </Button>
          )}
        </div>
      </div>

      {/* State Active Notice Banner */}
      {selectedState && selectedState !== "ALL" && (
        <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {t.stateMap.selectedState.replace("{state}", selectedState)}:{" "}
              <strong>
                {t.stateMap.schemesAvailable.replace(
                  "{count}",
                  String(countSchemesForState(selectedState, schemes))
                )}
              </strong>
            </span>
            {selectedState === "West Bengal" && (
              <span className="hidden sm:inline text-[11px] bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300 font-medium">
                {t.stateMap.westBengalNotice}
              </span>
            )}
          </div>
          <button
            onClick={onClearState}
            className="text-[11px] text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 font-semibold underline"
          >
            Show All
          </button>
        </div>
      )}

      {/* Main View Area: Interactive Map or Fallback List */}
      <div className="p-4 sm:p-6">
        {viewMode === "map" ? (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* SVG India Map (Self-contained, no external CDN) */}
            <div className="relative w-full max-w-[520px] aspect-[650/720] mx-auto bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-2 border border-slate-100 dark:border-slate-800">
              <svg
                viewBox="0 0 650 720"
                className="w-full h-full drop-shadow-sm select-none"
                role="img"
                aria-label="Interactive Map of India States and Union Territories"
              >
                {/* Decorative map boundary background */}
                <rect width="650" height="720" fill="transparent" />

                {/* State Paths */}
                {INDIAN_STATES.map((state) => {
                  const isSelected = selectedState === state.name;
                  const isHovered = hoveredState?.code === state.code;
                  const schemeCount = countSchemesForState(state.name, schemes);
                  const hasSpecialSchemes = state.name === "West Bengal";

                  return (
                    <g
                      key={state.code}
                      role="button"
                      tabIndex={0}
                      aria-label={`${state.name}: ${schemeCount} schemes available`}
                      aria-pressed={isSelected}
                      onClick={() => onSelectState(state.name)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectState(state.name);
                        }
                      }}
                      onMouseEnter={() => setHoveredState(state)}
                      onMouseLeave={() => setHoveredState(null)}
                      className="cursor-pointer focus:outline-none group"
                    >
                      <path
                        d={state.svg.path}
                        className={`transition-all duration-200 ${
                          isSelected
                            ? "fill-emerald-600 stroke-white stroke-2 drop-shadow-md"
                            : hasSpecialSchemes
                            ? "fill-emerald-100 dark:fill-emerald-950/80 hover:fill-emerald-500 hover:text-white stroke-emerald-400 dark:stroke-emerald-600 stroke-1.5"
                            : isHovered
                            ? "fill-emerald-400 stroke-emerald-700 dark:stroke-white stroke-1.5"
                            : "fill-slate-100 hover:fill-slate-200 dark:fill-slate-800 dark:hover:fill-slate-700 stroke-slate-300 dark:stroke-slate-700 stroke-1"
                        }`}
                      />
                      {/* State Abbreviation Marker */}
                      <text
                        x={state.svg.cx}
                        y={state.svg.cy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={`text-[10px] font-bold pointer-events-none transition-colors ${
                          isSelected
                            ? "fill-white"
                            : hasSpecialSchemes
                            ? "fill-emerald-800 dark:fill-emerald-300"
                            : "fill-slate-600 dark:fill-slate-400"
                        }`}
                      >
                        {state.code}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Live Hover Pill on Map */}
              {hoveredState && (
                <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-in fade-in flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold">{getStateLocalizedName(hoveredState)}</span>
                  <span className="text-slate-300 text-[11px]">
                    ({countSchemesForState(hoveredState.name, schemes)} schemes)
                  </span>
                </div>
              )}
            </div>

            {/* Side State Detail & Legend */}
            <div className="w-full lg:w-72 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>Map Legend & Instructions</span>
                </div>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-600 shrink-0" />
                    <span>Selected State Filter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 shrink-0" />
                    <span>State with Specific MSME Schemes (e.g. West Bengal)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 shrink-0" />
                    <span>Pan-India Coverage Available</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                  Keyboard users can press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono text-[10px]">Tab</kbd> to cycle states and <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono text-[10px]">Enter</kbd> to select.
                </p>
              </div>

              {/* Quick Jump Buttons for Frequent States */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-500">
                  Quick Select State:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["West Bengal", "Maharashtra", "Uttar Pradesh", "Delhi", "Gujarat", "Karnataka"].map((sName) => (
                    <button
                      key={sName}
                      type="button"
                      onClick={() => onSelectState(sName)}
                      className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                        selectedState === sName
                          ? "bg-emerald-600 text-white font-semibold shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {sName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Step 3: Accessible Fallback State List */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
              <div className="relative flex-1">
                <Input
                  placeholder={t.stateMap.searchStatePlaceholder}
                  leftIcon={<Search className="w-4 h-4" />}
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                />
              </div>

              {/* Zone Filter */}
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z === "all" ? "All Zones / Regions" : `${z} Zone`}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid of Accessible State Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredStates.map((state) => {
                const isSelected = selectedState === state.name;
                const schemeCount = countSchemesForState(state.name, schemes);
                const hasSpecial = state.name === "West Bengal";

                return (
                  <button
                    key={state.code}
                    type="button"
                    onClick={() => onSelectState(state.name)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md font-semibold"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? "bg-emerald-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                          {state.code}
                        </span>
                        <span className="text-xs font-semibold">{getStateLocalizedName(state)}</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                        {state.zone} • {state.name}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-bold ${isSelected ? "text-white" : hasSpecial ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
                        {schemeCount}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 inline ml-1 ${isSelected ? "text-white" : "text-slate-300"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
