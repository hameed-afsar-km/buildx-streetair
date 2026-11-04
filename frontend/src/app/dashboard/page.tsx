"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useLiveWebSocket } from "@/hooks/useLiveWebSocket";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { StationStatus } from "@/components/ui/StationStatus";
import { FreshnessIndicator } from "@/components/ui/FreshnessIndicator";
import { LiveWebSocketIndicator } from "@/components/ui/LiveWebSocketIndicator";
import { ScenarioSelector } from "@/components/ui/ScenarioSelector";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { AQITrendChart } from "@/components/charts/AQITrendChart";
import { PollutantBreakdownChart } from "@/components/charts/PollutantBreakdownChart";
import { MapContainer } from "@/components/map/MapContainer";
import { getAQIClassification } from "@/lib/aqi";
import { SCENARIO_DEFINITIONS } from "@/lib/scenarios";
import {
  getStations,
  getReadingHistory,
  getAlerts,
  getIncidents,
} from "@/lib/api/endpoints";
import {
  MonitoringStation,
  ReadingHistoryPoint,
  EnvironmentalAlert,
  EnvironmentalIncident,
} from "@/lib/types";
import {
  MapPin,
  Wind,
  Droplets,
  Gauge,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Radio,
  FilePlus,
  Compass,
  Cpu,
} from "lucide-react";

export default function PublicDashboardPage() {
  const { reading, connectionStatus, lastUpdateTime, triggerScenario } = useLiveWebSocket();

  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [history, setHistory] = useState<ReadingHistoryPoint[]>([]);
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [incidents, setIncidents] = useState<EnvironmentalIncident[]>([]);
  const [activeTab, setActiveTab] = useState<"trend" | "breakdown">("trend");

  useEffect(() => {
    getStations().then(setStations);
    getReadingHistory("crescent-vandalur-01").then(setHistory);
    getAlerts(true).then(setAlerts);
    getIncidents().then(setIncidents);
  }, []);

  const currentAqi = reading?.aqi || 34;
  const classification = getAQIClassification(currentAqi);
  const activeScenarioDef = SCENARIO_DEFINITIONS[reading?.scenario || "scenario_1_normal"];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Operational Status Banner */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                  Primary Demonstration Site
                </span>
                <StationStatus status="online" size="sm" />
                <DataSourceBadge
                  source={reading?.source || "SIMULATED"}
                  dataStatus={reading?.data_status || "LIVE"}
                  size="sm"
                />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                Crescent Institute Campus Beacon
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>
                  B.S. Abdur Rahman Crescent Institute of Science and Technology, GST Road,
                  Vandalur, Tamil Nadu (12.8797° N, 80.0833° E)
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <LiveWebSocketIndicator
                status={connectionStatus}
                lastUpdated={lastUpdateTime}
              />
              <Link
                href="/app/reports/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
              >
                <FilePlus className="w-4 h-4" />
                <span>Report Pollution Concern</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 9-Scenario Keypad Simulator Component */}
        <ScenarioSelector
          activeScenario={reading?.scenario || "scenario_1_normal"}
          onSelectScenario={triggerScenario}
        />

        {/* Main Telemetry & AQI Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Big AQI Metric & Health Advisory (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Continuous Air Quality Index
                  </span>
                  <FreshnessIndicator timestamp={reading?.timestamp || new Date()} />
                </div>

                <div className="flex items-baseline gap-4 my-2">
                  <span className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                    {currentAqi}
                  </span>
                  <div>
                    <AQIBadge aqi={currentAqi} size="lg" />
                    <span className="block text-xs text-slate-400 font-mono mt-1">
                      Dominant: <strong>{activeScenarioDef.dominantPollutant}</strong>
                    </span>
                  </div>
                </div>

                <div className="my-5 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                    Health Advisory:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {classification.advisory}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">
                    <strong>Activity Guideline:</strong> {classification.activityRecommendation}
                  </p>
                </div>
              </div>

              {/* Hardware / ESP32 Sensor Specs */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-brand-600" />
                    Ingestion Protocol
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    ESP32 Telemetry Engine
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-purple-600" />
                    Keypad Scenario Simulation
                  </span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                    Scenario #{activeScenarioDef.number} ({activeScenarioDef.name})
                  </span>
                </div>
              </div>
            </div>

            {/* Environmental Weather Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center">
                <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 font-mono block">Temperature</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {reading?.weather.temperature ?? 29.2} °C
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center">
                <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 font-mono block">Humidity</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {reading?.weather.humidity ?? 62.0} %
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center">
                <Wind className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 font-mono block">Wind Speed</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {reading?.weather.wind_speed ?? 12.8} km/h
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center">
                <Gauge className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 font-mono block">Pressure</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {reading?.weather.pressure ?? 1012.4} hPa
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Pollutant Metrics & Chart (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pollutants Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricCard
                title="PM2.5 (Fine Dust)"
                value={reading?.pollutants.pm25.value ?? 11.2}
                unit="µg/m³"
                subtitle="Safe limit: 60 µg/m³"
                statusColor="emerald"
                badge={<span className="text-[10px] font-mono font-bold">Sub-AQI: {reading?.pollutants.pm25.sub_index || 34}</span>}
              />
              <MetricCard
                title="PM10 (Coarse Dust)"
                value={reading?.pollutants.pm10.value ?? 24.5}
                unit="µg/m³"
                subtitle="Safe limit: 100 µg/m³"
                statusColor="emerald"
                badge={<span className="text-[10px] font-mono font-bold">Sub-AQI: {reading?.pollutants.pm10.sub_index || 24}</span>}
              />
              <MetricCard
                title="NO2 (Combustion)"
                value={reading?.pollutants.no2.value ?? 12.0}
                unit="ppb"
                subtitle="Safe limit: 80 ppb"
                statusColor="blue"
                badge={<span className="text-[10px] font-mono font-bold">Sub-AQI: {reading?.pollutants.no2.sub_index || 18}</span>}
              />
              <MetricCard
                title="SO2 (Industrial)"
                value={reading?.pollutants.so2.value ?? 4.2}
                unit="ppb"
                subtitle="Safe limit: 80 ppb"
                statusColor="purple"
              />
              <MetricCard
                title="CO (Carbon Monoxide)"
                value={reading?.pollutants.co.value ?? 0.35}
                unit="ppm"
                subtitle="Safe limit: 2.0 ppm"
                statusColor="slate"
              />
              <MetricCard
                title="O3 (Tropospheric)"
                value={reading?.pollutants.o3.value ?? 22.0}
                unit="ppb"
                subtitle="Safe limit: 100 ppb"
                statusColor="amber"
              />
            </div>

            {/* Historical Trend or Pollutant Breakdown Chart */}
            <ChartCard
              title="24-Hour Diurnal Telemetry Profile"
              description="Continuous atmospheric observations captured at the Crescent Institute station."
              action={
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("trend")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      activeTab === "trend"
                        ? "bg-white dark:bg-slate-900 shadow-xs text-brand-600 dark:text-brand-400 font-bold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    AQI Trend
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("breakdown")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      activeTab === "breakdown"
                        ? "bg-white dark:bg-slate-900 shadow-xs text-brand-600 dark:text-brand-400 font-bold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Sub-Index Comparison
                  </button>
                </div>
              }
              footer={
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>Standard Reference: Indian National Air Quality Index (NAQI).</span>
                  <Link
                    href="/history"
                    className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>Full Historical Explorer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              }
            >
              {activeTab === "trend" ? (
                <AQITrendChart data={history} height={260} />
              ) : reading ? (
                <PollutantBreakdownChart pollutants={reading.pollutants} height={260} />
              ) : null}
            </ChartCard>
          </div>
        </div>

        {/* Embedded Interactive Map & Spatial Grid Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Regional Monitoring Mesh & Estimated Dispersion
              </h2>
              <p className="text-xs text-slate-500">
                Spatial station markers and interpolated heatmap across the Vandalur - Kilambakkam -
                Chengalpattu transit corridor.
              </p>
            </div>
            <Link
              href="/map"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
            >
              <span>Full Screen Spatial Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-[460px] w-full rounded-2xl overflow-hidden shadow-sm">
            <MapContainer
              stations={stations}
              selectedStationId="crescent-vandalur-01"
              center={[12.8797, 80.0833]}
              zoom={13}
            />
          </div>
        </div>

        {/* Active Alerts & Incidents Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Alerts */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Active Environmental Advisories
                </h3>
              </div>
              <Link href="/alerts" className="text-xs font-bold text-brand-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No active alerts.</p>
              ) : (
                alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {alt.title}
                      </span>
                      <span className="font-mono text-[10px] uppercase font-bold text-amber-600">
                        {alt.severity}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{alt.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span>Station: {alt.station_name}</span>
                      <span>Observed: {alt.value} {alt.unit}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Environmental Incidents */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tracked Pollution Incidents
                </h3>
              </div>
              <Link href="/incidents" className="text-xs font-bold text-brand-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {incidents.slice(0, 2).map((inc) => (
                <div
                  key={inc.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {inc.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                      {inc.status}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                    {inc.root_cause_hypothesis}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>Peak AQI: {inc.peak_aqi}</span>
                    <span>Confidence: {Math.round(inc.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

