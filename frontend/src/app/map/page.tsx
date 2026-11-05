"use client";

import React, { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { MapContainer } from "@/components/map/MapContainer";
import { getStations } from "@/lib/api/endpoints";
import { MonitoringStation } from "@/lib/types";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { Filter, Info, MapPin } from "lucide-react";

export default function MapPage() {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [filterSource, setFilterSource] = useState<string>("all");
  const [selectedStationId, setSelectedStationId] = useState<string | undefined>(undefined);

  useEffect(() => {
    getStations().then(setStations);
    const handleUpdate = () => {
      getStations().then(setStations);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("streetair:scenario_changed", handleUpdate);
      return () => window.removeEventListener("streetair:scenario_changed", handleUpdate);
    }
  }, []);

  const filteredStations = stations.filter((s) => {
    if (filterSource !== "all" && s.source !== filterSource) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Header & Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Interactive Environmental Telemetry Map
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold">
                {filteredStations.length} Active Stations
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live OpenStreetMap visualization with estimated spatial AQI heatmap across the
              Vandalur / Chennai South corridor.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" /> Filter Source:
            </span>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              aria-label="Filter Stations by Source"
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
            >
              <option value="all">All Data Sources</option>
              <option value="SIMULATED">Simulated (ESP32)</option>
              <option value="HARDWARE">Physical Hardware</option>
              <option value="DEMONSTRATION">Demonstration Presets</option>
            </select>
          </div>
        </div>

        {/* Spatial Integrity Notice */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 text-xs text-blue-900 dark:text-blue-200">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p>
            <strong>Spatial Integrity Disclosure:</strong> The heatmap overlay represents localized
            mathematical interpolation (estimated Gaussian dispersion) from monitoring stations. It
            is not a continuous certified atmospheric measurement surface.
          </p>
        </div>

        {/* Full Interactive Map Container */}
        <div className="flex-1 w-full min-h-[620px] rounded-2xl overflow-hidden shadow-md">
          <MapContainer
            stations={filteredStations}
            selectedStationId={selectedStationId}
            onSelectStation={(st) => setSelectedStationId(st.id)}
            center={[12.8797, 80.0833]}
            zoom={12}
          />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

