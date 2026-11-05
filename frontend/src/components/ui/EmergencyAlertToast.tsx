"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  X,
  Radar,
  ChevronRight,
  ShieldAlert,
  Clock,
  MapPin,
  Wind,
} from "lucide-react";
import { EnvironmentalAlert } from "@/lib/types";

interface EmergencyAlertToastProps {
  alerts: EnvironmentalAlert[];
  currentAqi?: number;
  onOpenScanner?: () => void;
}

export function EmergencyAlertToast({
  alerts,
  currentAqi = 68,
  onOpenScanner,
}: EmergencyAlertToastProps) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(true);

  // Active emergency or high priority alert
  const activeAlert = alerts.find((a) => a.active) || {
    id: "auto-gst-advisory",
    station_id: "crescent-vandalur-01",
    station_name: "Crescent Institute Campus Beacon",
    alert_type: "threshold_exceedance",
    severity: currentAqi > 100 ? "high" : "medium",
    pollutant: "PM2.5",
    value: 48.6,
    threshold: 60.0,
    message:
      currentAqi > 100
        ? "Active pollution threshold exceedance detected along GST Road & Kilambakkam corridor. Micro-particle concentrations elevated; sensitive groups should limit outdoor exertion."
        : "Automated Air Advisory: Local atmospheric boundary layer stable across Vandalur & South Chennai. All criteria pollutants monitored within permissible CPCB limits.",
    timestamp: new Date().toISOString(),
    acknowledged: false,
    active: true,
  };

  const isElevated = currentAqi > 100 || activeAlert.severity === "high" || activeAlert.severity === "critical";

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-18 sm:bottom-20 left-1/2 -translate-x-1/2 z-40 w-[min(540px,calc(100vw-2rem))] select-none animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
          isElevated
            ? "border-amber-300/80 dark:border-amber-700/80 bg-white/95 dark:bg-slate-900/95"
            : "border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95"
        }`}
      >
        {/* Glow Bar */}
        <div
          className={`h-1.5 w-full ${
            isElevated
              ? "bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse"
              : "bg-gradient-to-r from-emerald-500 to-teal-400"
          }`}
        />

        <div className="p-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`p-1.5 rounded-xl ${
                  isElevated
                    ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isElevated ? (
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                ) : (
                  <Wind className="w-4 h-4" />
                )}
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {isElevated ? "Active Alert Around Your Area" : "Regional Air Advisory"}
                  </h4>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      isElevated
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                  >
                    {isElevated ? "Elevated Alert" : "Nominal"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Vandalur & Kilambakkam GST Corridor · Chennai South
                </p>
              </div>
            </div>

            {/* Close Icon Button */}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Dismiss alert"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alert Message Body */}
          <p className="mt-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {activeAlert.message}
          </p>

          {/* Action & Metric Footer */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Just now
              </span>
              <span>·</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Local AQI: {currentAqi}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenScanner && (
                <button
                  type="button"
                  onClick={onOpenScanner}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition"
                >
                  <Radar className="w-3.5 h-3.5" />
                  <span>Scan Neighborhood Systems</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="px-2.5 py-1 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-semibold text-[11px] transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

