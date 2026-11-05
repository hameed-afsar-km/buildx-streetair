"use client";

/**
 * ESP32LiveWidget — B.S. Abdur Rahman Crescent Institute of Science and Technology
 *
 * Features:
 *  - Mock sensor data cycles every 2 seconds (data update)
 *  - LCD panel cycles display every 5 seconds
 *  - Sends data to backend /api/v1/readings/ingest every 2 seconds
 *  - Fires alert callback when AQI crosses threshold
 *  - compact prop for minimal inline display
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Wifi, WifiOff, Activity, Thermometer, Droplets,
  Radio, Clock, AlertTriangle, Upload, CheckCircle2,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEVICE_ID    = "esp32-hw-crescent-01";
const STATION_ID   = "crescent-vandalur-01";
const BACKEND_URL  = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const AQI_ALERT_THRESHOLD = 100;

// 2-second sensor cycle
const DATA_INTERVAL_MS  = 2000;
// 5-second LCD page cycle
const LCD_INTERVAL_MS   = 5000;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ESP32Reading {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  temp: number;
  humidity: number;
  signalDbm: number;
}

export interface ESP32Alert {
  id: string;
  timestamp: Date;
  aqi: number;
  pm25: number;
  message: string;
  severity: "moderate" | "high" | "critical";
}

// ─── Mock sensor cycle (realistic ESP32 readings) ─────────────────────────────

const MOCK_CYCLE: ESP32Reading[] = [
  { aqi: 72,  pm25: 34.2, pm10: 48.1, no2: 28.4, temp: 29.4, humidity: 68, signalDbm: -62 },
  { aqi: 75,  pm25: 36.1, pm10: 50.3, no2: 30.1, temp: 29.5, humidity: 67, signalDbm: -61 },
  { aqi: 71,  pm25: 33.8, pm10: 47.6, no2: 27.9, temp: 29.4, humidity: 69, signalDbm: -63 },
  { aqi: 74,  pm25: 35.4, pm10: 49.2, no2: 29.7, temp: 29.6, humidity: 67, signalDbm: -62 },
  { aqi: 68,  pm25: 32.0, pm10: 45.5, no2: 26.8, temp: 29.3, humidity: 70, signalDbm: -60 },
  { aqi: 102, pm25: 54.2, pm10: 71.1, no2: 42.3, temp: 29.9, humidity: 65, signalDbm: -64 }, // triggers alert
  { aqi: 98,  pm25: 51.0, pm10: 68.4, no2: 40.1, temp: 30.0, humidity: 64, signalDbm: -63 },
  { aqi: 76,  pm25: 37.0, pm10: 51.1, no2: 31.2, temp: 29.7, humidity: 66, signalDbm: -64 },
  { aqi: 70,  pm25: 33.1, pm10: 46.9, no2: 27.5, temp: 29.3, humidity: 70, signalDbm: -62 },
  { aqi: 73,  pm25: 35.0, pm10: 49.0, no2: 29.0, temp: 29.5, humidity: 68, signalDbm: -61 },
];

// ─── LCD display pages (what the physical LCD shows) ─────────────────────────

type LcdPage = "aqi" | "pm" | "enviro" | "device";

const LCD_PAGES: LcdPage[] = ["aqi", "pm", "enviro", "device"];

function LcdPageLabel(page: LcdPage): string {
  return { aqi: "AQI & Status", pm: "PM2.5 / PM10", enviro: "Temp / Humidity", device: "Device Info" }[page];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function aqiCategory(aqi: number) {
  if (aqi <= 50)  return { label: "Good",          color: "text-emerald-700 dark:text-emerald-300",  bg: "bg-emerald-50 dark:bg-emerald-950/60",  border: "border-emerald-200 dark:border-emerald-800",  led: "bg-emerald-500" };
  if (aqi <= 100) return { label: "Moderate",       color: "text-amber-700 dark:text-amber-300",     bg: "bg-amber-50 dark:bg-amber-950/60",      border: "border-amber-200 dark:border-amber-800",      led: "bg-amber-400" };
  if (aqi <= 150) return { label: "Unhealthy (S)",  color: "text-orange-700 dark:text-orange-300",   bg: "bg-orange-50 dark:bg-orange-950/60",    border: "border-orange-200 dark:border-orange-800",    led: "bg-orange-500" };
  return                  { label: "Unhealthy",      color: "text-rose-700 dark:text-rose-300",       bg: "bg-rose-50 dark:bg-rose-950/60",        border: "border-rose-200 dark:border-rose-800",        led: "bg-rose-500" };
}

function signalBars(dbm: number): number {
  if (dbm >= -55) return 4;
  if (dbm >= -65) return 3;
  if (dbm >= -75) return 2;
  return 1;
}

// ─── Backend Ingestion ────────────────────────────────────────────────────────

type IngestStatus = "idle" | "sending" | "ok" | "error";

async function ingestToBackend(reading: ESP32Reading): Promise<boolean> {
  const payload = {
    station_id: STATION_ID,
    data_source: "simulated",
    scenario_id: "normal",
    timestamp: new Date().toISOString(),
    firmware_version: "esp32-sim-v1.0",
    location: { lat: 12.8797, lon: 80.0833 },
    readings: {
      pm25: reading.pm25,
      pm10: reading.pm10,
      temperature: reading.temp,
      humidity: reading.humidity,
    },
  };

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/readings/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Device-ID": DEVICE_ID,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok || res.status === 201;
  } catch {
    return false; // backend offline → simulation still runs
  }
}

// ─── LCD Panel ───────────────────────────────────────────────────────────────

function LcdPanel({ reading, page }: { reading: ESP32Reading; page: LcdPage }) {
  const cat = aqiCategory(reading.aqi);

  return (
    <div className="bg-[#1a2a1a] border-2 border-[#2d4a2d] rounded-xl p-4 font-mono text-[#4ade80] shadow-inner overflow-hidden relative">
      {/* LCD scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
           style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.3) 2px,rgba(0,0,0,0.3) 4px)" }} />

      {/* LCD Header row */}
      <div className="flex items-center justify-between mb-2 text-[10px] text-[#2d7a2d] uppercase tracking-widest border-b border-[#2d4a2d] pb-1.5">
        <span>STREETAIR-ESP32</span>
        <span>Crescent Campus</span>
      </div>

      {/* Page content */}
      {page === "aqi" && (
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-wider text-[#4ade80]">{reading.aqi}</span>
            <span className="text-sm text-[#2d7a2d]">NAQI</span>
          </div>
          <div className="text-sm text-[#86efac]">Status: {cat.label.toUpperCase()}</div>
          <div className="text-[11px] text-[#2d7a2d] mt-1">
            {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} IST
          </div>
        </div>
      )}

      {page === "pm" && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-[#2d7a2d]">PM2.5:</span>
            <span className="text-[#4ade80]">{reading.pm25.toFixed(1)} ug/m3</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#2d7a2d]">PM10 :</span>
            <span className="text-[#4ade80]">{reading.pm10.toFixed(1)} ug/m3</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#2d7a2d]">NO2  :</span>
            <span className="text-[#4ade80]">{reading.no2.toFixed(1)} ppb</span>
          </div>
        </div>
      )}

      {page === "enviro" && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-[#2d7a2d]">Temp    :</span>
            <span className="text-[#4ade80]">{reading.temp.toFixed(1)} C</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#2d7a2d]">Humidity:</span>
            <span className="text-[#4ade80]">{reading.humidity} %</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#2d7a2d]">Signal  :</span>
            <span className="text-[#4ade80]">{reading.signalDbm} dBm</span>
          </div>
        </div>
      )}

      {page === "device" && (
        <div className="space-y-1">
          <div className="text-[11px] text-[#2d7a2d]">ID: {DEVICE_ID}</div>
          <div className="text-[11px] text-[#4ade80]">Station: {STATION_ID}</div>
          <div className="text-[11px] text-[#2d7a2d]">FW: esp32-sim-v1.0</div>
          <div className="text-[11px] text-[#4ade80]">Uptime: {Math.floor(Date.now() / 1000) % 86400}s</div>
        </div>
      )}

      {/* Page indicator dots */}
      <div className="flex gap-1 mt-2 justify-end">
        {LCD_PAGES.map((p) => (
          <span key={p} className={`w-1.5 h-1.5 rounded-full ${p === page ? "bg-[#4ade80]" : "bg-[#2d4a2d]"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ESP32LiveWidgetProps {
  compact?: boolean;
  onAlert?: (alert: ESP32Alert) => void;
}

export function ESP32LiveWidget({ compact = false, onAlert }: ESP32LiveWidgetProps) {
  const [reading, setReading]           = useState<ESP32Reading>(MOCK_CYCLE[0]);
  const [lcdPage, setLcdPage]           = useState<LcdPage>("aqi");
  const [online, setOnline]             = useState(true);
  const [lastUpdated, setLastUpdated]   = useState(new Date());
  const [pulse, setPulse]               = useState(false);
  const [ingestStatus, setIngestStatus] = useState<IngestStatus>("idle");
  const [txCount, setTxCount]           = useState(0);
  const [errorCount, setErrorCount]     = useState(0);
  const [activeAlert, setActiveAlert]   = useState<ESP32Alert | null>(null);

  const dataIdxRef = useRef(0);
  const lcdIdxRef  = useRef(0);
  const alertIdRef = useRef(0);

  // ── Data update + backend ingest every 2 seconds ──────────────────────────
  const tick = useCallback(async () => {
    dataIdxRef.current = (dataIdxRef.current + 1) % MOCK_CYCLE.length;
    const next = MOCK_CYCLE[dataIdxRef.current];

    setReading(next);
    setLastUpdated(new Date());
    setPulse(true);
    setTimeout(() => setPulse(false), 300);

    // Check alert threshold
    if (next.aqi > AQI_ALERT_THRESHOLD) {
      const alert: ESP32Alert = {
        id: `esp32-alert-${++alertIdRef.current}`,
        timestamp: new Date(),
        aqi: next.aqi,
        pm25: next.pm25,
        message: `ESP32 at Crescent Campus: AQI ${next.aqi} exceeds threshold (${AQI_ALERT_THRESHOLD}). PM2.5 at ${next.pm25.toFixed(1)} μg/m³.`,
        severity: next.aqi > 150 ? "critical" : next.aqi > 100 ? "high" : "moderate",
      };
      setActiveAlert(alert);
      onAlert?.(alert);
      // Auto-dismiss after 8 seconds
      setTimeout(() => setActiveAlert((a) => a?.id === alert.id ? null : a), 8000);
    }

    // Send to backend (non-blocking, graceful failure)
    setIngestStatus("sending");
    const ok = await ingestToBackend(next);
    setIngestStatus(ok ? "ok" : "error");
    if (ok) setTxCount((n) => n + 1);
    else setErrorCount((n) => n + 1);
    // Reset status badge after 1.5s
    setTimeout(() => setIngestStatus("idle"), 1500);
  }, [onAlert]);

  useEffect(() => {
    const dataInterval = setInterval(tick, DATA_INTERVAL_MS);
    return () => clearInterval(dataInterval);
  }, [tick]);

  // ── LCD page cycle every 5 seconds ───────────────────────────────────────
  useEffect(() => {
    const lcdInterval = setInterval(() => {
      lcdIdxRef.current = (lcdIdxRef.current + 1) % LCD_PAGES.length;
      setLcdPage(LCD_PAGES[lcdIdxRef.current]);
    }, LCD_INTERVAL_MS);
    return () => clearInterval(lcdInterval);
  }, []);

  const cat  = aqiCategory(reading.aqi);
  const bars = signalBars(reading.signalDbm);

  // ── Compact mode ──────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">LIVE</span>
        </div>
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">ESP32 · Crescent Campus</span>
        <span className={`ml-auto text-sm font-black ${cat.color}`}>AQI {reading.aqi}</span>
        <span className="text-xs text-slate-400">{cat.label}</span>
      </div>
    );
  }

  // ── Full mode ─────────────────────────────────────────────────────────────
  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm text-slate-900 dark:text-white ${
      activeAlert ? "border-rose-400 dark:border-rose-600" :
      pulse ? "border-emerald-400 dark:border-emerald-600" :
      "border-slate-200 dark:border-slate-800"
    } bg-white dark:bg-slate-900`}>

      {/* Alert banner */}
      {activeAlert && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
          <p className="text-xs font-semibold text-rose-800 dark:text-rose-200 flex-1">{activeAlert.message}</p>
          <span className="text-[10px] font-mono text-rose-500 uppercase font-bold px-1.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700">
            {activeAlert.severity}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              LIVE · ESP32 Hardware Node
            </span>
            <span className={`ml-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${cat.bg} ${cat.color} ${cat.border}`}>
              {cat.label}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
            B.S. Abdur Rahman Crescent Institute of Science and Technology
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Vandalur, Chennai · 12.8797°N, 80.0833°E
          </p>
        </div>

        {/* Signal bars + status */}
        <div className="flex flex-col items-end gap-1.5 ml-4 shrink-0">
          <div className="flex items-end gap-0.5 h-5">
            {[1, 2, 3, 4].map((b) => (
              <div
                key={b}
                className={`w-1.5 rounded-sm transition-all duration-300 ${b <= bars ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}
                style={{ height: `${b * 25}%` }}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-slate-400">{reading.signalDbm} dBm</span>
          <div className="flex items-center gap-1">
            {online ? <Wifi className="w-3.5 h-3.5 text-emerald-500" /> : <WifiOff className="w-3.5 h-3.5 text-rose-500" />}
            <span className={`text-[10px] font-bold uppercase ${online ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
              {online ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Main content: AQI + LCD side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
        {/* Left: Sensor readings */}
        <div className="space-y-4">
          {/* AQI hero */}
          <div className="flex items-baseline gap-3">
            <span className={`text-6xl font-black tabular-nums transition-all duration-200 ${cat.color}`}
                  style={{ transform: pulse ? "scale(1.04)" : "scale(1)" }}>
              {reading.aqi}
            </span>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AQI · NAQI</p>
              <p className={`text-sm font-bold ${cat.color}`}>{cat.label}</p>
            </div>
          </div>

          {/* Sensor grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
              <div className="flex items-center gap-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-mono text-slate-500 uppercase">PM2.5</span>
              </div>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{reading.pm25.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 ml-1">μg/m³</span>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
              <div className="flex items-center gap-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-[10px] font-mono text-slate-500 uppercase">PM10</span>
              </div>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{reading.pm10.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 ml-1">μg/m³</span>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
              <div className="flex items-center gap-1 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-mono text-slate-500 uppercase">Temp</span>
              </div>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{reading.temp.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 ml-1">°C</span>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
              <div className="flex items-center gap-1 mb-1">
                <Droplets className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-[10px] font-mono text-slate-500 uppercase">Humidity</span>
              </div>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{reading.humidity}</span>
              <span className="text-[10px] text-slate-400 ml-1">%</span>
            </div>
          </div>
        </div>

        {/* Right: LCD Display */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${cat.led} animate-pulse`} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              LCD Display · {LcdPageLabel(lcdPage)}
            </span>
          </div>
          <LcdPanel reading={reading} page={lcdPage} />
          <p className="text-[10px] text-slate-400 text-center font-mono">
            Cycles every 5s · {LCD_PAGES.indexOf(lcdPage) + 1}/{LCD_PAGES.length}
          </p>
        </div>
      </div>

      {/* Footer: telemetry stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-500">Device: {DEVICE_ID}</span>
        </div>

        {/* Ingest status */}
        <div className="flex items-center gap-2">
          {ingestStatus === "sending" && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-blue-500">
              <Upload className="w-3 h-3 animate-pulse" /> Sending...
            </span>
          )}
          {ingestStatus === "ok" && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Ingested
            </span>
          )}
          {ingestStatus === "error" && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-amber-500">
              <AlertTriangle className="w-3 h-3" /> Backend offline (sim running)
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-400">
            TX: {txCount} · ERR: {errorCount}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-mono text-slate-400 tabular-nums">
            {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} IST
          </span>
          <span className="text-[10px] text-slate-400">· 2s interval</span>
        </div>
      </div>
    </div>
  );
}

export default ESP32LiveWidget;
