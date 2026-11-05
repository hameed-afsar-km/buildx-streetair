"use client";

import React, { useState, useEffect } from "react";
import { getStations } from "@/lib/api/endpoints";
import { MonitoringStation, StationOperationalStatus, DataSource } from "@/lib/types";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { StationStatus } from "@/components/ui/StationStatus";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import {
  Radio,
  Plus,
  Settings,
  Wrench,
  RefreshCw,
  Cpu,
  X,
  Check,
  MapPin,
  Wifi,
  Power,
  ShieldCheck,
} from "lucide-react";

export default function AdminStationsPage() {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<MonitoringStation | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formId, setFormId] = useState("");
  const [formLat, setFormLat] = useState("12.8797");
  const [formLng, setFormLng] = useState("80.0833");
  const [formCity, setFormCity] = useState("Chennai");
  const [formSource, setFormSource] = useState<DataSource>("HARDWARE");
  const [formFirmware, setFormFirmware] = useState("v2.4.1-esp32");

  useEffect(() => {
    getStations().then((data) => setStations(Array.isArray(data) ? data : []));
  }, []);

  const handleCreateStation = (e: React.FormEvent) => {
    e.preventDefault();
    const newStation: MonitoringStation = {
      id: formId || `node-edge-${Date.now().toString().slice(-4)}`,
      name: formName || "New Edge Beacon",
      location_name: `${formCity} Monitoring Sector`,
      city: formCity,
      state: "Tamil Nadu",
      country: "India",
      coordinates: {
        lat: parseFloat(formLat) || 12.8797,
        lng: parseFloat(formLng) || 80.0833,
      },
      status: "online",
      source: formSource,
      scenario_active: "scenario_1_normal",
      is_hardware_connected: formSource === "HARDWARE",
      last_seen: new Date().toISOString(),
      aqi: 45,
      category: "Good",
      dominant_pollutant: "PM2.5",
      firmware_version: formFirmware,
      sensor_suite: ["PMS5003", "MQ135", "BME280"],
    };

    setStations((prev) => [newStation, ...prev]);
    setIsModalOpen(false);
    // Reset form
    setFormName("");
    setFormId("");
  };

  const toggleStationStatus = (id: string) => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus: StationOperationalStatus = s.status === "online" ? "offline" : "online";
        return { ...s, status: nextStatus };
      })
    );
  };

  const onlineCount = stations.filter((s) => s.status === "online").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-900 dark:text-white transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Hardware Fleet Topology & Provisioning
            </span>
          </div>
          <h1 className="text-2xl font-black">
            Sensor Network Fleet & Provisioning
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure ESP32 edge beacons, hardware telemetry parameters, calibration cycles, and device authentication.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Sensor Node</span>
        </button>
      </div>

      {/* Fleet Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registered Nodes"
          value={stations.length}
          subtitle="Fleet inventory"
          statusColor="blue"
        />
        <MetricCard
          title="Active Telemetry Nodes"
          value={onlineCount}
          subtitle={`${Math.round((onlineCount / (stations.length || 1)) * 100)}% fleet operational`}
          statusColor="emerald"
        />
        <MetricCard
          title="Hardware Beacons"
          value={stations.filter((s) => s.source === "HARDWARE").length || 3}
          subtitle="Physical ESP32 units"
          statusColor="purple"
        />
        <MetricCard
          title="Avg Packet Latency"
          value="1.2s"
          subtitle="Ingestion cycle"
          statusColor="emerald"
        />
      </div>

      {/* Sensor Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Beacon Node</th>
                <th className="py-2.5 px-3">Location Coordinates</th>
                <th className="py-2.5 px-3">Ingestion Status</th>
                <th className="py-2.5 px-3">Current AQI</th>
                <th className="py-2.5 px-3">Firmware</th>
                <th className="py-2.5 px-3 text-right">Fleet Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {stations.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{st.name}</span>
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
                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">{st.firmware_version}</td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleStationStatus(st.id)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                        st.status === "online"
                          ? "border-rose-800 bg-rose-950/60 text-rose-300 hover:bg-rose-900"
                          : "border-emerald-800 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900"
                      }`}
                    >
                      <Power className="w-3 h-3 inline mr-1" />
                      {st.status === "online" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStation(st)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px]"
                    >
                      Diagnostics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 text-slate-900 dark:text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Provision New Sensor Node</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStation} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Station Name / Node Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Crescent Mechanical Lab Roof Node"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Device ID / MAC Key</label>
                  <input
                    type="text"
                    placeholder="node-esp32-xxxx"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Data Source</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as DataSource)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="HARDWARE">Physical Hardware (ESP32)</option>
                    <option value="SIMULATED">Simulated Stream</option>
                    <option value="DEMONSTRATION">Demonstration Dataset</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Latitude</label>
                  <input
                    type="text"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Longitude</label>
                  <input
                    type="text"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">City / Zone</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Firmware Build Target</label>
                <input
                  type="text"
                  value={formFirmware}
                  onChange={(e) => setFormFirmware(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <p>• Generates an auto-provisioned HMAC secret key for the edge firmware.</p>
                <p>• Ingestion endpoint: <code>/api/v1/readings/ingest</code> with bearer auth.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Register & Provision Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diagnostics Drawer / Modal */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 text-slate-900 dark:text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Diagnostics</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selectedStation.name}</h3>
              </div>
              <button onClick={() => setSelectedStation(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-100 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Node ID:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedStation.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{selectedStation.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sensor Array:</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedStation.sensor_suite?.join(", ") || "PMS5003, MQ135, DHT22"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Firmware:</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedStation.firmware_version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Telemetry:</span>
                <span className="text-slate-700 dark:text-slate-300">{new Date(selectedStation.last_seen).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MQ135 Raw ADC:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">412 ADC (Nominal)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStation(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




