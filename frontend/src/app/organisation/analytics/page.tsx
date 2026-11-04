"use client";

import React, { useState, useEffect } from "react";
import { getAnalyticsTrends, getReadingHistory } from "@/lib/api/endpoints";
import { AnalyticsTrend, ReadingHistoryPoint } from "@/lib/types";
import { ChartCard } from "@/components/ui/ChartCard";
import { AQITrendChart } from "@/components/charts/AQITrendChart";
import { BarChart3, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

export default function OrgAnalyticsPage() {
  const [trends, setTrends] = useState<AnalyticsTrend[]>([]);
  const [history, setHistory] = useState<ReadingHistoryPoint[]>([]);

  useEffect(() => {
    getAnalyticsTrends().then(setTrends);
    getReadingHistory("crescent-vandalur-01").then(setHistory);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Organisation Environmental Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Longitudinal particulate trends, compliance exceedances, and pollutant variance matrices.
        </p>
      </div>

      {/* 7-Day Trend Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trends.map((tr) => (
          <div
            key={tr.pollutant}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-slate-400">
                7-Day Trend: {tr.pollutant}
              </span>
              <span
                className={`inline-flex items-center gap-1 font-mono text-xs font-bold ${
                  tr.trend_direction === "improving"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {tr.trend_direction === "improving" ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5" />
                )}
                {tr.change_pct_7d > 0 ? `+${tr.change_pct_7d}%` : `${tr.change_pct_7d}%`}
              </span>
            </div>

            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {tr.historical_7d[tr.historical_7d.length - 1]?.value}{" "}
              <span className="text-xs text-slate-400 font-normal">{tr.unit}</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {tr.trend_direction === "improving"
                ? `Favorable reduction observed over recent diurnal cycles.`
                : `Elevated levels detected due to increased corridor activity.`}
            </p>
          </div>
        ))}
      </div>

      {/* Big Trend Chart */}
      <ChartCard
        title="Campus Diurnal Particulate Trend"
        description="Continuous observations captured across Vandalur station."
      >
        <AQITrendChart data={history} height={280} />
      </ChartCard>
    </div>
  );
}

