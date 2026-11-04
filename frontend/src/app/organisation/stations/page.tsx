"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStations } from "@/lib/api/endpoints";
import { MonitoringStation } from "@/lib/types";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { StationStatus } from "@/components/ui/StationStatus";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { Plus, Radio, ArrowRight, MapPin, Wrench } from "lucide-react";

export default function OrgStationsPage() {
  const [stations, setStations] = useState<MonitoringStation[]>([]);

  useEffect(() => {
    getStations().then(setStations);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Managed Enterprise Stations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provisioned monitoring hardware, sensor calibration states, and ingestion endpoints.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Sensor Beacon registration requires platform admin approval.")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Beacon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map((st) => (
          <div
            key={st.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <StationStatus status={st.status} size="sm" />
                <DataSourceBadge source={st.source} size="sm" />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {st.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {st.location_name}
              </p>

              <div className="my-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Current AQI</span>
                  <AQIBadge aqi={st.aqi} size="md" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">Firmware</span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {st.firmware_version}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[10px]">
                {st.sensor_suite.length} Sensors Active
              </span>
              <Link
                href={`/stations/${st.id}`}
                className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Diagnostics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

