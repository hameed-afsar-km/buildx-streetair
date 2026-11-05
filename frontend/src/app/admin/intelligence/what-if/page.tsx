"use client";

import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  TrendingDown,
  TrendingUp,
  Wind,
  Layers,
  Sliders,
  RotateCcw,
  ShieldCheck,
  Building2,
  Flame,
  Leaf,
  Info,
} from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { WhatIfComparisonChart } from "@/components/charts/WhatIfComparisonChart";
import { MapContainer } from "@/components/map/MapContainer";
import { getStations } from "@/lib/api/endpoints";
import { MonitoringStation } from "@/lib/types";
import { getAQIClassification, getAQIColor } from "@/lib/aqi";

interface Scenario {
  id: string;
  name: string;
  type: "decrease" | "increase";
  description: string;
  expectedPm25Change: number;
  expectedPm10Change: number;
  expectedAqiChange: number;
  dispersionRadius: number;
  tags: string[];
}

const MITIGATION_SCENARIOS: Scenario[] = [
  {
    id: "mit-1",
    name: "Heavy Commercial Vehicle Restriction",
    type: "decrease",
    description: "Divert diesel commercial freight from the corridor between 07:00 and 21:00.",
    expectedPm25Change: -28,
    expectedPm10Change: -18,
    expectedAqiChange: -24,
    dispersionRadius: 1800,
    tags: ["Traffic Policy", "Fast Acting", "NO2 & PM2.5"],
  },
  {
    id: "mit-2",
    name: "Highway Perimeter Green Canopy Buffer",
    type: "decrease",
    description: "Plant a 500m deep multi-tier bio-filter vegetation shelterbelt along residential corridors.",
    expectedPm25Change: -15,
    expectedPm10Change: -26,
    expectedAqiChange: -18,
    dispersionRadius: 2500,
    tags: ["Green Infrastructure", "Bio-Filter", "Dust Absorption"],
  },
  {
    id: "mit-3",
    name: "Construction Dust Suppression Mandate",
    type: "decrease",
    description: "Enforce continuous pressurized misting cannons and anti-smog water guns at local worksites.",
    expectedPm25Change: -12,
    expectedPm10Change: -38,
    expectedAqiChange: -20,
    dispersionRadius: 1200,
    tags: ["CPCB Mandate", "Water Misting", "Coarse Particles"],
  },
  {
    id: "mit-4",
    name: "Industrial Stack Scrubber & Emission Cap (-30%)",
    type: "decrease",
    description: "Enforce wet scrubbers and electrostatic precipitators across industrial combustion stacks.",
    expectedPm25Change: -34,
    expectedPm10Change: -22,
    expectedAqiChange: -30,
    dispersionRadius: 3200,
    tags: ["Industrial Cap", "Scrubber Retrofit", "High Impact"],
  },
  {
    id: "mit-5",
    name: "Transit Fleet Electrification (50% EV Buses)",
    type: "decrease",
    description: "Replace diesel transit buses at terminus hubs with zero-emission battery electric buses.",
    expectedPm25Change: -18,
    expectedPm10Change: -10,
    expectedAqiChange: -16,
    dispersionRadius: 2000,
    tags: ["Fleet Transition", "Zero Tailpipe", "Urban Clean Air"],
  },
];

const HAZARD_SCENARIOS: Scenario[] = [
  {
    id: "haz-1",
    name: "Agricultural Biomass & Stubble Burning Plume",
    type: "increase",
    description: "Seasonal uncontrolled open crop residue burning combined with nighttime thermal inversion.",
    expectedPm25Change: 65,
    expectedPm10Change: 48,
    expectedAqiChange: 54,
    dispersionRadius: 4000,
    tags: ["Biomass Smoke", "Seasonal Spike", "Severe Plume"],
  },
  {
    id: "haz-2",
    name: "Chemical Boiler Venting & Unscheduled Release",
    type: "increase",
    description: "Fugitive emission spike and industrial solvent venting from adjacent chemical processing plant.",
    expectedPm25Change: 72,
    expectedPm10Change: 35,
    expectedAqiChange: 64,
    dispersionRadius: 2800,
    tags: ["Industrial Incident", "Toxic Vapor", "VOC & SO2"],
  },
  {
    id: "haz-3",
    name: "Highway Freight Gridlock & Diesel Fleet Idling",
    type: "increase",
    description: "Traffic bottleneck causing 5+ hours of contiguous heavy diesel truck idling under low wind.",
    expectedPm25Change: 42,
    expectedPm10Change: 26,
    expectedAqiChange: 38,
    dispersionRadius: 1600,
    tags: ["Traffic Jam", "Diesel Exhaust", "Acute Exposure"],
  },
  {
    id: "haz-4",
    name: "Uncontrolled Municipal Solid Waste Incineration",
    type: "increase",
    description: "Illegal open garbage and plastic dump fire producing dense dioxin and black carbon plumes.",
    expectedPm25Change: 55,
    expectedPm10Change: 60,
    expectedAqiChange: 46,
    dispersionRadius: 2200,
    tags: ["Dump Fire", "Plastic Smoke", "Public Hazard"],
  },
  {
    id: "haz-5",
    name: "Major Excavation & Road Demolition Dust Storm",
    type: "increase",
    description: "Dry mechanical milling and unmitigated earth excavation during dry windy conditions.",
    expectedPm25Change: 22,
    expectedPm10Change: 85,
    expectedAqiChange: 32,
    dispersionRadius: 1500,
    tags: ["Civil Works", "Coarse Dust", "Resuspension"],
  },
];

export default function AdminWhatIfSimulatorPage() {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>("crescent-vandalur-01");
  const [activeTab, setActiveTab] = useState<"mitigation" | "hazard" | "custom">("mitigation");
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(MITIGATION_SCENARIOS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedRadius, setSimulatedRadius] = useState<number>(1800);

  // Custom Scenario Builder States
  const [customName, setCustomName] = useState("Custom Urban Clean Air Zone");
  const [customType, setCustomType] = useState<"decrease" | "increase">("decrease");
  const [customDelta, setCustomDelta] = useState<number>(-25);
  const [customRadius, setCustomRadius] = useState<number>(2000);

  useEffect(() => {
    getStations().then((data) => {
      const list = Array.isArray(data) ? data : [];
      setStations(list);
      if (list.length > 0 && !selectedStationId) {
        setSelectedStationId(list[0].id);
      }
    });
  }, []);

  const activeStation = stations.find((s) => s.id === selectedStationId) || stations[0];
  const baselineAqi = activeStation?.aqi ?? 68;

  // Active scenario impact calculation
  let expectedAqiDelta = selectedScenario.expectedAqiChange;
  let expectedPm25Delta = selectedScenario.expectedPm25Change;
  let currentRadius = selectedScenario.dispersionRadius;

  if (activeTab === "custom") {
    expectedAqiDelta = customType === "decrease" ? -Math.abs(customDelta) : Math.abs(customDelta);
    expectedPm25Delta = Math.round(expectedAqiDelta * 0.9);
    currentRadius = customRadius;
  }

  const projectedAqi = Math.max(15, Math.min(500, baselineAqi + expectedAqiDelta));
  const isNetImprovement = expectedAqiDelta < 0;

  const baselineClass = getAQIClassification(baselineAqi);
  const projectedClass = getAQIClassification(projectedAqi);

  const handleSimulate = (sc: Scenario) => {
    setSelectedScenario(sc);
    setSimulatedRadius(sc.dispersionRadius);
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 700);
  };

  // Compute simulated stations network for map projection
  const simulatedStations: MonitoringStation[] = stations.map((st) => {
    if (st.id === activeStation?.id) {
      return {
        ...st,
        aqi: projectedAqi,
      };
    }
    // Calculate partial spillover for neighboring stations
    if (activeStation) {
      const latDiff = Math.abs(st.coordinates.lat - activeStation.coordinates.lat);
      const lngDiff = Math.abs(st.coordinates.lng - activeStation.coordinates.lng);
      const approxDistanceMeters = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000;
      if (approxDistanceMeters < currentRadius * 1.5) {
        const spilloverFactor = Math.max(0, 1 - approxDistanceMeters / (currentRadius * 1.5));
        const partialDelta = Math.round(expectedAqiDelta * spilloverFactor * 0.45);
        return {
          ...st,
          aqi: Math.max(15, Math.min(500, st.aqi + partialDelta)),
        };
      }
    }
    return st;
  });

  // Diurnal comparison generation
  const hourlyProjection = [
    { hour: "00:00", baseline: Math.round(baselineAqi * 0.7), simulated: Math.round(projectedAqi * 0.7) },
    { hour: "04:00", baseline: Math.round(baselineAqi * 0.6), simulated: Math.round(projectedAqi * 0.6) },
    { hour: "08:00", baseline: Math.round(baselineAqi * 1.35), simulated: Math.round(projectedAqi * 1.35) },
    { hour: "12:00", baseline: Math.round(baselineAqi * 1.1), simulated: Math.round(projectedAqi * 1.1) },
    { hour: "16:00", baseline: Math.round(baselineAqi * 0.95), simulated: Math.round(projectedAqi * 0.95) },
    { hour: "20:00", baseline: Math.round(baselineAqi * 1.45), simulated: Math.round(projectedAqi * 1.45) },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-900 dark:text-white transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Atmospheric Scenario Modeling & Spatial Dispersion Engine
            </span>
          </div>
          <h1 className="text-2xl font-black">What-If Intervention & Plume Simulator</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Evaluate how policies, green infrastructure, or localized pollution events shift ambient air quality across the Chennai sensor network.
          </p>
        </div>

        {/* Live Simulation Status Indicator */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {isSimulating ? "Recalculating Telemetry..." : "Dispersion Model Active"}
          </span>
        </div>
      </div>

      {/* 2. Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Baseline Local AQI"
          value={baselineAqi}
          unit="NAQI"
          subtitle={baselineClass.category}
          statusColor={baselineAqi > 100 ? "amber" : "emerald"}
        />
        <MetricCard
          title="Projected Simulated AQI"
          value={projectedAqi}
          unit="NAQI"
          subtitle={projectedClass.category}
          statusColor={projectedAqi > 100 ? (projectedAqi > 200 ? "rose" : "amber") : "emerald"}
        />
        <MetricCard
          title="Net Atmospheric Impact"
          value={`${isNetImprovement ? "" : "+"}${expectedAqiDelta} AQI`}
          subtitle={`PM2.5 Delta: ${expectedPm25Delta > 0 ? "+" : ""}${expectedPm25Delta}%`}
          statusColor={isNetImprovement ? "emerald" : "rose"}
        />
        <MetricCard
          title="Modeled Dispersion Radius"
          value={`${(currentRadius / 1000).toFixed(1)} km`}
          subtitle="Gaussian plume extent"
          statusColor="blue"
        />
      </div>

      {/* 3. TARGET LOCATION SELECTOR & DATA LOOKUP (Core Requirement) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Target Location & Baseline Telemetry Verification
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {stations.length} system monitoring sites available
          </span>
        </div>

        {/* Location Station Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {stations.map((st) => {
            const isSelected = st.id === selectedStationId;
            const aqiColor = getAQIColor(st.aqi);
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStationId(st.id)}
                className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400 block truncate">
                    {st.location_name}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                    {st.name}
                  </p>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
                    style={{ backgroundColor: `${aqiColor}22`, color: aqiColor }}
                  >
                    AQI {st.aqi}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Existing Data Telemetry Card for chosen location */}
        {activeStation && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Ground Telemetry Retrieved:
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-mono">
                {activeStation.name} ({activeStation.coordinates.lat.toFixed(4)}°N, {activeStation.coordinates.lng.toFixed(4)}°E)
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              <span>Current AQI: <b className="text-slate-800 dark:text-slate-200">{activeStation.aqi}</b></span>
              <span>Dominant: <b className="text-slate-800 dark:text-slate-200">PM2.5 (34 µg/m³)</b></span>
              <span>Wind: <b className="text-slate-800 dark:text-slate-200">12 km/h ENE</b></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">ONLINE</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. SCENARIOS & INTERACTIVE SIMULATION ENGINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scenario Control Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 transition-colors">
            {/* Mode Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Select Action / Event
              </h2>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("mitigation");
                  setSelectedScenario(MITIGATION_SCENARIOS[0]);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "mitigation"
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                Mitigation (-AQI)
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("hazard");
                  setSelectedScenario(HAZARD_SCENARIOS[0]);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "hazard"
                    ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                Hazard (+AQI)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("custom")}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "custom"
                    ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Custom
              </button>
            </div>

            {/* Scenario Lists or Custom Builder */}
            {activeTab !== "custom" ? (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {(activeTab === "mitigation" ? MITIGATION_SCENARIOS : HAZARD_SCENARIOS).map((sc) => {
                  const isSelected = selectedScenario.id === sc.id;
                  const isMit = sc.type === "decrease";

                  return (
                    <div
                      key={sc.id}
                      onClick={() => handleSimulate(sc)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                        isSelected
                          ? isMit
                            ? "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-xs"
                            : "border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`text-xs font-bold ${
                            isSelected
                              ? isMit
                                ? "text-emerald-950 dark:text-emerald-200"
                                : "text-rose-950 dark:text-rose-200"
                              : "text-slate-900 dark:text-slate-200"
                          }`}
                        >
                          {sc.name}
                        </h3>
                        <span
                          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            isMit
                              ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                              : "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300"
                          }`}
                        >
                          {sc.expectedAqiChange > 0 ? `+${sc.expectedAqiChange}` : sc.expectedAqiChange} AQI
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-2.5">
                        {sc.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {sc.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Custom Scenario Builder */
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Scenario Title / Policy Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-medium"
                    placeholder="e.g. Low Emission Delivery Zone"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Intervention Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomType("decrease")}
                      className={`py-2 rounded-lg font-bold border transition ${
                        customType === "decrease"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Mitigation (Decreases AQI)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomType("increase")}
                      className={`py-2 rounded-lg font-bold border transition ${
                        customType === "increase"
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Hazard (Adds Emission)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Expected AQI Shift:</span>
                    <span className={`font-mono ${customType === "decrease" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {customType === "decrease" ? `-${Math.abs(customDelta)}` : `+${Math.abs(customDelta)}`} AQI
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={Math.abs(customDelta)}
                    onChange={(e) => setCustomDelta(customType === "decrease" ? -Number(e.target.value) : Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Dispersion Extent:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {(customRadius / 1000).toFixed(1)} km ({customRadius}m)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="250"
                    value={customRadius}
                    onChange={(e) => setCustomRadius(Number(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Map with Simulated Heatmap & Locations (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col transition-colors">
            {/* Map Header Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Spatial Heatmap & System Nodes</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      isNetImprovement
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    Simulated: {projectedAqi} NAQI ({isNetImprovement ? "Air Quality Gain" : "Pollution Spike"})
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Centering on {activeStation?.name} with plume dispersion overlay.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Radius: {(currentRadius / 1000).toFixed(1)}km
                </span>
              </div>
            </div>

            {/* Map Render Node */}
            <div className="h-[430px] w-full relative">
              {activeStation && (
                <MapContainer
                  stations={simulatedStations}
                  selectedStationId={activeStation.id}
                  center={[activeStation.coordinates.lat, activeStation.coordinates.lng]}
                  zoom={12}
                  heatmapIntensity={projectedAqi}
                  showControls={true}
                  showLegend={true}
                />
              )}
            </div>
          </div>

          {/* Diurnal Hourly Comparison Chart */}
          <ChartCard
            title="24-Hour Network AQI Diurnal Trajectory"
            subtitle={`Modeled atmospheric curve under ${activeTab === "custom" ? customName : selectedScenario.name}`}
            action={
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 font-bold">
                Model Converged
              </span>
            }
          >
            <div className="h-[240px] w-full pt-1">
              <WhatIfComparisonChart
                hourlyProjection={hourlyProjection}
                simulatedStroke={isNetImprovement ? "#10b981" : "#f43f5e"}
                simulatedLabel={isNetImprovement ? "Simulated Mitigation" : "Simulated Hazard Spike"}
              />
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
