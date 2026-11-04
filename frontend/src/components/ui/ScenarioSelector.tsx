"use client";

import React, { useState } from "react";
import { ScenarioKey } from "@/lib/types";
import { ALL_SCENARIOS, SCENARIO_DEFINITIONS } from "@/lib/scenarios";
import { Radio, ChevronDown, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { AQIBadge } from "./AQIBadge";

interface ScenarioSelectorProps {
  activeScenario: ScenarioKey;
  onSelectScenario: (key: ScenarioKey) => void;
  className?: string;
  isCompact?: boolean;
}

export function ScenarioSelector({
  activeScenario,
  onSelectScenario,
  className,
  isCompact = false,
}: ScenarioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeDef = SCENARIO_DEFINITIONS[activeScenario] || ALL_SCENARIOS[0];

  return (
    <div className={cn("relative font-sans", className)}>
      {isCompact ? (
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 hover:bg-purple-100 transition shadow-sm text-xs font-semibold"
          >
            <Radio className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            <span>
              Scenario #{activeDef.number}: <strong className="underline">{activeDef.name}</strong>
            </span>
            <ChevronDown className="w-3 h-3 text-purple-500" />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  ESP32 Keypad Demonstration Input (1-9)
                </div>
                {ALL_SCENARIOS.map((sc) => (
                  <button
                    key={sc.key}
                    type="button"
                    onClick={() => {
                      onSelectScenario(sc.key);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition",
                      activeScenario === sc.key && "bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200"
                    )}
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {sc.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{sc.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          AQI {sc.expectedAQIRange[0]}-{sc.expectedAQIRange[1]}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{sc.shortDesc}</p>
                    </div>
                    {activeScenario === sc.key && (
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0 self-center" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-50/60 via-slate-50 to-indigo-50/40 dark:from-purple-950/20 dark:via-slate-900 dark:to-indigo-950/20 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-600 text-white shadow-sm">
                <Radio className="w-4 h-4 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    ESP32 Hardware Keypad Simulation Matrix
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                    9 Demo Scenarios
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a scenario below to emulate keypad telemetry packets from the Vandalur ESP32 station.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Current Simulation:</span>
              <AQIBadge
                aqi={Math.round((activeDef.expectedAQIRange[0] + activeDef.expectedAQIRange[1]) / 2)}
                size="sm"
              />
            </div>
          </div>

          {/* Keypad Grid (1 through 9) */}
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
            {ALL_SCENARIOS.map((sc) => {
              const isSelected = activeScenario === sc.key;
              return (
                <button
                  key={sc.key}
                  type="button"
                  onClick={() => onSelectScenario(sc.key)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all group",
                    isSelected
                      ? "border-purple-600 bg-white dark:bg-purple-950 text-purple-950 dark:text-purple-100 shadow-md ring-2 ring-purple-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white text-slate-700 dark:text-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 mb-1 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-purple-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200"
                    )}
                  >
                    {sc.number}
                  </span>
                  <span className="text-[11px] font-semibold leading-tight line-clamp-1 w-full">
                    {sc.name.split(" ")[0]}
                  </span>
                  <span className="text-[9px] font-mono opacity-70 mt-0.5">
                    AQI ~{Math.round((sc.expectedAQIRange[0] + sc.expectedAQIRange[1]) / 2)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-start gap-2 pt-2 border-t border-purple-100 dark:border-purple-900/40 text-xs text-slate-600 dark:text-slate-400">
            <Info className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900 dark:text-slate-200">
                Scenario #{activeDef.number} ({activeDef.name}):
              </strong>{" "}
              {activeDef.fullDescription} <span className="italic text-purple-700 dark:text-purple-300">({activeDef.realWorldAnalogy})</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

