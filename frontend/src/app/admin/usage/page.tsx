"use client";

import React, { useState, useEffect } from "react";
import { getUsageTelemetry } from "@/lib/api/endpoints";
import { UsageTelemetry } from "@/lib/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { UsageMeter } from "@/components/ui/UsageMeter";
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
import { Activity, Server, Database, HardDrive, Wifi, Sparkles } from "lucide-react";

const DAILY_API_VOLUME = [
  { day: "Oct 29", requests: 124000 },
  { day: "Oct 30", requests: 142000 },
  { day: "Oct 31", requests: 138000 },
  { day: "Nov 01", requests: 165000 },
  { day: "Nov 02", requests: 154000 },
  { day: "Nov 03", requests: 182000 },
  { day: "Nov 04", requests: 198000 },
];

const TOP_CONSUMERS = [
  { org: "B.S. Abdur Rahman Crescent Institute", calls: 124500, share: "34%" },
  { org: "Chennai Metro Corp (CMDA)", calls: 86400, share: "24%" },
  { org: "Tamil Nadu Pollution Control Board", calls: 72100, share: "20%" },
  { org: "Hexaware Tech Park Campus", calls: 45200, share: "12%" },
  { org: "Public Community Clients", calls: 36800, share: "10%" },
];

export default function AdminUsagePage() {
  const [telemetry, setTelemetry] = useState<UsageTelemetry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsageTelemetry().then((data) => {
      setTelemetry(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
              Platform Quota, Throughput & Infrastructure Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-black">Platform Usage & Ingestion Load</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global API request rates, TimescaleDB/PostgreSQL telemetry volume, LLM token consumption, and WebSocket subscribers.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
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
              title="Daily API Requests"
              value="198,000"
              unit="req/day"
              subtitle="FastAPI ingress"
              statusColor="blue"
            />
            <MetricCard
              title="Monthly API Consumption"
              value={telemetry.api_calls_count.toLocaleString()}
              subtitle={`Quota: ${telemetry.api_calls_limit.toLocaleString()}`}
              statusColor="emerald"
            />
            <MetricCard
              title="AI Queries Processed"
              value={telemetry.ai_queries_count}
              subtitle={`Quota: ${telemetry.ai_queries_limit} calls`}
              statusColor="purple"
            />
            <MetricCard
              title="Telemetry Storage Used"
              value={`${telemetry.storage_mb} MB`}
              subtitle={`Limit: ${telemetry.storage_limit_mb} MB`}
              statusColor="amber"
            />
          </>
        )}
      </div>

      {/* Chart and Top Consumers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="FastAPI Throughput & Ingestion Requests (Past 7 Days)"
            subtitle="Hourly aggregated HTTP and WebSocket telemetry frames"
          >
            <div className="h-[280px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DAILY_API_VOLUME}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="requests" fill="#3b82f6" radius={[6, 6, 0, 0]} name="API Calls" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Top Consumers Panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Top API Consumers
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">By total request volume this month</p>

            <div className="space-y-3">
              {TOP_CONSUMERS.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                  <div className="max-w-[170px] truncate">
                    <span className="font-semibold text-slate-200 block truncate">{c.org}</span>
                    <span className="text-[10px] text-slate-400">{c.share} of total traffic</span>
                  </div>
                  <span className="font-mono font-bold text-slate-300">
                    {c.calls.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <span className="text-[10px] text-slate-500 font-mono">
              Metrics sync: Every 15 minutes
            </span>
          </div>
        </div>
      </div>

      {/* Quota Usage Meters */}
      {telemetry && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Enterprise Tenant Allocation Capacities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UsageMeter
              label="Station Provisioning Limits"
              current={telemetry.stations_count}
              limit={telemetry.stations_limit}
              unit="stations"
            />
            <UsageMeter
              label="API Ingress Limit (FastAPI)"
              current={telemetry.api_calls_count}
              limit={telemetry.api_calls_limit}
              unit="requests"
            />
            <UsageMeter
              label="Neural Assistant Quota"
              current={telemetry.ai_queries_count}
              limit={telemetry.ai_queries_limit}
              unit="inferences"
            />
          </div>
        </div>
      )}
    </div>
  );
}

