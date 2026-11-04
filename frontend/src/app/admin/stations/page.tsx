"use client";

import React, { useState, useEffect } from "react";
import { getStations } from "@/lib/api/endpoints";
import { MonitoringStation } from "@/lib/types";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { StationStatus } from "@/components/ui/StationStatus";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { Radio, Plus, Settings, Wrench, RefreshCw, Cpu } from "lucide-react";

export default function AdminStationsPage() {
  const [stations, setStations] = useState<MonitoringStation[]>([]);

  useEffect(() => {
    getStations().then(setStations);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Sensor Network Fleet & Provisioning
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure ESP32 edge beacons, hardware telemetry parameters, and calibration cycles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Station provisioning modal")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Sensor Node</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="py-2.5 px-3">Beacon Node</th>
                <th className="py-2.5 px-3">Location Coordinates</th>
                <th className="py-2.5 px-3">Ingestion Status</th>
                <th className="py-2.5 px-3">Current AQI</th>
                <th className="py-2.5 px-3">Firmware Build</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stations.map((st) => (
                <tr key={st.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{st.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">ID: {st.id}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {st.coordinates.lat.toFixed(4)}° N, {st.coordinates.lng.toFixed(4)}° E
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <StationStatus status={st.status} size="sm" />
                      <DataSourceBadge source={st.source} size="sm" />
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <AQIBadge aqi={st.aqi} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">{st.firmware_version}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Diagnostics for ${st.id}`)}
                      className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px]"
                    >
                      Calibrate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

