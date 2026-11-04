import React from "react";
import { MonitoringStation } from "@/lib/types";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { StationStatus } from "@/components/ui/StationStatus";
import { FreshnessIndicator } from "@/components/ui/FreshnessIndicator";
import { getAQIClassification } from "@/lib/aqi";
import { X, ArrowRight, MapPin, Cpu, Activity } from "lucide-react";
import Link from "next/link";

interface StationDetailDrawerProps {
  station: MonitoringStation | null;
  onClose: () => void;
}

export function StationDetailDrawer({ station, onClose }: StationDetailDrawerProps) {
  if (!station) return null;

  const classification = getAQIClassification(station.aqi);

  return (
    <div className="absolute top-4 right-4 z-30 w-full max-w-sm rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <StationStatus status={station.status} size="sm" />
            <DataSourceBadge source={station.source} size="sm" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {station.name}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {station.location_name}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="my-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Real-Time AQI Index
          </span>
          <div className="mt-1">
            <AQIBadge aqi={station.aqi} size="lg" />
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-mono">Dominant Pollutant</span>
          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
            {station.dominant_pollutant}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        {classification.advisory}
      </p>

      <div className="space-y-2 mb-4 text-xs">
        <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-slate-500">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Data Freshness
          </span>
          <FreshnessIndicator timestamp={station.last_seen} />
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-slate-500">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            Firmware Architecture
          </span>
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {station.firmware_version}
          </span>
        </div>
      </div>

      <Link
        href={`/stations/${station.id}`}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition"
      >
        <span>View Full Station Diagnostics</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

