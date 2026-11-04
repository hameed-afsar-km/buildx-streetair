"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getAnalyticsOverview, getStations, getAlerts } from "@/lib/api/endpoints";
import { AnalyticsOverview, MonitoringStation, EnvironmentalAlert } from "@/lib/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { StationStatus } from "@/components/ui/StationStatus";
import {
  Building2,
  Radio,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";

export default function OrgOverviewPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);

  useEffect(() => {
    getAnalyticsOverview().then(setOverview);
    getStations().then(setStations);
    getAlerts(true).then(setAlerts);
  }, []);

  return (
    <div className="space-y-6">
      {/* Org Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              Enterprise Tenant Workspace
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {user?.org_name || "B.S. Abdur Rahman Crescent Institute of Science and Technology"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time compliance monitoring, multi-beacon network management, and regulatory audits.
          </p>
        </div>

        <Link
          href="/organisation/reports"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Generate CPCB Audit Report</span>
        </Link>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Monitoring Stations"
          value={overview?.online_stations ?? 5}
          unit={`/ ${overview?.total_stations ?? 5}`}
          subtitle="100% operational uptime"
          statusColor="emerald"
        />
        <MetricCard
          title="Campus Average AQI"
          value={overview?.average_aqi ?? 34}
          unit="NAQI"
          subtitle="Category: Good"
          statusColor="emerald"
        />
        <MetricCard
          title="CPCB 24h Compliance Rate"
          value={overview?.compliance_rate_pct ?? 88.4}
          unit="%"
          subtitle="Above regulatory target"
          statusColor="blue"
        />
        <MetricCard
          title="Active Environmental Alerts"
          value={alerts.length}
          unit="alerts"
          subtitle="Immediate response active"
          statusColor={alerts.length > 0 ? "amber" : "emerald"}
        />
      </div>

      {/* Managed Stations Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Campus & Regional Monitoring Beacons
          </h2>
          <Link
            href="/organisation/stations"
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Manage All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="py-2.5 px-3">Station Name</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Live AQI</th>
                <th className="py-2.5 px-3">Dominant Parameter</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stations.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {st.name}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{st.location_name}</td>
                  <td className="py-3 px-3">
                    <StationStatus status={st.status} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <AQIBadge aqi={st.aqi} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {st.dominant_pollutant}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/stations/${st.id}`}
                      className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Diagnostics</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

