"use client";

import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  X,
  Layers,
  Eye,
  RefreshCw,
  Radar,
  Radio,
  Flame,
  Construction,
  Factory,
  Wind,
  CheckCircle2,
  AlertTriangle,
  Play,
  Activity,
  Compass,
} from "lucide-react";
import { NeighborhoodMeshScanner } from "@/components/dashboard/NeighborhoodMeshScanner";
import { broadcastCitizenReport } from "@/lib/citizenReportBroadcast";

interface MapSettingsDockProps {
  showHeatmap: boolean;
  onToggleHeatmap: (val: boolean) => void;
  showStations?: boolean;
  onToggleStations?: (val: boolean) => void;
  onRecenter?: () => void;
  currentAqi?: number;
}

const SCENARIOS = [
  {
    key: "scenario_1_normal",
    num: "1",
    label: "Normal Air Quality",
    aqi: 34,
    cat: "Good",
    icon: Wind,
    desc: "Baseline diurnal cycle. Coastal sea breeze dispersing GST road particulates.",
  },
  {
    key: "scenario_2_traffic",
    num: "2",
    label: "Traffic Congestion & Inversion",
    aqi: 112,
    cat: "Moderate",
    icon: Activity,
    desc: "Evening rush hour gridlock along Tambaram-Vandalur corridor with thermal inversion.",
  },
  {
    key: "scenario_3_construction",
    num: "3",
    label: "Construction Dust Surge",
    aqi: 145,
    cat: "Moderate",
    icon: Construction,
    desc: "Heavy coarse dust from highway widening and KCBT bus terminus works.",
  },
  {
    key: "scenario_4_industrial",
    num: "4",
    label: "SIPCOT Industrial Inversion",
    aqi: 185,
    cat: "Poor",
    icon: Factory,
    desc: "Stagnant atmospheric boundary layer trapping industrial plume over GST highway.",
  },
  {
    key: "scenario_9_extreme",
    num: "9",
    label: "Extreme Air Quality Emergency",
    aqi: 310,
    cat: "Severe",
    icon: Flame,
    desc: "Multiple localized biomass fires compounded by severe winter temperature inversion.",
  },
];

export function MapSettingsDock({
  showHeatmap,
  onToggleHeatmap,
  showStations = true,
  onToggleStations,
  onRecenter,
  currentAqi = 68,
}: MapSettingsDockProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"layers" | "simulation">("simulation");
  const [selectedScenario, setSelectedScenario] = useState("scenario_1_normal");
  const [showMeshScanner, setShowMeshScanner] = useState(false);

  // Trigger scenario switch
  const handleApplyScenario = (scenarioKey: string) => {
    setSelectedScenario(scenarioKey);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("streetair:scenario_changed", {
          detail: { scenario: scenarioKey },
        })
      );
    }
    // If selecting an elevated scenario, auto-open the neighborhood scanning simulation and broadcast to admin dashboard
    if (scenarioKey !== "scenario_1_normal") {
      setShowMeshScanner(true);
      const scObj = SCENARIOS.find((s) => s.key === scenarioKey);
      if (scObj) {
        broadcastCitizenReport({
          id: `sim-sc-${Date.now()}`,
          category: scObj.key.replace("scenario_", ""),
          categoryLabel: `Simulated Hazard: ${scObj.label}`,
          address: "Crescent Campus - Vandalur Corridor (Simulation)",
          description: scObj.desc,
          timestamp: new Date().toISOString(),
          severity: scObj.aqi > 250 ? "critical" : scObj.aqi > 140 ? "high" : "medium",
          reporterName: "Public Dashboard Simulator",
          isSimulation: true,
        });
      }
    }
  };

  return (
    <>
      {/* Floating Settings FAB — Positioned directly above the Chatbot icon */}
      <aside className="fixed bottom-26 right-8 sm:bottom-27 sm:right-9 z-50 flex flex-col items-end select-none">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Map and Simulation Settings"
          title="Map & Simulation Settings"
          className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-md cursor-pointer hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          {open ? (
            <X className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <SlidersHorizontal className="h-5 w-5 transition-transform duration-200 group-hover:rotate-45" />
          )}

          {/* Micro active indicator badge */}
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </span>
        </button>
      </aside>

      {/* Settings & Simulation Modal Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black flex items-center gap-2">
                    Simulation & Map Settings
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold uppercase">
                      Interactive Mesh
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure atmospheric layers, trigger environmental scenarios, and simulate neighborhood scanning.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("simulation")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
                  activeTab === "simulation"
                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Radar className="w-4 h-4" />
                <span>Simulation & Neighborhood Scan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("layers")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
                  activeTab === "layers"
                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Atmospheric Layers & Display</span>
              </button>
            </div>

            {/* TAB 1: SIMULATION & NEIGHBORHOOD SCAN */}
            {activeTab === "simulation" && (
              <div className="mt-5 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Select Environmental Scenario to Simulate
                    </label>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Synced with ESP32 Hardware Keypad
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SCENARIOS.map((sc) => {
                      const Icon = sc.icon;
                      const isSelected = selectedScenario === sc.key;
                      return (
                        <button
                          key={sc.key}
                          type="button"
                          onClick={() => handleApplyScenario(sc.key)}
                          className={`text-left p-3 rounded-2xl border transition flex flex-col justify-between ${
                            isSelected
                              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold flex items-center justify-center text-slate-700 dark:text-slate-300">
                                #{sc.num}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {sc.label}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                sc.aqi > 100
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              }`}
                            >
                              AQI {sc.aqi}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            {sc.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Autonomous Neighborhood Scanning Visualization */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Radar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Autonomous Neighborhood Mesh Scanner
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMeshScanner(!showMeshScanner)}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {showMeshScanner ? "Hide Scanner Details" : "View Live Triangulation"}
                    </button>
                  </div>

                  {showMeshScanner ? (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                      <NeighborhoodMeshScanner originAqi={currentAqi} />
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center space-y-2">
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        When any station in the mesh detects an elevated AQI, it automatically pings and triangulates the <strong>8 nearest radial stations</strong> (Kilambakkam, Vandalur Zoo, Urapakkam, Perungalathur, Tambaram, etc.).
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowMeshScanner(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Run Neighborhood Scanning Simulation</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ATMOSPHERIC LAYERS & DISPLAY */}
            {activeTab === "layers" && (
              <div className="mt-5 space-y-4">
                {/* Heatmap Toggle */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-500" />
                      Atmospheric Dispersion Heatmap (Est.)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Renders continuous two-tier Gaussian dispersion field across all 60 Tamil Nadu stations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleHeatmap(!showHeatmap)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      showHeatmap ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showHeatmap ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Stations Toggle */}
                {onToggleStations && (
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Radio className="w-4 h-4 text-emerald-500" />
                        Sensor Station Beacon Markers
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Displays individual station pins with real-time AQI values and pulsing indicators.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleStations(!showStations)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        showStations ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showStations ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Recenter View */}
                {onRecenter && (
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Compass className="w-4 h-4 text-blue-500" />
                        Recenter to Crescent Institute Epicenter
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Reset zoom and center to B.S. Abdur Rahman Crescent Institute, Vandalur (12.8797°N, 80.0833°E).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onRecenter();
                        setOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                    >
                      Recenter View
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

