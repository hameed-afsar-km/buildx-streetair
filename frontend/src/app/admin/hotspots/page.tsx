"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getHotspots } from "@/lib/api/endpoints";
import { HotspotCluster } from "@/lib/types";
import { getAQIColor, getAQIClassification } from "@/lib/aqi";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Flame,
  MapPin,
  Compass,
  AlertTriangle,
  Radio,
  ExternalLink,
  RefreshCw,
  Search,
} from "lucide-react";

export default function AdminHotspotsPage() {
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getHotspots();
      setHotspots(data);
    } catch (err) {
      console.error("Failed to load hotspots", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = hotspots.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.primary_source_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Banner (Theme Adaptive) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Spatial Clustering & Anomaly Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Micro-Environment Hotspots & Plume Clusters
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Algorithmic DBSCAN spatial clusters calculated from contiguous micro-sensor anomalies and multi-point telemetry spikes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm"
          >
            <Compass className="w-3.5 h-3.5" />
            Interactive Spatial Map
          </Link>
          <button
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Active Hotspot Zones"
          value={hotspots.length}
          subtitle="Identified clusters"
          statusColor="rose"
        />
        <MetricCard
          title="Peak Cluster AQI"
          value={hotspots.length > 0 ? Math.max(...hotspots.map((h) => h.average_aqi)) : 0}
          unit="NAQI"
          subtitle="Severe localized plume"
          statusColor="amber"
        />
        <MetricCard
          title="Avg Cluster Dispersion Radius"
          value={
            hotspots.length > 0
              ? `${Math.round(
                  hotspots.reduce((acc, h) => acc + h.radius_meters, 0) / hotspots.length
                )}m`
              : "0m"
          }
          subtitle="Spatial extent"
          statusColor="blue"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search clusters by location or source type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Hotspots Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton className="h-56 rounded-2xl" />
          <LoadingSkeleton className="h-56 rounded-2xl" />
          <LoadingSkeleton className="h-56 rounded-2xl" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Hotspot Clusters Detected"
          description="Spatial anomaly engine indicates clean dispersion with no dense localized pollutant clustering."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cluster) => {
            const aqiClass = getAQIClassification(cluster.average_aqi);
            const aqiColor = getAQIColor(cluster.average_aqi);

            return (
              <div
                key={cluster.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-300 dark:border-slate-700 shadow-sm transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {cluster.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{cluster.name}</h3>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-black font-mono shadow-sm"
                      style={{
                        backgroundColor: `${aqiColor}22`,
                        color: aqiColor,
                        border: `1px solid ${aqiColor}55`,
                      }}
                    >
                      AQI {cluster.average_aqi}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                      <span className="text-slate-400">Category</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{aqiClass.category}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                      <span className="text-slate-400">Cluster Radius</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                        {cluster.radius_meters} meters
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                      <span className="text-slate-400">Suspected Source</span>
                      <span className="font-medium text-amber-600 dark:text-amber-300 capitalize">
                        {cluster.primary_source_type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                      <span className="text-slate-400">Linked Incidents</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                        {cluster.incident_count} reports
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400">Coordinates</span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {cluster.coordinates.lat.toFixed(4)}Ã‚°N, {cluster.coordinates.lng.toFixed(4)}Ã‚°E
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Detected: {new Date(cluster.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Link
                    href={`/map?lat=${cluster.coordinates.lat}&lng=${cluster.coordinates.lng}&zoom=16`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
                  >
                    View in Map
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


