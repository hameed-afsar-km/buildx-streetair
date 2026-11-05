"use client";

import React, { useState, useEffect } from "react";
import { getIncidents, getStations } from "@/lib/api/endpoints";
import { EnvironmentalIncident, MonitoringStation } from "@/lib/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Bot,
  Zap,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  ChevronRight,
  Loader2,
  Info,
} from "lucide-react";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface InvestigationResult {
  sourceCategory: string;
  confidence: number;
  evidence: { label: string; detail: string }[];
  recommendations: string[];
  stationName: string;
  timeWindow: string;
  analyzedAt: string;
}

type TimeWindow = "1h" | "6h" | "24h" | "7d";

const TIME_WINDOW_OPTIONS: { label: string; value: TimeWindow }[] = [
  { label: "Last 1h", value: "1h" },
  { label: "Last 6h", value: "6h" },
  { label: "Last 24h", value: "24h" },
  { label: "Last 7d", value: "7d" },
];

// Mock result generator — in production this calls the AI endpoint
function generateMockResult(stationName: string, timeWindow: TimeWindow): InvestigationResult {
  return {
    sourceCategory: "Vehicular Traffic Emissions",
    confidence: 87,
    evidence: [
      {
        label: "PM2.5 / PM10 Ratio",
        detail: "Ratio of 0.78 is consistent with fine particulate signatures from diesel exhaust combustion (typical range 0.70–0.85).",
      },
      {
        label: "Temporal Pattern Match",
        detail: `Peak concentrations align with morning (08:00–10:00) and evening (18:00–21:00) traffic rush periods at the ${stationName} corridor.`,
      },
      {
        label: "Source Signature Match",
        detail: "Elemental carbon-to-organic carbon ratio of 0.42 matches roadside receptor datasets from GST Road monitoring archives.",
      },
      {
        label: "Wind Vector Correlation",
        detail: "ENE wind at 12 km/h correlates observed plume dispersion with the GST Road mainline at 850m bearing.",
      },
    ],
    recommendations: [
      "Deploy mobile CPCB-grade sensor at Kilambakkam junction to refine source apportionment confidence above 92%.",
      "Issue advisory to Tambaram Municipal Corporation for enhanced dust suppression on road construction zones between 06:00–09:00.",
      "Coordinate with RTO for high-emission vehicle checks at Vandalur toll plaza during peak hours.",
    ],
    stationName,
    timeWindow,
    analyzedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function InvestigationPage() {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [incidents, setIncidents] = useState<EnvironmentalIncident[]>([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("24h");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<InvestigationResult | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStations(true);
      try {
        const [stationData, incidentData] = await Promise.all([
          getStations(),
          getIncidents(),
        ]);
        setStations(stationData);
        setIncidents(incidentData);
        if (stationData.length > 0) setSelectedStation(stationData[0].id);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoadingStations(false);
      }
    };
    fetchData();
  }, []);

  const handleRunInvestigation = async () => {
    if (!selectedStation) return;
    setIsRunning(true);
    setResult(null);
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const station = stations.find((s) => s.id === selectedStation);
    setResult(generateMockResult(station?.name ?? selectedStation, timeWindow));
    setIsRunning(false);
  };

  const activeIncidents = incidents.filter((i) => i.status !== "resolved").length;

  return (
    <div className="space-y-6">
      {/* ── Header Banner ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm text-slate-900 dark:text-white transition-colors">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              AI-Powered Source Apportionment Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Pollution Detective &amp; Source Apportionment
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            AI-driven root cause analysis of pollution incidents — identifies emission sources,
            correlates sensor signatures, and recommends targeted mitigations.
          </p>
        </div>
      </div>

      {/* â”€â”€ Metric Cards â”€â”€ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Active Incidents"
          value={activeIncidents}
          subtitle="Pending root-cause closure"
          icon={<ShieldAlert className="w-4 h-4" />}
          statusColor="rose"
        />
        <MetricCard
          title="Avg Confidence Score"
          value="87%"
          subtitle="Source apportionment accuracy"
          icon={<CheckCircle2 className="w-4 h-4" />}
          statusColor="purple"
        />
        <MetricCard
          title="Source Categories"
          value={6}
          subtitle="Classified emission profiles"
          icon={<Zap className="w-4 h-4" />}
          statusColor="amber"
        />
      </div>

      {/* â”€â”€ Main Two-Column Layout â”€â”€ */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* â”€â”€ Left: Investigation Trigger Panel â”€â”€ */}
        <div className="lg:w-5/12 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors/90 p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Configure Investigation</h2>
            </div>

            {/* Station Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Monitoring Station
              </label>
              {loadingStations ? (
                <LoadingSkeleton className="h-10 w-full rounded-xl" />
              ) : (
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                >
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.location_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Time Window */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Analysis Time Window
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_WINDOW_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTimeWindow(opt.value)}
                    className={`py-2 rounded-lg text-xs font-bold transition border ${
                      timeWindow === opt.value
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunInvestigation}
              disabled={isRunning || !selectedStation}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold text-sm transition shadow-md shadow-emerald-500/20"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Sources…
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  Run Investigation
                </>
              )}
            </button>

            {/* Informational Note */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">What the AI analyzes</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                  PM2.5/PM10 mass ratios and size distribution signatures
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Temporal concentration patterns vs traffic/industrial cycles
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Wind vector correlation and receptor modeling
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Chemical fingerprint matching against 6 source categories
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* â”€â”€ Right: Results Panel â”€â”€ */}
        <div className="lg:w-7/12">
          {isRunning ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors/90 p-6 space-y-4">
              <LoadingSkeleton className="h-6 w-56 rounded-lg" />
              <LoadingSkeleton className="h-16 w-full rounded-xl" />
              <LoadingSkeleton className="h-40 w-full rounded-xl" />
              <LoadingSkeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : result ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors/90 p-5 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-violet-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Investigation Results</h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {result.analyzedAt} IST
                </div>
              </div>

              {/* Source Classification Card */}
              <div className="rounded-xl border border-violet-200 dark:border-violet-800/40 bg-violet-50 dark:bg-violet-950/20 p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs text-violet-700 dark:text-violet-400 font-semibold uppercase tracking-wider mb-1">
                      Primary Source Classification
                    </p>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{result.sourceCategory}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {result.stationName} · {result.timeWindow} window
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black font-mono text-violet-700 dark:text-violet-300">
                      {result.confidence}%
                    </span>
                    <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold uppercase tracking-wider">
                      Confidence
                    </span>
                  </div>
                </div>
                {/* Confidence Bar */}
                <div className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-400 transition-all duration-700"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              {/* Supporting Evidence */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Supporting Evidence</h4>
                </div>
                <div className="space-y-2.5">
                  {result.evidence.map((ev, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3.5"
                    >
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{ev.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{ev.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recommended Actions</h4>
                </div>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center text-[10px] font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/40 bg-slate-50 dark:bg-slate-800/30 px-4 py-2.5 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  AI analysis is indicative and based on sensor telemetry pattern matching. Field
                  verification and manual source inspection are required before regulatory action.
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No Investigation Running"
              description="Configure a monitoring station and time window, then click 'Run Investigation' to trigger AI-powered source apportionment analysis."
              icon={<Bot className="w-6 h-6" />}
              className="h-full min-h-[400px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}




