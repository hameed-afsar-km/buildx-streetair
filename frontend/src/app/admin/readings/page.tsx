"use client";

import { ESP32LiveWidget } from "@/components/ui/ESP32LiveWidget";

import React, { useState } from "react";
import { useLiveWebSocket } from "@/hooks/useLiveWebSocket";
import { Activity, Radio, Cpu, RefreshCw, Terminal } from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function AdminReadingsStreamPage() {
  const { reading, connectionStatus, lastUpdateTime } = useLiveWebSocket();
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* ESP32 Hardware Node — Crescent Campus */}
      <ESP32LiveWidget />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Raw Telemetry Ingestion Stream
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time payload inspection arriving over WebSocket `/ws/v1/live` and MQTT/REST gateways.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 transition shadow-xs"
        >
          {isPaused ? "RESUME STREAM" : "PAUSE STREAM"}
        </button>
      </div>

      {/* Terminal View */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl font-mono text-xs text-emerald-400 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span>ws://api.streetair.io/ws/v1/live (STREAM ATTACHED)</span>
          </div>
          <span className="font-bold text-emerald-400">STATUS: {connectionStatus.toUpperCase()}</span>
        </div>

        <div className="space-y-2 overflow-x-auto max-h-[500px] overflow-y-auto">
          {reading ? (
            <pre className="text-emerald-300 dark:text-emerald-400 whitespace-pre-wrap leading-relaxed font-mono">
              {JSON.stringify(
                {
                  packet_type: "READING_INGEST_BROADCAST",
                  timestamp: reading.timestamp,
                  device_id: reading.device_id,
                  source: reading.source,
                  scenario: reading.scenario,
                  computed_aqi: reading.aqi,
                  category: reading.category,
                  raw_pollutants: {
                    pm25: reading.pollutants.pm25,
                    pm10: reading.pollutants.pm10,
                    no2: reading.pollutants.no2,
                    so2: reading.pollutants.so2,
                    co: reading.pollutants.co,
                    o3: reading.pollutants.o3,
                    voc: reading.pollutants.voc,
                  },
                  raw_weather: reading.weather,
                },
                null,
                2
              )}
            </pre>
          ) : (
            <p className="text-slate-500">Listening for incoming telemetry packets...</p>
          )}
        </div>
      </div>
    </div>
  );
}




