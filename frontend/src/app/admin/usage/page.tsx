"use client";

import React, { useState, useEffect } from "react";
import { getUsageTelemetry } from "@/lib/api/endpoints";
import { UsageTelemetry } from "@/lib/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Activity, Server, Database, Wifi, CheckCircle2, AlertCircle } from "lucide-react";

const DAILY_INGEST_VOLUME = [
  { day: "Oct 29", readings: 8640 },
  { day: "Oct 30", readings: 9120 },
  { day: "Oct 31", readings: 8880 },
  { day: "Nov 01", readings: 10080 },
  { day: "Nov 02", readings: 9540 },
  { day: "Nov 03", readings: 11520 },
  { day: "Nov 04", readings: 12240 },
];

const SERVICES = [
  {
    name: "FastAPI Ingestion Gateway",
    status: "Operational",
    latency: "23ms",
    uptime: "99.98%",
    description: "Primary REST + WebSocket ingestion endpoint for ESP32 sensor telemetry.",
    icon: <Server className="w-4 h-4 text-emerald-400" />,
  },
  {
    name: "PostgreSQL / TimescaleDB",
    status: "Operational",
    latency: "8ms",
    uptime: "99.99%",
    description: "Time-series database storing raw sensor readings with hypertable partitioning.",
    icon: <Database className="w-4 h-4 text-blue-400" />,
  },
  {
    name: "WebSocket Broadcast",
    status: "Operational",
    latency: "12ms",
    uptime: "99.95%",
    description: "Real-time WebSocket stream pushing live telemetry to connected dashboards.",
    icon: <Wifi className="w-4 h-4 text-violet-400" />,
  },
  {
    name: "AI Engine (FastAPI)",
    status: "Operational",
    latency: "115ms",
    uptime: "99.87%",
    description: "LLM inference, RAG retrieval, anomaly detection, and source apportionment pipelines.",
    icon: <Activity className="w-4 h-4 text-amber-400" />,
  },
];

export default function AdminSystemInfraPage() {
  const [telemetry, setTelemetry] = useState<UsageTelemetry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsageTelemetry()
      .then((data) => setTelemetry(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-900 dark:text-white transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
              Platform Infrastructure & Throughput Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-black">System Infrastructure & Load</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time service health, sensor ingestion throughput, database performance, and WebSocket subscriber load.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {loading || !telemetry ? (
          <>
            <LoadingSkeleton className="h-28 rounded-2xl" />
            <LoadingSkeleton className="h-28 rounded-2xl" />
            <LoadingSkeleton className="h-28 rounded-2xl" />
            <LoadingSkeleton className="h-28 rounded-2xl" />
          </>
        ) : (
          <>
            <MetricCard
              title="Daily Sensor Readings"
              value="12,240"
              unit="readings/day"
              subtitle="ESP32 telemetry ingested"
              statusColor="blue"
            />
            <MetricCard
              title="API Requests Today"
              value={telemetry.api_calls_count.toLocaleString()}
              subtitle="FastAPI ingress load"
              statusColor="emerald"
            />
            <MetricCard
              title="AI Queries Processed"
              value={telemetry.ai_queries_count}
              subtitle="RAG + LLM inference calls"
              statusColor="purple"
            />
            <MetricCard
              title="Telemetry Storage"
              value={`${telemetry.storage_mb} MB`}
              subtitle="TimescaleDB compressed"
              statusColor="amber"
            />
          </>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICES.map((svc) => (
          <div
            key={svc.name}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors p-5 flex items-start gap-4"
          >
            <div className="mt-0.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{svc.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{svc.name}</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  {svc.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{svc.description}</p>
              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                <span>Latency: <strong className="text-slate-800 dark:text-slate-200">{svc.latency}</strong></span>
                <span>Uptime: <strong className="text-emerald-400">{svc.uptime}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ingestion Volume Chart */}
      <ChartCard
        title="Daily Sensor Reading Ingestion (Past 7 Days)"
        subtitle="Aggregated ESP32 readings processed by FastAPI ingestion service"
      >
        <div className="h-[260px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DAILY_INGEST_VOLUME}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number) => [v.toLocaleString(), "Readings"]}
              />
              <Bar dataKey="readings" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* System Health Summary */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors/60 p-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">System Health Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          {[
            ["Database Connections", "12 / 100", "emerald"],
            ["WebSocket Subscribers", "47 active", "blue"],
            ["Queue Depth", "0 backlog", "emerald"],
            ["Error Rate (1h)", "0.02%", "emerald"],
          ].map(([label, value, color]) => (
            <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">{label}</p>
              <p className={`font-bold text-${color}-400`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



