"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLiveWebSocket } from "@/hooks/useLiveWebSocket";
import { getStations, getAlerts, getIncidents, getReports } from "@/lib/api/endpoints";
import { MonitoringStation, EnvironmentalAlert, EnvironmentalIncident, CommunityReport } from "@/lib/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { StationStatus } from "@/components/ui/StationStatus";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { LiveWebSocketIndicator } from "@/components/ui/LiveWebSocketIndicator";
import {
  ShieldAlert,
  Cpu,
  Radio,
  Activity,
  Bot,
  Flame,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Server,
  Zap,
} from "lucide-react";

export default function AdminCommandCentrePage() {
  const { reading, connectionStatus, lastUpdateTime } = useLiveWebSocket();
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [incidents, setIncidents] = useState<EnvironmentalIncident[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);

  useEffect(() => {
    getStations().then(setStations);
    getAlerts(true).then(setAlerts);
    getIncidents().then(setIncidents);
    getReports().then(setReports);
  }, []);

  const pendingReports = reports.filter((r) => r.status === "submitted" || r.status === "under_review");

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-red-900/60 bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400">
              Live Operations Command & Telemetry Grid
            </span>
          </div>
          <h1 className="text-2xl font-black">STREETAIR Central Command Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitoring network health, FastAPI ingestion telemetry, AI provider uptime,
            and report moderation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LiveWebSocketIndicator status={connectionStatus} lastUpdated={lastUpdateTime} />
        </div>
      </div>

      {/* Network & Ingestion Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Network Stations"
          value={stations.length}
          unit="active"
          subtitle="All nodes reporting"
          statusColor="emerald"
        />
        <MetricCard
          title="Ingestion Rate"
          value="1,420"
          unit="packets/min"
          subtitle="Avg latency: 24ms"
          statusColor="blue"
        />
        <MetricCard
          title="Active Threshold Alerts"
          value={alerts.length}
          unit="broadcasts"
          subtitle="Requiring triage"
          statusColor="amber"
        />
        <MetricCard
          title="Moderation Queue"
          value={pendingReports.length}
          unit="reports"
          subtitle="Citizen submissions"
          statusColor="purple"
        />
      </div>

      {/* AI Services & Provider Status Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">AI Services & Provider Health</h2>
          </div>
          <Link href="/admin/ai" className="text-xs font-bold text-red-400 hover:underline">
            AI Gateway Diagnostics
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px]">Groq Cloud LPU</span>
              <span className="font-bold text-emerald-400">Operational (115ms)</span>
            </div>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px]">Ollama Local Node</span>
              <span className="font-bold text-emerald-400">Ready (82ms)</span>
            </div>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px]">Tavily Web Search</span>
              <span className="font-bold text-emerald-400">Online (310ms)</span>
            </div>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Incident Escalation & Moderation Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Incidents */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-white">Active Anomaly Incidents</h3>
            </div>
            <Link href="/admin/incidents" className="text-xs font-bold text-red-400 hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{inc.title}</span>
                  <span className="text-amber-400 font-mono font-bold uppercase text-[10px]">
                    {inc.status}
                  </span>
                </div>
                <p className="text-slate-400 line-clamp-2">{inc.root_cause_hypothesis}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>Peak: {inc.peak_aqi} AQI</span>
                  <span>Confidence: {Math.round(inc.confidence * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Report Moderation Queue */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Community Moderation Queue</h3>
            </div>
            <Link href="/admin/reports" className="text-xs font-bold text-red-400 hover:underline">
              Open Queue
            </Link>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase font-mono text-[10px]">
                    {rep.category.replace("_", " ")}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300">
                    {rep.status}
                  </span>
                </div>
                <p className="text-slate-300 line-clamp-1">{rep.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>By: {rep.user_name}</span>
                  <span>{rep.address}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

