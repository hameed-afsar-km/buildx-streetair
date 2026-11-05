"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MonitoringStation } from "@/lib/types";
import { MapPin } from "lucide-react";

const DynamicMap = dynamic(
  () => import("./MapInner").then((mod) => mod.MapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center animate-pulse">
        <MapPin className="w-8 h-8 text-slate-400 mb-2 animate-bounce" />
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Loading OpenStreetMap & Spatial Telemetry Mesh...
        </span>
        <span className="text-xs text-slate-400 mt-1">
          B.S. Abdur Rahman Crescent Institute, Vandalur, Chennai
        </span>
      </div>
    ),
  }
);

interface MapContainerProps {
  stations: MonitoringStation[];
  selectedStationId?: string;
  onSelectStation?: (station: MonitoringStation) => void;
  center?: [number, number];
  zoom?: number;
  heatmapIntensity?: number;
  showControls?: boolean;
  showLegend?: boolean;
}

export function MapContainer(props: MapContainerProps) {
  return <DynamicMap {...props} />;
}
