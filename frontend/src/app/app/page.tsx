"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLiveWebSocket } from "@/hooks/useLiveWebSocket";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { AQITrendChart } from "@/components/charts/AQITrendChart";
import { getReports, getReadingHistory } from "@/lib/api/endpoints";
import { CommunityReport, ReadingHistoryPoint } from "@/lib/types";
import {
  MapPin,
  Bell,
  FilePlus,
  FileText,
  Bot,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const { reading } = useLiveWebSocket();
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [history, setHistory] = useState<ReadingHistoryPoint[]>([]);

  useEffect(() => {
    getReports(user?.uid).then(setReports);
    getReadingHistory("crescent-vandalur-01").then(setHistory);
  }, [user]);

  const currentAqi = reading?.aqi || 34;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600 font-mono">
            Citizen Intelligence Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            Welcome back, {user?.display_name || "Citizen"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring hyperlocal air quality around your primary saved location:{" "}
            <strong>B.S. Abdur Rahman Crescent Institute, Vandalur</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/reports/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
          >
            <FilePlus className="w-4 h-4" />
            <span>Submit Pollution Report</span>
          </Link>
        </div>
      </div>

      {/* Primary Monitored Location Metric Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                Primary Monitored Site
              </span>
              <DataSourceBadge source={reading?.source || "SIMULATED"} size="sm" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Crescent Institute Beacon
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              GST Road, Vandalur
            </p>

            <div className="my-5 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block font-mono">Live AQI</span>
                <div className="mt-1">
                  <AQIBadge aqi={currentAqi} size="lg" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block font-mono">Dominant</span>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                  {reading?.pollutants.pm25.sub_index ? "PM2.5" : "PM10"}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <span>Open Public Station View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 24h Trend Chart */}
        <div className="md:col-span-8">
          <ChartCard
            title="24-Hour Local Air Quality Trend"
            description="Continuous diurnal particulate readings around Crescent campus."
          >
            <AQITrendChart data={history} height={230} />
          </ChartCard>
        </div>
      </div>

      {/* Community Reports History & AI Assistant Shortcut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reports History */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                My Pollution Reports
              </h3>
            </div>
            <Link href="/app/reports" className="text-xs font-bold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {reports.slice(0, 3).map((rep) => (
              <Link
                key={rep.id}
                href={`/app/reports/${rep.id}`}
                className="block p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-brand-500 transition text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white uppercase font-mono text-[10px]">
                    {rep.category.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      rep.status === "verified"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {rep.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 line-clamp-1">{rep.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>{rep.address}</span>
                  <span>{formatDate(rep.submitted_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Assistant Quick Card */}
        <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 dark:from-purple-950/20 dark:via-slate-900 dark:to-indigo-950/20 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-purple-600 text-white">
                <Bot className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ask the Environmental AI Assistant
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Have questions about local smoke plumes, asthma advisories, or CPCB standards?
              Our AI analyzes real-time telemetry from Crescent station and regional meteorological models.
            </p>

            <div className="mt-4 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase font-mono">
                Suggested Prompts:
              </span>
              <Link
                href="/app/chat"
                className="block p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-purple-600 transition truncate"
              >
                &ldquo;Why did PM2.5 spike at Crescent station at 11 AM?&rdquo;
              </Link>
              <Link
                href="/app/chat"
                className="block p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-purple-600 transition truncate"
              >
                &ldquo;Is it safe to exercise outdoors in Vandalur right now?&rdquo;
              </Link>
            </div>
          </div>

          <Link
            href="/app/chat"
            className="mt-6 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition"
          >
            <span>Open AI Chat Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

