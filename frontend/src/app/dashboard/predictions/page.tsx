"use client";

import React, { useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { BottomNavigation } from "@/components/ui/BottomNavigation";
import { ChartCard } from "@/components/ui/ChartCard";
import { AQITrendChart } from "@/components/charts/AQITrendChart";
import {
  TrendingUp,
  AlertCircle,
  Clock,
  Wind,
  ThermometerSun,
  Info,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const RISK_HOURS = [
  { hour: "00:00", risk: "low", aqi: 48 },
  { hour: "01:00", risk: "low", aqi: 44 },
  { hour: "02:00", risk: "low", aqi: 41 },
  { hour: "03:00", risk: "low", aqi: 39 },
  { hour: "04:00", risk: "low", aqi: 38 },
  { hour: "05:00", risk: "low", aqi: 42 },
  { hour: "06:00", risk: "moderate", aqi: 56 },
  { hour: "07:00", risk: "moderate", aqi: 71 },
  { hour: "08:00", risk: "high", aqi: 94 },
  { hour: "09:00", risk: "high", aqi: 108 },
  { hour: "10:00", risk: "high", aqi: 112 },
  { hour: "11:00", risk: "moderate", aqi: 88 },
  { hour: "12:00", risk: "moderate", aqi: 76 },
  { hour: "13:00", risk: "moderate", aqi: 69 },
  { hour: "14:00", risk: "low", aqi: 61 },
  { hour: "15:00", risk: "low", aqi: 58 },
  { hour: "16:00", risk: "low", aqi: 60 },
  { hour: "17:00", risk: "moderate", aqi: 72 },
  { hour: "18:00", risk: "high", aqi: 96 },
  { hour: "19:00", risk: "high", aqi: 118 },
  { hour: "20:00", risk: "high", aqi: 124 },
  { hour: "21:00", risk: "moderate", aqi: 89 },
  { hour: "22:00", risk: "moderate", aqi: 74 },
  { hour: "23:00", risk: "low", aqi: 58 },
];

const riskColor: Record<string, string> = {
  low: "bg-emerald-500/80",
  moderate: "bg-amber-500/80",
  high: "bg-rose-500/80",
};

const riskLabel: Record<string, string> = {
  low: "Good",
  moderate: "Moderate",
  high: "Elevated",
};

export default function PredictionsPage() {
  const [selectedDay, setSelectedDay] = useState<"today" | "tomorrow" | "day3">("today");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                AI Forecast Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Air Quality Predictions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              72-hour forecasts based on historical patterns, meteorological data, and traffic cycles.
            </p>
          </div>

          {/* Day Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(["today", "tomorrow", "day3"] as const).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  selectedDay === day
                    ? "bg-white dark:bg-slate-900 shadow-sm font-bold text-brand-600 dark:text-brand-400"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {day === "today" ? "Today" : day === "tomorrow" ? "Tomorrow" : "Day 3"}
              </button>
            ))}
          </div>
        </div>

        {/* Model status notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
          <div>
            <span className="font-bold">Forecast Mode: Pattern-Based</span>
            <span className="ml-2">
              Predictions are generated from historical diurnal patterns and seasonality. Live ML model training
              is ongoing. Confidence range: ±15%.
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Peak AQI Today", value: "124", sub: "20:00–21:00 IST", icon: <TrendingUp className="w-4 h-4 text-rose-500" /> },
            { label: "Morning Rush Risk", value: "High", sub: "08:00–10:30 IST", icon: <AlertCircle className="w-4 h-4 text-amber-500" /> },
            { label: "Best Outdoor Time", value: "13:00–16:00", sub: "AQI ~58–69", icon: <Wind className="w-4 h-4 text-emerald-500" /> },
            { label: "Forecast Horizon", value: "72 hours", sub: "Pattern model", icon: <Clock className="w-4 h-4 text-brand-500" /> },
          ].map(({ label, value, sub, icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span></div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Trend Chart */}
        <ChartCard
          title="24-Hour AQI Forecast — Vandalur Corridor"
          subtitle="Pattern-based estimate. Dashed area = predicted range."
        >
          <div className="h-[280px] w-full">
            <AQITrendChart />
          </div>
        </ChartCard>

        {/* Hourly Risk Grid */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Hourly Risk Forecast — Today</h2>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
            {RISK_HOURS.map(({ hour, risk, aqi }) => (
              <div key={hour} className="flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-lg h-10 ${riskColor[risk]} flex items-center justify-center`}
                  title={`${hour}: AQI ${aqi} (${riskLabel[risk]})`}
                >
                  <span className="text-[9px] font-black text-white">{aqi}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400">{hour.split(":")[0]}h</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            {[["low", "Good (AQI < 70)"], ["moderate", "Moderate (70–100)"], ["high", "Elevated (> 100)"]].map(([risk, label]) => (
              <span key={risk} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded ${riskColor[risk]}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Health Guidance */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ThermometerSun className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Today&apos;s Activity Guidance</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                time: "Early Morning (04:00–06:00)",
                advice: "Best window for outdoor exercise. AQI expected to be in Good range (38–42).",
                color: "border-emerald-200 dark:border-emerald-800",
              },
              {
                time: "Afternoon (13:00–16:00)",
                advice: "Second-best window. Sea-breeze dispersion keeps pollution moderate. Good for walking.",
                color: "border-amber-200 dark:border-amber-800",
              },
              {
                time: "Peak Hours (08:00–10:30, 18:00–21:00)",
                advice: "Avoid prolonged outdoor exposure. Sensitive groups (children, elderly) should stay indoors.",
                color: "border-rose-200 dark:border-rose-800",
              },
            ].map(({ time, advice, color }) => (
              <div key={time} className={`p-4 rounded-xl border ${color} bg-slate-50 dark:bg-slate-800/40 text-xs`}>
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{time}</p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{advice}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Link to live data */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Want historical trends?</p>
            <p className="text-[11px] text-slate-500">Compare today&apos;s forecast against past observations.</p>
          </div>
          <Link
            href="/history"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition"
          >
            View History <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <PublicFooter />
      <BottomNavigation />
    </div>
  );
}

