"use client";

import React, { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getReadingHistory, getStations } from "@/lib/api/endpoints";
import { MonitoringStation, ReadingHistoryPoint } from "@/lib/types";
import { ChartCard } from "@/components/ui/ChartCard";
import { AQITrendChart } from "@/components/charts/AQITrendChart";
import { Calendar, Filter, Clock, Download, ArrowRight } from "lucide-react";

export default function HistoryPage() {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [selectedStation, setSelectedStation] = useState("crescent-vandalur-01");
  const [history, setHistory] = useState<ReadingHistoryPoint[]>([]);
  const [resolution, setResolution] = useState("1h");

  useEffect(() => {
    getStations().then(setStations);
  }, []);

  useEffect(() => {
    getReadingHistory(selectedStation, undefined, undefined, resolution).then(setHistory);
  }, [selectedStation, resolution]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Historical Air Quality Explorer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Time-series atmospheric observations, diurnal rhythms, and seasonal baseline records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Station Dropdown */}
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              aria-label="Select Monitoring Station"
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none shadow-sm"
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Resolution Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setResolution("1h")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  resolution === "1h" ? "bg-white dark:bg-slate-900 shadow-xs font-bold text-brand-600" : "text-slate-500"
                }`}
              >
                1h Resolution
              </button>
              <button
                type="button"
                onClick={() => setResolution("5m")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  resolution === "5m" ? "bg-white dark:bg-slate-900 shadow-xs font-bold text-brand-600" : "text-slate-500"
                }`}
              >
                5m Telemetry
              </button>
            </div>
          </div>
        </div>

        {/* Big Chart */}
        <ChartCard
          title="Atmospheric AQI Chronology"
          description="Continuous time-series telemetry with National Air Quality Index breakpoints."
        >
          <AQITrendChart data={history} height={320} />
        </ChartCard>

        {/* Diurnal Analysis Note */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3 text-xs leading-relaxed">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Diurnal Pattern Analysis for Vandalur Corridor
            </h3>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Observations consistently reflect two distinct daily peaks:
            a morning rush hour peak (08:00-10:30 AM) driven by commuter diesel traffic along GST Road,
            followed by convective boundary-layer expansion and sea-breeze dispersion during afternoon hours.
            A secondary evening inversion peak occurs between 18:30 and 21:00.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

