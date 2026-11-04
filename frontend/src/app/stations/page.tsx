"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getStations } from "@/lib/api/endpoints";
import { MonitoringStation } from "@/lib/types";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { StationStatus } from "@/components/ui/StationStatus";
import { FreshnessIndicator } from "@/components/ui/FreshnessIndicator";
import { Search, MapPin, ArrowRight, Radio, Cpu } from "lucide-react";

export default function StationsPage() {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getStations().then(setStations);
  }, []);

  const filtered = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location_name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Monitoring Stations Network
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active telemetry beacons across the Chennai-Chengalpattu environmental intelligence corridor.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search station or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
          </div>
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((station) => (
            <div
              key={station.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm hover:border-brand-500 hover:shadow-md transition group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <StationStatus status={station.status} size="sm" />
                  <DataSourceBadge source={station.source} size="sm" />
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition leading-snug">
                  {station.name}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{station.location_name}</span>
                </p>

                {/* AQI & Dominant Pollutant */}
                <div className="my-5 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Live AQI Index
                    </span>
                    <div className="mt-1">
                      <AQIBadge aqi={station.aqi} size="md" />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">Dominant</span>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {station.dominant_pollutant}
                    </span>
                  </div>
                </div>

                {/* Sensors */}
                <div className="space-y-1 mb-4 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Sensor Suite:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {station.sensor_suite.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <FreshnessIndicator timestamp={station.last_seen} />
                <Link
                  href={`/stations/${station.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:translate-x-1 transition"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

