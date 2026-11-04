"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, CloudSun, FileWarning, Gauge, MapPin, Radio, Wind } from "lucide-react";
import { MapContainer } from "@/components/map/MapContainer";
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
  useEffect(() => { getStations().then((data) => setStations(Array.isArray(data) ? data : [])); getAlerts(true).then((data) => setAlerts(Array.isArray(data) ? data : [])); }, []);
  const aqi = reading?.aqi ?? 68;
  const health = getAQIClassification(aqi);
  return <div className="min-h-screen overflow-hidden bg-[#f6f8f7] text-slate-950 dark:bg-slate-950 dark:text-white">
    <main className="relative h-screen min-h-[680px]">
      <div className="absolute inset-0"><MapContainer stations={stations} selectedStationId="crescent-vandalur-01" center={[12.8797, 80.0833]} zoom={11} /></div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-slate-950/65 via-slate-950/10 to-transparent px-4 pb-24 pt-4 text-white"><div className="pointer-events-auto mx-auto flex max-w-7xl items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg"><Wind className="h-5 w-5" /></span><div><p className="text-sm font-black tracking-tight">STREET<span className="text-emerald-300">AIR</span></p><p className="text-[10px] font-medium text-slate-200">India air quality network</p></div></div><div className="rounded-full border border-white/20 bg-slate-950/50 px-3 py-2 text-[11px] font-bold backdrop-blur"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${connectionStatus === "connected" ? "bg-emerald-400" : "bg-amber-400"}`} />{connectionStatus === "connected" ? "Live telemetry" : "Cached data"}</div></div></div>
      <section className="absolute left-4 top-20 z-20 w-[min(390px,calc(100vw-2rem))] rounded-2xl border border-white/25 bg-white/94 p-4 shadow-xl backdrop-blur dark:bg-slate-900/94"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Live near you</p><h1 className="mt-1 text-lg font-black">Vandalur · Chennai, India</h1><p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><MapPin className="h-3.5 w-3.5" />GST Road monitoring corridor</p></div><div className="text-right"><p className="text-4xl font-black leading-none">{aqi}</p><p className="mt-1 text-[10px] font-bold text-amber-700">{health.category}</p></div></div><div className="mt-4 rounded-xl bg-slate-100 p-3 text-xs"><p className="font-bold">Today&apos;s air guidance</p><p className="mt-1 leading-relaxed text-slate-600">{health.activityRecommendation}</p></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]"><div className="rounded-xl border border-slate-100 p-2"><Gauge className="mx-auto h-4 w-4 text-violet-600" /><b className="mt-1 block">PM2.5</b><span className="text-slate-500">{reading?.pollutants.pm25.value ?? 28} µg/m³</span></div><div className="rounded-xl border border-slate-100 p-2"><CloudSun className="mx-auto h-4 w-4 text-orange-500" /><b className="mt-1 block">Weather</b><span className="text-slate-500">{reading?.weather.temperature ?? 29}°C</span></div><div className="rounded-xl border border-slate-100 p-2"><Radio className="mx-auto h-4 w-4 text-emerald-600" /><b className="mt-1 block">Network</b><span className="text-slate-500">{stations.length || 1} sites</span></div></div></section>
      <section className="absolute bottom-4 left-4 z-20 hidden w-80 rounded-2xl border border-white/25 bg-white/94 p-3 shadow-xl backdrop-blur lg:block dark:bg-slate-900/94"><div className="flex items-center gap-2"><BellRing className="h-4 w-4 text-amber-600" /><p className="text-xs font-bold">Local advisory</p></div><p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">{alerts[0]?.message || "No active air quality advisory in the current cache."}</p><p className="mt-2 text-[10px] text-slate-400">Updated {lastUpdateTime ? new Date(lastUpdateTime).toLocaleTimeString("en-IN") : "from cache"}</p></section>
      <div className="absolute right-4 top-20 z-20 flex flex-col gap-2"><Link href="/history" className="rounded-xl bg-white/95 px-3 py-2 text-xs font-bold shadow-lg backdrop-blur dark:bg-slate-900"><Wind className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />Timeline</Link><Link href="/app/reports/new" className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-lg"><FileWarning className="mr-1 inline h-3.5 w-3.5" />Report</Link></div>
    </main><AssistantDock /><BottomNavigation />
  </div>;
}
