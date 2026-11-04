"use client";

import React, { useState, useEffect } from "react";
import { getIncidents } from "@/lib/api/endpoints";
import { EnvironmentalIncident } from "@/lib/types";
import { AlertTriangle, ShieldCheck, MapPin, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function OrgIncidentsPage() {
  const [incidents, setIncidents] = useState<EnvironmentalIncident[]>([]);

  useEffect(() => {
    getIncidents().then(setIncidents);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Campus Incidents & Root Cause Registry
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Investigate detected air quality threshold breaches and record remediation actions for CPCB audits.
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
                <span className="text-[10px] font-mono font-bold uppercase text-brand-600 block">
                  {inc.category} &bull; ID: {inc.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {inc.title}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                {inc.status}
              </span>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Root Cause Analysis:</strong> {inc.root_cause_hypothesis}
              </p>
              <p className="text-slate-500">
                <strong>Sensor Evidence:</strong> {inc.evidence_notes}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-400">
              <span>Peak: {inc.peak_aqi} AQI</span>
              <span>Detected: {formatDate(inc.detected_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

