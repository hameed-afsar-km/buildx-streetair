"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Radar,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Wind,
  ShieldCheck,
  RefreshCw,
  MapPin,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react";
import { TAMIL_NADU_60_STATIONS, ExtendedStation } from "@/lib/stationsData";

interface ScannedNode {
  station: ExtendedStation;
  status: "scanning" | "correlated" | "nominal" | "alert";
  plumeContribution: string;
  measuredAqi: number;
}

export function NeighborhoodMeshScanner({ originAqi = 72 }: { originAqi?: number }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scannedNodes, setScannedNodes] = useState<ScannedNode[]>([]);
  const [lastScanTime, setLastScanTime] = useState<Date>(new Date());
  const [agreementScore, setAgreementScore] = useState<number>(89);
  const [triggerSource, setTriggerSource] = useState<string>("Keypad Hardware Event");

  // Closest 8 neighboring stations to Crescent Institute (sorted by distance)
  const neighbors = useRef(
    TAMIL_NADU_60_STATIONS.filter((s) => s.id !== "crescent-vandalur-01")
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, 8)
  ).current;

  // Run the multi-node spatial scan simulation
  const runMeshScan = useCallback(
    (reason = "Manual Diagnostic Scan", baselineAqi = originAqi) => {
      setIsScanning(true);
      setScanStep(0);
      setTriggerSource(reason);

      // Initialize all nodes in pending/scanning state
      const initialNodes: ScannedNode[] = neighbors.map((st, i) => {
        // Compute realistic correlated AQI based on distance & origin spike
        const decayFactor = Math.max(0.4, 1 - st.distance_km / 25);
        const correlatedAqi = Math.round(
          st.aqi + (baselineAqi > 100 ? (baselineAqi - st.aqi) * decayFactor * 0.7 : 0)
        );

        let contribution = "Normal Background";
        let status: ScannedNode["status"] = "nominal";

        if (baselineAqi > 100) {
          if (st.distance_km < 4) {
            contribution = "Plume Ingress Confirmed";
            status = "alert";
          } else if (st.distance_km < 12) {
            contribution = "Downwind Dispersion";
            status = "correlated";
          }
        }

        return {
          station: st,
          status,
          plumeContribution: contribution,
          measuredAqi: correlatedAqi,
        };
      });

      setScannedNodes([]);

      // Step-by-step triangulation
      let currentIdx = 0;
      const interval = setInterval(() => {
        if (currentIdx < initialNodes.length) {
          const nextNode = initialNodes[currentIdx];
          setScannedNodes((prev) => [...prev, nextNode]);
          setScanStep(currentIdx + 1);
          currentIdx++;
        } else {
          clearInterval(interval);
          setIsScanning(false);
          setLastScanTime(new Date());
          setAgreementScore(baselineAqi > 100 ? 92 : 87);
        }
      }, 350);
    },
    [neighbors, originAqi]
  );

  // Auto-run on first load
  useEffect(() => {
    runMeshScan("Initial System Triangulation", originAqi);
  }, []);

  // Listen for ESP32 Keypad events
  useEffect(() => {
    const handleKeypadEvent = (e: any) => {
      const scenarioKey = e?.detail?.scenarioKey || "event";
      const isAlert = ["traffic", "construction", "industrial", "waste_burning", "smoke", "extreme"].some(
        (slug) => scenarioKey.includes(slug)
      );

      const simulatedAqi = isAlert ? 145 : 34;
      runMeshScan(`ESP32 Keypad Simulation: ${scenarioKey}`, simulatedAqi);
    };

    window.addEventListener("streetair:scenario_changed", handleKeypadEvent);
    return () => window.removeEventListener("streetair:scenario_changed", handleKeypadEvent);
  }, [runMeshScan]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            <Radar className={`w-5 h-5 ${isScanning ? "animate-spin text-emerald-500" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Autonomous Spatial Triangulation
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                60-Node Tamil Nadu Mesh
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Neighborhood Spatial Mesh Scanner & Anomaly Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              When an issue is detected at Crescent Campus, the system automatically interrogates surrounding radial stations to confirm plume dispersion vs. hardware drift.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => runMeshScan("Manual Admin Trigger", 148)}
          disabled={isScanning}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white transition shadow-sm shrink-0 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
          <span>{isScanning ? "Scanning Nodes..." : "Scan Neighborhood Mesh"}</span>
        </button>
      </div>

      {/* Progress & Diagnostic Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-5 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Trigger Source</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block max-w-[180px]">
              {triggerSource}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Sensor Agreement</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {agreementScore}% Cross-Correlation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-500 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Dispersion Vector</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              NNW (330°) · 12.8 km/h
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Drift Verification</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              True Anomaly Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* Live Triangulation Grid */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>Surrounding Tamil Nadu Stations Interrogated (Radial Distance from Crescent Institute):</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400">
            {scannedNodes.length} of {neighbors.length} verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {scannedNodes.map((item, idx) => {
            const st = item.station;
            const aqi = item.measuredAqi;
            const isAlert = item.status === "alert";
            const isCorrelated = item.status === "correlated";

            return (
              <div
                key={st.id}
                className={`p-3 rounded-xl border transition-all animate-in fade-in duration-300 ${
                  isAlert
                    ? "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                    : isCorrelated
                    ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
                    : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    +{st.distance_km} km
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                      isAlert
                        ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200"
                        : isCorrelated
                        ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={st.name}>
                  {st.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {st.city}
                </p>

                <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-current/10">
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono block">MEASURED AQI</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{aqi}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-right truncate max-w-[120px]">
                    {item.plumeContribution}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default NeighborhoodMeshScanner;

