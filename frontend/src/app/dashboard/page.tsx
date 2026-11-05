"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BellRing,
  CloudSun,
  FileWarning,
  Gauge,
  MapPin,
  Radio,
  Wind,
  Layers,
  Eye,
  Sparkles,
} from "lucide-react";
import { MapContainer } from "@/components/map/MapContainer";
import { MapLegend } from "@/components/map/MapLegend";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { BottomNavigation } from "@/components/ui/BottomNavigation";
import { AssistantDock } from "@/components/ui/AssistantDock";
import { useLiveWebSocket } from "@/hooks/useLiveWebSocket";
import { getAlerts, getStations } from "@/lib/api/endpoints";
import { EnvironmentalAlert, MonitoringStation } from "@/lib/types";
import { getAQIClassification } from "@/lib/aqi";

export default function PublicDashboardPage() {
  const { reading, connectionStatus, lastUpdateTime } = useLiveWebSocket();
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    getStations().then((data) => setStations(Array.isArray(data) ? data : []));
    getAlerts(true).then((data) => setAlerts(Array.isArray(data) ? data : []));
  }, []);

  const aqi = reading?.aqi ?? 68;
  const health = getAQIClassification(aqi);

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white flex flex-col">
      {/* 1. UNIFIED PUBLIC HEADER: Contains Brand, Nav Links, Live Station Badge, Report Button & Theme Switcher */}
      <PublicHeader />

      <main className="relative flex-1 min-h-[calc(100vh-4rem)]">
        {/* Full-screen Leaflet Map without internal colliding overlays */}
        <div className="absolute inset-0">
          <MapContainer
            stations={stations}
            selectedStationId="crescent-vandalur-01"
            center={[12.8797, 80.0833]}
            zoom={11}
            showControls={false}
            showLegend={false}
          />
        </div>

        {/* 2. LIVE AIR QUALITY HUD CARD: Top-Left, cleanly positioned without overlapping header */}
        <section
          id="air-guide"
          className="absolute left-4 top-4 z-20 w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-xl backdrop-blur-md transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                Live Near You
              </p>
              <h1 className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                Vandalur · Chennai, India
              </h1>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                GST Road Monitoring Corridor
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black leading-none text-slate-900 dark:text-white">{aqi}</p>
              <p className="mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                {health.category}
              </p>
            </div>
          </div>

          <div className="mt-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-3 text-xs">
            <p className="font-bold text-slate-900 dark:text-slate-100">Today&apos;s Air Guidance</p>
            <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
              {health.activityRecommendation}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-800/40">
              <Gauge className="mx-auto h-4 w-4 text-violet-600 dark:text-violet-400" />
              <b className="mt-1 block text-slate-900 dark:text-slate-100">PM2.5</b>
              <span className="text-slate-500 dark:text-slate-400">
                {reading?.pollutants.pm25.value ?? 28} µg/m³
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-800/40">
              <CloudSun className="mx-auto h-4 w-4 text-orange-500 dark:text-orange-400" />
              <b className="mt-1 block text-slate-900 dark:text-slate-100">Weather</b>
              <span className="text-slate-500 dark:text-slate-400">
                {reading?.weather.temperature ?? 29}°C
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-800/40">
              <Radio className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <b className="mt-1 block text-slate-900 dark:text-slate-100">Network</b>
              <span className="text-slate-500 dark:text-slate-400">
                {stations.length || 1} sites
              </span>
            </div>
          </div>

          {/* Map Layer Selector integrated cleanly inside HUD card */}
          <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              <Layers className="w-3.5 h-3.5" />
              Map Layers:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Stations
              </span>
              <button
                type="button"
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                  showHeatmap
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                }`}
              >
                Heatmap (Est.)
              </button>
            </div>
          </div>
        </section>

        {/* 3. ACTIVE ADVISORY CARD (Bottom-Left) */}
        <section className="absolute bottom-6 left-4 z-20 hidden w-80 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md lg:block transition-colors">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-xs font-bold text-slate-900 dark:text-white">Active Advisory</p>
          </div>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
            {alerts[0]?.message || "Air quality within standard permissible thresholds in this monitoring zone."}
          </p>
          <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
            Updated {lastUpdateTime ? new Date(lastUpdateTime).toLocaleTimeString("en-IN") : "from live cache"}
          </p>
        </section>

        {/* 4. INDIA NATIONAL AQI SCALE LEGEND (Bottom-Right) */}
        <div className="absolute bottom-6 right-4 z-20 hidden sm:block max-w-xs">
          <MapLegend />
        </div>
      </main>

      {/* Assistant Dock & Bottom Navigation */}
      <AssistantDock />
      <BottomNavigation />
    </div>
  );
}
