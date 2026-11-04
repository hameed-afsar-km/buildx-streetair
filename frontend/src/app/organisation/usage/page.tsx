"use client";

import React, { useState, useEffect } from "react";
import { getUsageTelemetry } from "@/lib/api/endpoints";
import { UsageTelemetry } from "@/lib/types";
import { UsageMeter } from "@/components/ui/UsageMeter";
import { Activity, Server, Database, Bot, HardDrive } from "lucide-react";

export default function OrgUsagePage() {
  const [telemetry, setTelemetry] = useState<UsageTelemetry | null>(null);

  useEffect(() => {
    getUsageTelemetry().then(setTelemetry);
  }, []);

  if (!telemetry) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Platform Usage & Quota Telemetry
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time consumption meters for API calls, active beacons, neural inference, and telemetry storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Data Ingestion & Sensor API Calls
            </h2>
          </div>
          <UsageMeter
            label="Monthly Ingestion Requests"
            current={telemetry.api_calls_count}
            limit={telemetry.api_calls_limit}
            unit="reqs"
          />
          <p className="text-xs text-slate-500 leading-relaxed">
            Covers sub-second ESP32 telemetry packets transmitted to the FastAPI WebSocket ingestion pipeline.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Neural Environmental AI Queries
            </h2>
          </div>
          <UsageMeter
            label="Monthly AI Inferences"
            current={telemetry.ai_queries_count}
            limit={telemetry.ai_queries_limit}
            unit="queries"
          />
          <p className="text-xs text-slate-500 leading-relaxed">
            Covers Groq and Ollama multi-turn diagnostic chats, source apportionment, and What-If simulations.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Active Monitoring Stations
            </h2>
          </div>
          <UsageMeter
            label="Connected Hardware Beacons"
            current={telemetry.stations_count}
            limit={telemetry.stations_limit}
            unit="stations"
          />
          <p className="text-xs text-slate-500 leading-relaxed">
            Enterprise Tier entitles unlimited campus sensor mesh nodes across Vandalur campus.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Time-Series Data Storage
            </h2>
          </div>
          <UsageMeter
            label="Compressed Telemetry Storage"
            current={telemetry.storage_mb}
            limit={telemetry.storage_limit_mb}
            unit="MB"
          />
          <p className="text-xs text-slate-500 leading-relaxed">
            High-resolution minute-by-minute time-series archives retained for 3 years.
          </p>
        </div>
      </div>
    </div>
  );
}

