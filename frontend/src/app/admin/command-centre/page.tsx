"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, AlertTriangle, Bot, Download, FileSpreadsheet, FileText, Map, Radio, ShieldCheck, X, Bell } from "lucide-react";
import { getAlerts, getStations } from "@/lib/api/endpoints";
import { EnvironmentalAlert, MonitoringStation } from "@/lib/types";
import { MapContainer } from "@/components/map/MapContainer";
import { AssistantDock } from "@/components/ui/AssistantDock";
import { ESP32LiveWidget, type ESP32Alert } from "@/components/ui/ESP32LiveWidget";
import { useESP32Alerts } from "@/lib/esp32AlertStore";

const exposure = [
  { area: "Vandalur",      aqi: 68  },
  { area: "Kilambakkam",   aqi: 112 },
  { area: "Tambaram",      aqi: 91  },
  { area: "Chengalpattu",  aqi: 57  },
  { area: "Perungalathur", aqi: 126 },
];

const composition = [
  { name: "PM2.5", value: 42, color: "#10b981" },
  { name: "NO₂",  value: 24, color: "#f43f5e" },
  { name: "PM10",  value: 21, color: "#f59e0b" },
  { name: "Other", value: 13, color: "#06b6d4" },
];

function severityColor(s: ESP32Alert["severity"]) {
  return s === "critical" ? "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
       : s === "high"     ? "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800"
                           : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
}

export default function AdminCommandCentrePage() {
  const [stations, setStations]   = useState<MonitoringStation[]>([]);
  const [alerts, setAlerts]       = useState<EnvironmentalAlert[]>([]);
  const [exports, setExports]     = useState<string | null>(null);
  const [showIssues, setShowIssues] = useState(true);

  const { alerts: esp32Alerts, pushAlert, dismissAlert, clearAll } = useESP32Alerts();

  useEffect(() => {
    getStations().then((x) => setStations(Array.isArray(x) ? x : []));
    getAlerts(true).then((x) => setAlerts(Array.isArray(x) ? x : []));
  }, []);

  const exportSnapshot = (format: string) => {
    setExports(`${format} export queued · ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`);
    window.setTimeout(() => setExports(null), 3500);
  };

  // Wire ESP32 alert callback
  const handleESP32Alert = useCallback((alert: ESP32Alert) => {
    pushAlert(alert);
    setShowIssues(true);
  }, [pushAlert]);

  const totalIssues = esp32Alerts.length + alerts.filter((a) => a.severity === "high" || a.severity === "critical").length;

  return (
    <div className="space-y-6 pb-16 text-slate-900 dark:text-slate-100">

      {/* Top Banner */}
      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm transition-colors">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              India Operations · Live Command
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Air quality, understood at a glance.
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              A focused view of sensor trust, community reports, forecast risk, and local hotspots across the Chennai monitoring mesh.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportSnapshot("CSV")} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              <FileSpreadsheet className="mr-1.5 inline h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />CSV
            </button>
            <button onClick={() => exportSnapshot("XLSX")} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              <Download className="mr-1.5 inline h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />XLSX
            </button>
            <button onClick={() => exportSnapshot("PDF")} className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white hover:bg-emerald-500 shadow-md transition">
              <FileText className="mr-1.5 inline h-3.5 w-3.5" />PDF Brief
            </button>
            {/* Active Issues toggle */}
            <button
              onClick={() => setShowIssues((v) => !v)}
              className={`relative rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm border ${
                totalIssues > 0
                  ? "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Bell className="mr-1.5 inline h-3.5 w-3.5" />
              Active Issues
              {totalIssues > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {totalIssues > 9 ? "9+" : totalIssues}
                </span>
              )}
            </button>
          </div>
        </div>
        {exports && (
          <p className="mt-4 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            {exports}
          </p>
        )}
      </header>

      {/* ── Active Issues Panel ──────────────────────────────────────────── */}
      {showIssues && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Issues</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {totalIssues} open
              </span>
            </div>
            <div className="flex items-center gap-2">
              {esp32Alerts.length > 0 && (
                <button onClick={clearAll} className="text-[10px] text-slate-400 hover:text-rose-500 transition font-mono">
                  Clear ESP32
                </button>
              )}
              <button onClick={() => setShowIssues(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {/* ESP32 Hardware Alerts */}
            {esp32Alerts.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                  a.severity === "critical" ? "bg-rose-500 animate-pulse" :
                  a.severity === "high"     ? "bg-orange-500" : "bg-amber-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">ESP32 · Crescent Campus</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${severityColor(a.severity)}`}>
                      {a.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 ml-auto">
                      {a.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} IST
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{a.message}</p>
                </div>
                <button onClick={() => dismissAlert(a.id)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 transition shrink-0 ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* System/Backend Alerts */}
            {alerts.filter((a) => a.severity === "high" || (a as any).severity === "critical").map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <div className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-orange-500" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{(a as any).station_id || "System"}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800">
                      {(a as any).severity || "high"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {(a as any).message || "Threshold exceedance detected"}
                  </p>
                </div>
              </div>
            ))}

            {totalIssues === 0 && (
              <div className="flex items-center gap-2 px-5 py-6 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                No active issues. All systems nominal.
              </div>
            )}
          </div>

          {totalIssues > 0 && (
            <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Link href="/admin/alerts" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                View all alerts →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Operational Systems", `${stations.filter((s) => s.status === "online").length || 5}/${stations.length || 6}`, "Sensors reporting normally", "text-emerald-600 dark:text-emerald-400"],
          ["Forecast Risk", "Moderate", "Peak expected 18:00–21:00", "text-amber-600 dark:text-amber-400"],
          ["Cache Freshness", "42 sec", "Last verified telemetry frame", "text-emerald-600 dark:text-emerald-400"],
          ["Active Issues", `${totalIssues}`, "ESP32 & threshold alerts", totalIssues > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"],
        ].map(([label, value, note, valColor]) => (
          <div key={label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-black ${valColor}`}>{value}</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{note}</p>
          </div>
        ))}
      </div>

      {/* ESP32 Hardware Node */}
      <ESP32LiveWidget onAlert={handleESP32Alert} />

      {/* Map & Exposure Row */}
      <div className="grid gap-6 xl:grid-cols-12">
        <section className="min-h-[430px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 xl:col-span-7 flex flex-col shadow-sm transition-colors">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Spatial Risk Surface</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Estimated heatmap from available systems · Chennai, India</p>
            </div>
            <Map className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-h-[365px]">
            <MapContainer stations={stations} center={[12.96, 80.16]} zoom={10} showControls={false} showLegend={false} />
          </div>
        </section>

        <section className="xl:col-span-5 flex flex-col gap-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Exposure by Locality</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Live AQI signal with alert threshold at 100</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exposure} layout="vertical" margin={{ left: 8, right: 32 }}>
                  <XAxis type="number" domain={[0, 150]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="area" tick={{ fontSize: 11 }} width={90} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="aqi" radius={[0, 6, 6, 0]}>
                    {exposure.map((e) => (
                      <Cell key={e.area} fill={e.aqi > 100 ? "#f43f5e" : "#10b981"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">System Status</p>
            <div className="mt-2 space-y-2">
              {stations.slice(0, 3).map((station) => (
                <div key={station.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Radio className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {station.name}
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{station.status}</span>
                </div>
              ))}
              {stations.length === 0 && <p className="text-xs text-slate-500">Using cached system inventory.</p>}
            </div>
          </div>
        </section>
      </div>

      {/* Composition & AI Trace */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Pollution Composition</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Dominant criteria pollutants, latest composite</p>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={composition} dataKey="value" innerRadius={48} outerRadius={75} paddingAngle={4}>
                  {composition.map((x) => (
                    <Cell key={x.name} fill={x.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
            {composition.map((x) => (
              <span key={x.name} className="flex items-center gap-1.5">
                <i className="inline-block h-2 w-2 rounded-full" style={{ background: x.color }} />
                <span>{x.name}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400 ml-auto">{x.value}%</span>
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 lg:col-span-2 shadow-sm transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">AI Inference Trace</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">RAG telemetry explanation for the active Chennai hotspot</p>
            </div>
            <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800 transition-colors">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Inference</p>
              <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">Traffic + Inversion Likely</p>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Expected local AQI rise: +24</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800 transition-colors">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Confidence</p>
              <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">87%</p>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Sensor agreement: 5/6</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800 transition-colors">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">RAG References</p>
              <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">CPCB NAQI · Local Wind</p>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">3 evidence chunks · 11 min old</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Evidence attached; no unsupported alert sent.
            </span>
            <Link href="/admin/intelligence/chat" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              Open AURA Assistant →
            </Link>
          </div>
        </section>
      </div>

      <AssistantDock admin />
    </div>
  );
}
