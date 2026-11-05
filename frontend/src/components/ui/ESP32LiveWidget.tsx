"use client";

/**
 * ESP32LiveWidget — B.S. Abdur Rahman Crescent Institute of Science and Technology
 * 
 * Hardware-accurate console modeling D:\Web Dev\buildx-streetair\hardware\code\code.ino:
 *  - 4x4 Matrix Keypad: Keys 1–9 trigger the 9 demonstration scenarios directly.
 *  - 16x2 I2C Backlit LCD: Cycles 3 screens every 5 seconds (Screen 1: AQI/Category, Screen 2: PM2.5/PM10, Screen 3: Climate/Gas)
 *  - HTTP POST Ingestion: Sends JSON telemetry to backend /api/v1/ingest with X-Device-ID and X-Device-Key headers.
 *  - Live Sync: Updates the global mock adapter and alert store so the Dashboard and Public Map reflect the simulation in real time.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Wifi,
  WifiOff,
  Activity,
  Thermometer,
  Droplets,
  Radio,
  Clock,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Key,
  Layers,
  ChevronRight,
} from "lucide-react";
import { setActiveMockScenario } from "@/lib/api/mockAdapter";
import { broadcastCitizenReport } from "@/lib/citizenReportBroadcast";
import type { ScenarioKey } from "@/lib/types";

// ─── Constants (matches hardware/code/code.ino) ────────────────────────────────

const DEVICE_ID = "ST-001-DEVICE";
const STATION_ID = "ST-001";
const DEVICE_API_KEY = "streetair_secret_dev_key_2026";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Hardware transmission interval from code.ino: 15 seconds
const HARDWARE_AUTOSEND_INTERVAL_MS = 15000;
// Hardware LCD rotation interval from code.ino: 5 seconds
const SCREEN_CYCLE_INTERVAL_MS = 5000;

// ─── 9 Scenarios (directly from code.ino struct Scenario) ─────────────────────

export interface ScenarioDef {
  id: string; // API slug
  shortName: string; // Formatted for 16x2 LCD Line 0
  pm1: number; // ug/m3
  pm25: number; // ug/m3
  pm10: number; // ug/m3
  mq135Raw: number; // Raw ADC analog value (gas proxy)
  temperature: number; // deg C
  humidity: number; // %
  pressure: number; // hPa
  scenarioKey: ScenarioKey; // mapped frontend scenario key
  description: string;
}

export const HARDWARE_SCENARIOS: ScenarioDef[] = [
  {
    id: "normal",
    shortName: "Normal Air",
    pm1: 8,
    pm25: 18,
    pm10: 28,
    mq135Raw: 450,
    temperature: 29,
    humidity: 55,
    pressure: 1008,
    scenarioKey: "scenario_1_normal",
    description: "Baseline ambient air. Good air quality, light traffic along GST Road, moderate coastal breeze.",
  },
  {
    id: "traffic",
    shortName: "Traffic Cong.",
    pm1: 22,
    pm25: 65,
    pm10: 110,
    mq135Raw: 1100,
    temperature: 32,
    humidity: 48,
    pressure: 1007,
    scenarioKey: "scenario_2_traffic",
    description: "Evening rush hour gridlock at Vandalur junction & Kilambakkam bus corridor. Diesel exhaust surge.",
  },
  {
    id: "construction",
    shortName: "Construction",
    pm1: 45,
    pm25: 105,
    pm10: 220,
    mq135Raw: 1350,
    temperature: 34,
    humidity: 40,
    pressure: 1006,
    scenarioKey: "scenario_3_construction",
    description: "Highway flyover & road expansion dust. Heavy coarse particulates (PM10 dominant).",
  },
  {
    id: "industrial",
    shortName: "Industrial Em.",
    pm1: 38,
    pm25: 125,
    pm10: 190,
    mq135Raw: 1800,
    temperature: 36,
    humidity: 42,
    pressure: 1005,
    scenarioKey: "scenario_4_industrial",
    description: "Downwind emission plume from Maraimalai Nagar / SIPCOT manufacturing boiler stacks.",
  },
  {
    id: "waste_burning",
    shortName: "Waste Burning",
    pm1: 55,
    pm25: 180,
    pm10: 260,
    mq135Raw: 2400,
    temperature: 37,
    humidity: 38,
    pressure: 1004,
    scenarioKey: "scenario_5_waste_burning",
    description: "Uncontrolled biomass or garbage burning near campus boundary fence. Toxic organic gases & dense smoke.",
  },
  {
    id: "high_humidity",
    shortName: "High Humidity",
    pm1: 12,
    pm25: 35,
    pm10: 55,
    mq135Raw: 700,
    temperature: 28,
    humidity: 92,
    pressure: 1009,
    scenarioKey: "scenario_6_humidity",
    description: "Early winter coastal inversion & heavy damp fog (92% RH) trapping ground level particulates.",
  },
  {
    id: "smoke",
    shortName: "Smoke Event",
    pm1: 70,
    pm25: 220,
    pm10: 310,
    mq135Raw: 2800,
    temperature: 38,
    humidity: 35,
    pressure: 1003,
    scenarioKey: "scenario_7_smoke",
    description: "Dense localized smoke plume from agricultural burning. Acute respiratory hazard.",
  },
  {
    id: "dispersal",
    shortName: "Dispersal",
    pm1: 15,
    pm25: 30,
    pm10: 48,
    mq135Raw: 650,
    temperature: 30,
    humidity: 52,
    pressure: 1008,
    scenarioKey: "scenario_8_dispersal",
    description: "Strong Bay of Bengal maritime sea breeze front rapidly dispersing particulate accumulations.",
  },
  {
    id: "extreme",
    shortName: "Extreme Poll.",
    pm1: 100,
    pm25: 300,
    pm10: 450,
    mq135Raw: 3500,
    temperature: 40,
    humidity: 30,
    pressure: 1002,
    scenarioKey: "scenario_9_extreme",
    description: "Severe multi-factor smog episode. Severe alert triggered; indoor air shelters recommended.",
  },
];

// Approximate Indian AQI calculation directly from code.ino calculateApproxAqi()
function calculateApproxAqi(pm25: number): number {
  if (pm25 <= 30) return Math.round((pm25 / 30) * 50);
  if (pm25 <= 60) return Math.round(51 + ((pm25 - 31) / (60 - 31)) * (100 - 51));
  if (pm25 <= 90) return Math.round(101 + ((pm25 - 61) / (90 - 61)) * (200 - 101));
  if (pm25 <= 120) return Math.round(201 + ((pm25 - 91) / (120 - 91)) * (300 - 201));
  if (pm25 <= 250) return Math.round(301 + ((pm25 - 121) / (250 - 121)) * (400 - 301));
  return Math.round(401 + ((pm25 - 251) / (500 - 251)) * (500 - 401));
}

function getAqiCategory(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/60", border: "border-emerald-200 dark:border-emerald-800" };
  if (aqi <= 100) return { label: "Satisfactory", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60", border: "border-emerald-200 dark:border-emerald-800" };
  if (aqi <= 200) return { label: "Moderate", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/60", border: "border-amber-200 dark:border-amber-800" };
  if (aqi <= 300) return { label: "Poor", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-50 dark:bg-orange-950/60", border: "border-orange-200 dark:border-orange-800" };
  if (aqi <= 400) return { label: "Very Poor", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/60", border: "border-rose-200 dark:border-rose-800" };
  return { label: "Severe", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-950/60", border: "border-purple-200 dark:border-purple-800" };
}

export interface ESP32Alert {
  id: string;
  timestamp: Date;
  aqi: number;
  pm25: number;
  message: string;
  severity: "moderate" | "high" | "critical";
}

// ─── 16x2 LCD Display Component (Exact behavior of code.ino) ──────────────────

function Lcd16x2({
  scenario,
  screenIndex,
  tempMessage,
}: {
  scenario: ScenarioDef;
  screenIndex: number;
  tempMessage: { line0: string; line1: string } | null;
}) {
  let line0 = "";
  let line1 = "";

  if (tempMessage) {
    line0 = tempMessage.line0;
    line1 = tempMessage.line1;
  } else {
    const aqi = calculateApproxAqi(scenario.pm25);
    const cat = getAqiCategory(aqi);

    if (screenIndex === 0) {
      // Screen 1: Scenario & AQI Category
      const sIndex = HARDWARE_SCENARIOS.findIndex((s) => s.id === scenario.id) + 1;
      line0 = `S${sIndex}: ${scenario.shortName}`;
      line1 = `AQI:${aqi} ${cat.label}`;
    } else if (screenIndex === 1) {
      // Screen 2: Particulates
      line0 = `PM2.5: ${scenario.pm25} ug/m3`;
      line1 = `PM10:  ${scenario.pm10} ug/m3`;
    } else {
      // Screen 3: Ambient Climate & Gas
      line0 = `T:${scenario.temperature}C H:${scenario.humidity}%`;
      line1 = `P:${scenario.pressure}hPa G:${scenario.mq135Raw}`;
    }
  }

  // Format to exact 16 characters
  const pad16 = (s: string) => (s.length > 16 ? s.substring(0, 16) : s.padEnd(16, " "));

  return (
    <div className="relative rounded-xl border-4 border-slate-700 dark:border-slate-800 bg-[#0c180c] p-4 shadow-2xl font-mono text-[#39ff14] select-none">
      {/* Glass bevel shine */}
      <div className="absolute inset-0 rounded-lg pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-black/30" />

      {/* Screen header */}
      <div className="flex items-center justify-between text-[10px] text-[#227711] mb-2 border-b border-[#1b3d1b] pb-1 tracking-widest uppercase">
        <span>HD44780 16x2 LCD</span>
        <span>I2C 0x27</span>
      </div>

      {/* 2 Lines of 16 characters */}
      <div className="space-y-1 text-sm md:text-base font-black tracking-widest whitespace-pre drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
        <div>{pad16(line0)}</div>
        <div>{pad16(line1)}</div>
      </div>

      {/* Screen cycle indicators */}
      <div className="flex items-center justify-between mt-3 pt-1 border-t border-[#1b3d1b] text-[9px] text-[#227711]">
        <span>5s AUTO-CYCLE</span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((idx) => (
            <span
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                screenIndex === idx ? "bg-[#39ff14] shadow-[0_0_6px_#39ff14]" : "bg-[#1b3d1b]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 4x4 Membrane Keypad Component ───────────────────────────────────────────

const KEYPAD_LAYOUT = [
  [{ key: "1", label: "S1: Normal", desc: "Key 1" }, { key: "2", label: "S2: Traffic", desc: "Key 2" }, { key: "3", label: "S3: Construct", desc: "Key 3" }, { key: "A", label: "INFO", desc: "Screen" }],
  [{ key: "4", label: "S4: Industry", desc: "Key 4" }, { key: "5", label: "S5: Burning", desc: "Key 5" }, { key: "6", label: "S6: Humidity", desc: "Key 6" }, { key: "B", label: "PM SENS", desc: "Particulates" }],
  [{ key: "7", label: "S7: Smoke", desc: "Key 7" }, { key: "8", label: "S8: Dispersal", desc: "Key 8" }, { key: "9", label: "S9: Extreme", desc: "Key 9" }, { key: "C", label: "CLIMATE", desc: "Temp/Hum" }],
  [{ key: "*", label: "WIFI/NTP", desc: "Sync Clock" }, { key: "0", label: "RESEND", desc: "POST Data" }, { key: "#", label: "STATUS", desc: "IP & State" }, { key: "D", label: "TRANSMIT", desc: "Trigger" }],
];

function Keypad4x4({ onKeyPress, activeKey }: { onKeyPress: (k: string) => void; activeKey: string | null }) {
  return (
    <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 p-3 shadow-inner">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          4x4 Membrane Keypad (GPIO 23,19,18,17 / 16,4,5,2)
        </span>
        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">CLICK TO SIMULATE</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {KEYPAD_LAYOUT.flat().map((item) => {
          const isSelected = activeKey === item.key;
          const isScenario = item.key >= "1" && item.key <= "9";
          const isAction = ["*", "0", "#"].includes(item.key);

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onKeyPress(item.key)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border font-mono transition transform active:scale-95 shadow-sm ${
                isSelected
                  ? "bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-400 shadow-md scale-102"
                  : isScenario
                  ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-600"
                  : isAction
                  ? "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                  : "bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300"
              }`}
            >
              <span className="text-base font-black leading-none">{item.key}</span>
              <span className="text-[8px] font-bold uppercase tracking-tight mt-1 truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
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
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDef>(HARDWARE_SCENARIOS[0]);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0); // 0 = AQI, 1 = Particulates, 2 = Climate
  const [tempLcdMessage, setTempLcdMessage] = useState<{ line0: string; line1: string } | null>(null);
  const [online, setOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [pulse, setPulse] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [txCount, setTxCount] = useState(0);
  const [lastHttpCode, setLastHttpCode] = useState<number | null>(null);
  const [activePressedKey, setActivePressedKey] = useState<string | null>("1");
  const [activeAlert, setActiveAlert] = useState<ESP32Alert | null>(null);

  const scenarioRef = useRef(selectedScenario);
  scenarioRef.current = selectedScenario;

  // Non-blocking LCD message timer (matches renderStatusMessage() in code.ino)
  const showTempMessage = useCallback((line0: string, line1: string, durationMs = 2000) => {
    setTempLcdMessage({ line0, line1 });
    setTimeout(() => {
      setTempLcdMessage(null);
    }, durationMs);
  }, []);

  // Transmit telemetry via HTTP POST (matches transmitScenarioData() in code.ino)
  const transmitData = useCallback(
    async (scenario: ScenarioDef) => {
      setIngestStatus("sending");
      setPulse(true);
      setTimeout(() => setPulse(false), 300);

      const timestamp = new Date().toISOString();
      const payload = {
        device_id: DEVICE_ID,
        station_id: STATION_ID,
        timestamp,
        data_source: "simulated",
        scenario_id: scenario.id,
        readings: {
          pm1: scenario.pm1,
          pm25: scenario.pm25,
          pm10: scenario.pm10,
          mq135_raw: scenario.mq135Raw,
          temperature: scenario.temperature,
          humidity: scenario.humidity,
          pressure: scenario.pressure,
        },
      };

      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/ingest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Device-ID": DEVICE_ID,
            "X-Device-Key": DEVICE_API_KEY,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000),
        });

        const status = res.status;
        setLastHttpCode(status);

        if (res.ok || status === 201) {
          setIngestStatus("ok");
          setTxCount((n) => n + 1);
          setLastUpdated(new Date());
          showTempMessage("Data Sent OK", `HTTP ${status}`, 1400);
        } else {
          setIngestStatus("error");
          showTempMessage("Backend Error", `HTTP ${status}`, 1800);
        }
      } catch {
        // Backend offline in development mode -> fallback simulation still runs cleanly
        setIngestStatus("error");
        setLastHttpCode(null);
        showTempMessage("Connect Error", "Using Local Sim", 1500);
      } finally {
        setTimeout(() => setIngestStatus("idle"), 2500);
      }
    },
    [showTempMessage]
  );

  // Keypad press handler (matches handleKeypadInput() in code.ino)
  const handleKeypadPress = useCallback(
    (key: string) => {
      setActivePressedKey(key);
      setTimeout(() => setActivePressedKey(null), 800);

      // Keys 1 to 9: Select scenario and immediately transmit
      if (key >= "1" && key <= "9") {
        const idx = parseInt(key, 10) - 1;
        const targetScenario = HARDWARE_SCENARIOS[idx];
        setSelectedScenario(targetScenario);
        setCurrentScreenIndex(0);

        // Update the global frontend mock state so Map & Dashboard update immediately
        setActiveMockScenario(targetScenario.scenarioKey);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("streetair:scenario_changed", {
              detail: { scenarioKey: targetScenario.scenarioKey, stationId: STATION_ID },
            })
          );
        }

        const aqi = calculateApproxAqi(targetScenario.pm25);
        if (aqi > 100) {
          const newAlert: ESP32Alert = {
            id: `esp32-key-${Date.now()}`,
            timestamp: new Date(),
            aqi,
            pm25: targetScenario.pm25,
            message: `[ESP32 Key ${key}] ${targetScenario.shortName}: AQI ${aqi} exceeded threshold at Crescent Campus station.`,
            severity: aqi > 300 ? "critical" : aqi > 200 ? "high" : "moderate",
          };
          setActiveAlert(newAlert);
          onAlert?.(newAlert);
          setTimeout(() => setActiveAlert((a) => (a?.id === newAlert.id ? null : a)), 10000);

          // Broadcast instantly to admin dashboard as simulated hardware spike
          broadcastCitizenReport({
            id: `sim-esp32-${Date.now()}`,
            category: targetScenario.id,
            categoryLabel: `Hardware Telemetry Surge: ${targetScenario.shortName}`,
            address: "B.S. Abdur Rahman Crescent Institute, GST Road",
            description: targetScenario.description,
            timestamp: new Date().toISOString(),
            severity: aqi > 300 ? "critical" : aqi > 200 ? "high" : "medium",
            reporterName: `ESP32 Key ${key} Simulation`,
            isSimulation: true,
          });
        }

        // Show sending status on LCD then transmit
        showTempMessage(`Sending S${key} Data`, targetScenario.id, 1000);
        setTimeout(() => {
          transmitData(targetScenario);
        }, 300);
      }
      // Key 0: Resend currently active scenario
      else if (key === "0") {
        showTempMessage("Resending Data", scenarioRef.current.id, 1200);
        transmitData(scenarioRef.current);
      }
      // Key *: Force Wi-Fi reconnect & NTP sync
      else if (key === "*") {
        showTempMessage("Connecting WiFi", "Hackathon-Hall-2", 1500);
        setTimeout(() => {
          showTempMessage("WiFi Connected", "192.168.1.100", 1500);
        }, 1500);
      }
      // Key #: Display Wi-Fi status and IP address
      else if (key === "#") {
        showTempMessage("WiFi: Connected", "192.168.1.100", 2500);
      }
      // Screen switches (A, B, C)
      else if (key === "A") setCurrentScreenIndex(0);
      else if (key === "B") setCurrentScreenIndex(1);
      else if (key === "C") setCurrentScreenIndex(2);
      else if (key === "D") transmitData(scenarioRef.current);
    },
    [onAlert, showTempMessage, transmitData]
  );

  // LCD 5-Second Screen Rotation (matches SCREEN_CYCLE_INTERVAL_MS in code.ino)
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setCurrentScreenIndex((prev) => (prev + 1) % 3);
    }, SCREEN_CYCLE_INTERVAL_MS);
    return () => clearInterval(cycleInterval);
  }, []);

  // Automatic 15-Second Background Transmission (matches SEND_INTERVAL_MS in code.ino)
  useEffect(() => {
    const autoSendInterval = setInterval(() => {
      transmitData(scenarioRef.current);
    }, HARDWARE_AUTOSEND_INTERVAL_MS);
    return () => clearInterval(autoSendInterval);
  }, [transmitData]);

  const approxAqi = calculateApproxAqi(selectedScenario.pm25);
  const cat = getAqiCategory(approxAqi);

  // Compact badge mode
  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            ESP32 LIVE
          </span>
        </div>
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Crescent Campus · S{HARDWARE_SCENARIOS.findIndex((s) => s.id === selectedScenario.id) + 1}: {selectedScenario.shortName}
        </span>
        <span className={`ml-auto text-sm font-black ${cat.color}`}>AQI {approxAqi}</span>
        <span className="text-xs text-slate-400">{cat.label}</span>
      </div>
    );
  }

  // Full interactive hardware panel
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm text-slate-900 dark:text-white ${
        activeAlert
          ? "border-rose-400 dark:border-rose-600 ring-2 ring-rose-400/20"
          : pulse
          ? "border-emerald-400 dark:border-emerald-600"
          : "border-slate-200 dark:border-slate-800"
      } bg-white dark:bg-slate-900`}
    >
      {/* Alert banner if active */}
      {activeAlert && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
          <p className="text-xs font-semibold text-rose-800 dark:text-rose-200 flex-1">{activeAlert.message}</p>
          <span className="text-[10px] font-mono text-rose-500 uppercase font-bold px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-700">
            {activeAlert.severity}
          </span>
        </div>
      )}

      {/* Hardware Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              HARDWARE INTEGRATION · ESP32-WROOM-32
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${cat.bg} ${cat.color} ${cat.border}`}>
              {cat.label}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            B.S. Abdur Rahman Crescent Institute of Science and Technology
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Station: <code className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{STATION_ID}</code> · Device: <code className="font-mono text-slate-600 dark:text-slate-300">{DEVICE_ID}</code> · Vandalur, Chennai (12.8797°N, 80.0833°E)
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>WiFi STA · 192.168.1.100</span>
          </div>
          <div className="flex items-center gap-1">
            {online ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-rose-500" />}
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Console Grid: LCD on Left, Keypad on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5">
        {/* Left Column: LCD + Sensor Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                Physical 16x2 I2C Display (Rotates every 5s)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Screen {currentScreenIndex + 1} of 3
              </span>
            </div>
            <Lcd16x2
              scenario={selectedScenario}
              screenIndex={currentScreenIndex}
              tempMessage={tempLcdMessage}
            />
          </div>

          {/* Real-time reading breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-2.5">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">PM2.5</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100">{selectedScenario.pm25}</span>
              <span className="text-[10px] text-slate-400 ml-1">μg/m³</span>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-2.5">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">PM10</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100">{selectedScenario.pm10}</span>
              <span className="text-[10px] text-slate-400 ml-1">μg/m³</span>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-2.5">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Temp / Hum</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                {selectedScenario.temperature}°C · {selectedScenario.humidity}%
              </span>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-2.5">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">MQ135 Gas</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100">{selectedScenario.mq135Raw}</span>
              <span className="text-[10px] text-slate-400 ml-1">raw</span>
            </div>
          </div>

          {/* Scenario Description Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
              Active Scenario: {selectedScenario.shortName} (Key {HARDWARE_SCENARIOS.findIndex((s) => s.id === selectedScenario.id) + 1})
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {selectedScenario.description}
            </p>
          </div>
        </div>

        {/* Right Column: 4x4 Keypad (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <Keypad4x4 onKeyPress={handleKeypadPress} activeKey={activePressedKey} />

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Auto Transmission:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Every 15s</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">HTTP Target:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                /api/v1/ingest
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Last Code:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                {lastHttpCode ? `HTTP ${lastHttpCode}` : "Local Sim OK"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          {ingestStatus === "sending" && (
            <span className="flex items-center gap-1 text-blue-500 font-bold">
              <Upload className="w-3.5 h-3.5 animate-pulse" /> Transmitting to /api/v1/ingest...
            </span>
          )}
          {ingestStatus === "ok" && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Telemetry Ingested (Packets: {txCount})
            </span>
          )}
          {ingestStatus === "error" && (
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" /> Fallback Mode (Simulated Mesh Active)
            </span>
          )}
          {ingestStatus === "idle" && (
            <span className="text-slate-500">
              Station Sync: <span className="text-emerald-500 font-bold">LIVE</span> · Packets Sent: {txCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Last Telemetry: {lastUpdated.toLocaleTimeString("en-IN")} IST</span>
        </div>
      </div>
    </div>
  );
}

export default ESP32LiveWidget;
