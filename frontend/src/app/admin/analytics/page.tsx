"use client";

import React, { useState, useEffect } from "react";
import { getAnalyticsOverview, getAnalyticsTrends, getStations } from "@/lib/api/endpoints";
import { AnalyticsOverview, AnalyticsTrend, MonitoringStation } from "@/lib/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { AQITrendChart } from "@/components/charts/AQITrendChart";
import { PollutantBreakdownChart } from "@/components/charts/PollutantBreakdownChart";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Activity, BarChart3, TrendingUp, ShieldCheck, RefreshCw } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrend[]>([]);
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ovData, trData, stData] = await Promise.all([
        getAnalyticsOverview(),
        getAnalyticsTrends(),
        getStations(),
      ]);
      setOverview(ovData);
      setTrends(trData);
      setStations(stData);
    } catch (err) {
      console.error("Failed to load analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
              Platform Intelligence & Diagnostics
            </span>
          </div>
          <h1 className="text-2xl font-black">Air Quality Analytics & Telemetry Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated spatio-temporal trends across sensor fleets, CPCB compliance metrics, and statistical dispersion analysis.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Pipeline
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading || !overview ? (
          <>
            <LoadingSkeleton className="h-28 rounded-2xl" />
            <LoadingSkeleton className="h-28 rounded-2xl" />
            <LoadingSkeleton className="h-28 rounded-2xl" />
            <LoadingSkeleton className="h-28 rounded-2xl" />
          </>
        ) : (
          <>
            <MetricCard
              title="Network Fleet Average AQI"
              value={overview.average_aqi}
              unit="NAQI"
              subtitle={overview.overall_category}
              statusColor="amber"
            />
            <MetricCard
              title="CPCB Compliance Rate"
              value={`${overview.compliance_rate_pct}%`}
              subtitle="Within standard limits"
              statusColor="emerald"
            />
            <MetricCard
              title="Active Alert Triggers"
              value={overview.active_alerts_count}
              subtitle="Exceedances active"
              statusColor={overview.active_alerts_count > 0 ? "rose" : "emerald"}
            />
            <MetricCard
              title="Monitored Population"
              value={overview.monitored_population.toLocaleString()}
              subtitle="Vandalur & GST Corridor"
              statusColor="blue"
            />
          </>
        )}
      </div>

      {/* Trend & Pollutants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="24-Hour Network AQI Trajectory"
          subtitle="Real-time and rolling average across operational stations"
          action={
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
              Live Feed
            </span>
          }
        >
          <div className="h-[320px] w-full">
            <AQITrendChart />
          </div>
        </ChartCard>

        <ChartCard
          title="CPCB Sub-Index Pollutant Breakdown"
          subtitle="Primary criteria pollutants vs CPCB National Ambient thresholds"
        >
          <div className="h-[320px] w-full">
            <PollutantBreakdownChart />
          </div>
        </ChartCard>
      </div>

      {/* 7-Day Trend Summaries */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              7-Day Micro-Sensor Variance by Criteria Pollutant
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Rolling window: 168 Hours</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trends.map((t) => (
            <div
              key={t.pollutant}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-200 text-sm">{t.pollutant}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    t.trend_direction === "improving"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : t.trend_direction === "degrading"
                      ? "bg-rose-950 text-rose-400 border border-rose-800"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {t.change_pct_7d > 0 ? `+${t.change_pct_7d}%` : `${t.change_pct_7d}%`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unit: <span className="font-mono text-slate-300">{t.unit}</span> · Trend:{" "}
                <span className="capitalize font-medium text-slate-200">{t.trend_direction}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

