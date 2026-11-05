"use client";

import React, { useState } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { AQITrendChart } from "@/components/charts/AQITrendChart";
import {
  TrendingUp,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Cpu,
  Layers,
  ChevronRight,
} from "lucide-react";

interface ModelEntry {
  id: string;
  name: string;
  type: string;
  version: string;
  status: "ACTIVE" | "TRAINING" | "STANDBY";
  accuracy: string;
  lastTrained: string;
  description: string;
}

const MODELS: ModelEntry[] = [
  {
    id: "mdl-01",
    name: "AQI-LSTM-v2",
    type: "Time Series Forecast",
    version: "2.1.0",
    status: "ACTIVE",
    accuracy: "94.2%",
    lastTrained: "2026-11-01",
    description: "Bi-directional multi-horizon LSTM predicting PM2.5 and AQI trajectories up to 72 hours.",
  },
  {
    id: "mdl-02",
    name: "Source-Apportionment-RF",
    type: "Source Classification",
    version: "1.3.2",
    status: "ACTIVE",
    accuracy: "87.8%",
    lastTrained: "2026-10-28",
    description: "Random Forest ensemble identifying combustion, diesel exhaust, and biomass signatures.",
  },
  {
    id: "mdl-03",
    name: "Anomaly-IsolForest",
    type: "Outlier Detection",
    version: "1.1.0",
    status: "ACTIVE",
    accuracy: "91.5%",
    lastTrained: "2026-11-03",
    description: "Isolation Forest isolating hardware sensor drift and abrupt localized micro-plumes.",
  },
];

const DIURNAL_HEATMAP = [
  { time: "00:00", risk: "low", aqi: 45 },
  { time: "02:00", risk: "low", aqi: 41 },
  { time: "04:00", risk: "low", aqi: 38 },
  { time: "06:00", risk: "moderate", aqi: 56 },
  { time: "08:00", risk: "high", aqi: 94 },
  { time: "10:00", risk: "high", aqi: 112 },
  { time: "12:00", risk: "moderate", aqi: 76 },
  { time: "14:00", risk: "low", aqi: 61 },
  { time: "16:00", risk: "low", aqi: 60 },
  { time: "18:00", risk: "high", aqi: 96 },
  { time: "20:00", risk: "high", aqi: 124 },
  { time: "22:00", risk: "moderate", aqi: 74 },
];

export default function AdminPredictionsPage() {
  const [models, setModels] = useState<ModelEntry[]>(MODELS);
  const [retrainingId, setRetrainingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRetrain = (id: string, name: string) => {
    setRetrainingId(id);
    setFeedback(`Queued continuous learning job for ${name} across recent 168-hour hypertable...`);
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "TRAINING" } : m))
    );

    setTimeout(() => {
      setRetrainingId(null);
      setModels((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                status: "ACTIVE",
                lastTrained: new Date().toISOString().split("T")[0],
              }
            : m
        )
      );
      setFeedback(`Model ${name} retrained and weights updated on FastAPI inference cluster.`);
      setTimeout(() => setFeedback(null), 3500);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-900 dark:text-white transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
              Machine Learning Telemetry & Inference Registry
            </span>
          </div>
          <h1 className="text-2xl font-black">Predictive Environmental Intelligence</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Forecasting models, 72-hour air quality horizons, diurnal cycle models, and edge retrain pipelines.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Forecast Horizon"
          value="72 Hours"
          subtitle="Multi-step recursive"
          statusColor="purple"
        />
        <MetricCard
          title="Primary Accuracy"
          value="94.2%"
          subtitle="LSTM-v2 validation score"
          statusColor="emerald"
        />
        <MetricCard
          title="Peak Risk Window"
          value="18:00–21:00"
          subtitle="Expected tonight (AQI ~124)"
          statusColor="rose"
        />
        <MetricCard
          title="Active Model Fleet"
          value="3 Online"
          subtitle="FastAPI inference nodes"
          statusColor="blue"
        />
      </div>

      {/* Forecast Chart */}
      <ChartCard
        title="72-Hour AQI Trajectory Forecast — Vandalur Corridor"
        subtitle="Solid line indicates recorded ground truth; dashed region projects atmospheric dispersion."
      >
        <div className="h-[280px] w-full pt-2">
          <AQITrendChart />
        </div>
      </ChartCard>

      {/* Model Registry Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          Production Model Deployments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors p-5 flex flex-col justify-between shadow-sm space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">
                    {m.type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      m.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{m.description}</p>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Validation:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{m.accuracy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Version:</span>
                    <span className="text-slate-700 dark:text-slate-300">{m.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Trained:</span>
                    <span className="text-slate-700 dark:text-slate-300">{m.lastTrained}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRetrain(m.id, m.name)}
                  disabled={retrainingId === m.id}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${retrainingId === m.id ? "animate-spin" : ""}`} />
                  <span>{retrainingId === m.id ? "Retraining..." : "Retrain Weights"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Risk Diurnal Cycle Breakdown */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Diurnal Emission Rhythms & Risk Distribution (Chennai Region)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">CPCB NAQI Scaled</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 text-center text-xs">
          {DIURNAL_HEATMAP.map((d) => (
            <div
              key={d.time}
              className={`p-2.5 rounded-xl border ${
                d.risk === "high"
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                  : d.risk === "moderate"
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                  : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              <span className="block font-mono text-[10px] text-slate-400">{d.time}</span>
              <span className="block text-sm font-black my-0.5">{d.aqi}</span>
              <span className="block text-[9px] font-bold uppercase">{d.risk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




