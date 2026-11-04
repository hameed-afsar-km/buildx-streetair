"use client";

import React, { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getAlerts } from "@/lib/api/endpoints";
import { EnvironmentalAlert } from "@/lib/types";
import { AlertTriangle, Bell, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [filterActive, setFilterActive] = useState<boolean>(true);

  useEffect(() => {
    getAlerts(filterActive).then(setAlerts);
  }, [filterActive]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Environmental Advisories & Threshold Alerts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active regulatory threshold exceedances and public health notifications across the monitoring grid.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterActive(true)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterActive ? "bg-white dark:bg-slate-900 shadow-xs font-bold text-brand-600" : "text-slate-500"
              }`}
            >
              Active Only
            </button>
            <button
              type="button"
              onClick={() => setFilterActive(false)}
              className={`px-3 py-1.5 rounded-lg transition ${
                !filterActive ? "bg-white dark:bg-slate-900 shadow-xs font-bold text-brand-600" : "text-slate-500"
              }`}
            >
              All Alerts
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      alt.severity === "critical"
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        : alt.severity === "high"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {alt.severity} Priority
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatDate(alt.timestamp)} {formatTime(alt.timestamp)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {alt.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {alt.message}
                </p>

                <div className="my-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Observed Concentration:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {alt.value} {alt.unit}{" "}
                    <span className="text-[10px] text-red-500 font-normal">
                      (Limit: {alt.threshold})
                    </span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
                Station: <strong>{alt.station_name}</strong>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

