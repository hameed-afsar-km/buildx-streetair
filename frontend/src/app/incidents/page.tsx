"use client";

import React, { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getIncidents } from "@/lib/api/endpoints";
import { EnvironmentalIncident } from "@/lib/types";
import { ShieldCheck, AlertCircle, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<EnvironmentalIncident[]>([]);

  useEffect(() => {
    getIncidents().then(setIncidents);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pollution Incident Tracking & Root Cause Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated anomaly detection records with neural source apportionment and empirical evidence notes.
          </p>
        </div>

        <div className="space-y-4">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 uppercase">
                      {inc.status}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {inc.id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {inc.title}
                  </h3>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <span className="text-slate-400 font-mono block">Detected</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatDate(inc.detected_at)} at {formatTime(inc.detected_at)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Root Cause Hypothesis
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {inc.root_cause_hypothesis}
                  </p>
                  <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 font-bold mt-2 block">
                    Confidence: {Math.round(inc.confidence * 100)}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Empirical Telemetry Evidence
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {inc.evidence_notes}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Spatial Ingestion Node
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {inc.station_name}
                    </span>
                    <p className="text-slate-500 mt-0.5">{inc.address}</p>
                  </div>
                  <div className="flex items-center justify-between font-mono pt-2 border-t border-slate-200/60 dark:border-slate-700/60 mt-2">
                    <span className="text-slate-400">Baseline: {inc.baseline_aqi} AQI</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      Peak: {inc.peak_aqi} AQI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

