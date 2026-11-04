"use client";

import React, { useState, useEffect } from "react";
import { getAlerts } from "@/lib/api/endpoints";
import { EnvironmentalAlert, AlertSeverity } from "@/lib/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ShieldAlert,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Send,
} from "lucide-react";

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAlerts(false); // get all alerts
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, active: false } : a))
    );
  };

  const handleDispatch = (alertId: string) => {
    setDispatchedId(alertId);
    setTimeout(() => {
      setDispatchedId(null);
    }, 2500);
  };

  const filtered = alerts.filter((a) => {
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (statusFilter === "active" && !a.active) return false;
    if (statusFilter === "resolved" && a.active) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Emergency Escalation & Rules Engine
            </span>
          </div>
          <h1 className="text-2xl font-black">Environmental Alert Dispatch Centre</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time threshold breaches, rapid notification webhooks, SMS/Email broadcasts, and emergency dispatch actions.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Triggers
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Active Alerts"
          value={alerts.filter((a) => a.active).length}
          subtitle="Awaiting resolution"
          statusColor="rose"
        />
        <MetricCard
          title="Critical Severity"
          value={alerts.filter((a) => a.severity === "critical").length}
          subtitle="Immediate hazard"
          statusColor="rose"
        />
        <MetricCard
          title="High Severity"
          value={alerts.filter((a) => a.severity === "high").length}
          subtitle="Exceeds 24h limit"
          statusColor="amber"
        />
        <MetricCard
          title="Resolved Alerts"
          value={alerts.filter((a) => !a.active).length}
          subtitle="Dispersed back to normal"
          statusColor="emerald"
        />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filters:</span>
          
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="resolved">Resolved Only</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filtered.length} of {alerts.length} triggers
        </span>
      </div>

      {/* Alerts Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <LoadingSkeleton className="h-12 w-full rounded-xl" />
            <LoadingSkeleton className="h-12 w-full rounded-xl" />
            <LoadingSkeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10">
            <EmptyState
              title="No Environmental Alerts"
              description="No alerts match your current filter parameters or all active issues have been resolved."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Alert ID & Station</th>
                  <th className="py-3 px-4">Pollutant</th>
                  <th className="py-3 px-4">Breach Level</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Triggered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((alert) => {
                  const isCritical = alert.severity === "critical";
                  const isHigh = alert.severity === "high";

                  return (
                    <tr key={alert.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100">{alert.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {alert.station_name} ({alert.device_id})
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-200">
                          {alert.pollutant}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-rose-400 font-mono">
                          {alert.value} {alert.unit}
                        </span>{" "}
                        <span className="text-slate-500 text-[10px]">
                          (Limit: {alert.threshold})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCritical
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : isHigh
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-blue-950 text-blue-300 border border-blue-800"
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {alert.active ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resolved
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {alert.active && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => handleDispatch(alert.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                            dispatchedId === alert.id
                              ? "bg-emerald-600 text-white"
                              : "bg-blue-600 hover:bg-blue-500 text-white"
                          }`}
                        >
                          {dispatchedId === alert.id ? "Dispatched!" : "Dispatch Team"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

