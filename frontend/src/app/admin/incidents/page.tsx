"use client";

import React, { useState, useEffect } from "react";
import { getIncidents } from "@/lib/api/endpoints";
import { EnvironmentalIncident, IncidentStatus } from "@/lib/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Flame,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Search,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const STATUS_COLUMNS: { label: string; status: IncidentStatus; color: string }[] = [
  { label: "Detected Anomaly", status: "detected", color: "border-amber-500/50" },
  { label: "Under Investigation", status: "investigating", color: "border-blue-500/50" },
  { label: "Confirmed Incident", status: "confirmed", color: "border-rose-500/50" },
  { label: "Resolved & Closed", status: "resolved", color: "border-emerald-500/50" },
];

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<EnvironmentalIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<EnvironmentalIncident | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to load incidents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleAdvanceStatus = (id: string, currentStatus: IncidentStatus) => {
    const nextMap: Record<IncidentStatus, IncidentStatus> = {
      detected: "investigating",
      investigating: "confirmed",
      confirmed: "resolved",
      resolved: "resolved",
    };
    const next = nextMap[currentStatus];
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: next } : inc))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-900 dark:text-white transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
              Root-Cause Apportionment & Incident Board
            </span>
          </div>
          <h1 className="text-2xl font-black">Environmental Incident Escalation Kanban</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track pollution incidents from automated ML sensor anomaly triggers through human field investigation to resolution.
          </p>
        </div>

        <button
          onClick={fetchIncidents}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Pipeline
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Incidents"
          value={incidents.length}
          subtitle="Monitored in cycle"
          statusColor="blue"
        />
        <MetricCard
          title="Active Escalations"
          value={incidents.filter((i) => i.status !== "resolved").length}
          subtitle="Pending closure"
          statusColor="rose"
        />
        <MetricCard
          title="Peak Incident AQI"
          value={incidents.length > 0 ? Math.max(...incidents.map((i) => i.peak_aqi)) : 0}
          unit="NAQI"
          subtitle="Highest reading"
          statusColor="amber"
        />
        <MetricCard
          title="Resolved Rate"
          value={`${Math.round(
            (incidents.filter((i) => i.status === "resolved").length / (incidents.length || 1)) * 100
          )}%`}
          subtitle="Root causes verified"
          statusColor="emerald"
        />
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LoadingSkeleton className="h-96 rounded-2xl" />
          <LoadingSkeleton className="h-96 rounded-2xl" />
          <LoadingSkeleton className="h-96 rounded-2xl" />
          <LoadingSkeleton className="h-96 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const colIncidents = incidents.filter((i) => i.status === col.status);

            return (
              <div
                key={col.status}
                className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col h-[600px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {col.label}
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {colIncidents.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                  {colIncidents.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs italic">
                      No incidents in this stage
                    </div>
                  ) : (
                    colIncidents.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedIncident(inc)}
                        className={`p-4 rounded-xl border bg-slate-100 dark:bg-slate-950/70 cursor-pointer hover:border-slate-600 transition space-y-3 ${col.color}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {inc.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              inc.severity === "critical"
                                ? "bg-rose-950 text-rose-300"
                                : inc.severity === "high"
                                ? "bg-amber-950 text-amber-300"
                                : "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {inc.title}
                        </h4>

                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Peak AQI:</span>
                          <span className="font-mono font-bold text-rose-400">
                            {inc.peak_aqi} NAQI
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          Hypothesis: {inc.root_cause_hypothesis}
                        </p>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(inc.detected_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {inc.status !== "resolved" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdvanceStatus(inc.id, inc.status);
                              }}
                              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                            >
                              Advance <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Incident Detail Modal / Drawer */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400">{selectedIncident.id}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-400">{selectedIncident.address}</p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-mono px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                âœ•
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Station:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedIncident.station_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Baseline vs Peak:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedIncident.baseline_aqi} â†’{" "}
                  <strong className="text-rose-400">{selectedIncident.peak_aqi} AQI</strong>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ML Confidence:</span>
                <span className="font-mono text-emerald-400">
                  {Math.round(selectedIncident.confidence * 100)}%
                </span>
              </div>
              <div className="flex flex-col gap-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Root Cause Hypothesis:</span>
                <span className="text-amber-200 font-medium">
                  {selectedIncident.root_cause_hypothesis}
                </span>
              </div>
              <div className="flex flex-col gap-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Evidence Notes:</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedIncident.evidence_notes}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




