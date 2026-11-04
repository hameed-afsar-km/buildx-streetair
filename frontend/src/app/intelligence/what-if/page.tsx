"use client";

import React, { useState, useEffect } from "react";
import { runWhatIfSimulation } from "@/lib/api/endpoints";
import { WhatIfScenarioResult } from "@/lib/types";
import { WhatIfComparisonChart } from "@/components/charts/WhatIfComparisonChart";
import {
  SlidersHorizontal,
  Sparkles,
  TreePine,
  Car,
  Factory,
  ArrowRight,
  Info,
  CheckCircle2,
} from "lucide-react";

export default function WhatIfSimulatorPage() {
  const [trafficReduction, setTrafficReduction] = useState(30);
  const [greenCanopy, setGreenCanopy] = useState(20);
  const [industrialCurtailment, setIndustrialCurtailment] = useState(15);
  const [simulationResult, setSimulationResult] = useState<WhatIfScenarioResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const executeSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await runWhatIfSimulation({
        traffic_reduction_pct: trafficReduction,
        green_canopy_gain_pct: greenCanopy,
        industrial_curtailment_pct: industrialCurtailment,
      });
      setSimulationResult(res);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    executeSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-600 text-white">
            <SlidersHorizontal className="w-4 h-4" />
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            What-If City Simulator: Policy Intervention Modeling
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Simulate urban policy interventions: predict regional AQI delta when highway traffic is
          curtailed or urban green canopy expands.
        </p>
      </div>

      {/* Model Limitations Notice */}
      <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/70 dark:bg-purple-950/30 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Simulation Scope & Scientific Limitations:</strong> Predictions are computed by
          surrogate neural spatial-dispersion models trained on historical Chennai meteorology.
          Results are simulated estimates, not guaranteed real-world outcomes.
        </div>
      </div>

      {/* Policy Controls Strip */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Urban Mitigation Policy Knobs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Traffic */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <Car className="w-4 h-4 text-blue-600" />
                GST Corridor Traffic Reduction
              </span>
              <span className="font-mono font-bold text-brand-600">-{trafficReduction}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={trafficReduction}
              onChange={(e) => setTrafficReduction(+e.target.value)}
              className="w-full accent-brand-600"
            />
            <p className="text-[10px] text-slate-400">Truck bypass & congestion tolling</p>
          </div>

          {/* Green Canopy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <TreePine className="w-4 h-4 text-emerald-600" />
                Urban Tree Canopy Gain
              </span>
              <span className="font-mono font-bold text-emerald-600">+{greenCanopy}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={greenCanopy}
              onChange={(e) => setGreenCanopy(+e.target.value)}
              className="w-full accent-emerald-600"
            />
            <p className="text-[10px] text-slate-400">Perimeter afforestation & bioswales</p>
          </div>

          {/* Industrial */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <Factory className="w-4 h-4 text-purple-600" />
                Industrial Stack Curtailment
              </span>
              <span className="font-mono font-bold text-purple-600">-{industrialCurtailment}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={industrialCurtailment}
              onChange={(e) => setIndustrialCurtailment(+e.target.value)}
              className="w-full accent-purple-600"
            />
            <p className="text-[10px] text-slate-400">SIPCOT boiler emission caps</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={isSimulating}
            onClick={executeSimulation}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            <span>{isSimulating ? "Computing Model Response..." : "Run Neural Policy Simulation"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Results Section */}
      {simulationResult && (
        <div className="space-y-6">
          {/* Key Deltas Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                Observed Baseline AQI
              </span>
              <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-200">
                {simulationResult.baseline_aqi}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/50 dark:bg-brand-950/20 shadow-sm text-center">
              <span className="text-[10px] font-mono text-brand-600 block uppercase font-bold">
                Simulated Policy AQI
              </span>
              <span className="text-2xl font-black font-mono text-brand-600">
                {simulationResult.simulated_aqi}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                Overall AQI Delta
              </span>
              <span className="text-2xl font-black font-mono text-emerald-600">
                {simulationResult.aqi_delta} AQI
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                Model Confidence
              </span>
              <span className="text-2xl font-black font-mono text-purple-600">
                {Math.round(simulationResult.confidence_score * 100)}%
              </span>
            </div>
          </div>

          {/* Comparison Projection Chart */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Hourly Diurnal Comparison (Baseline vs Policy Simulation)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Projected mitigation curves across a 24-hour commute and industrial cycle.
            </p>
            <WhatIfComparisonChart
              hourlyProjection={simulationResult.hourly_projection}
              height={280}
            />
          </div>

          {/* Model Assumptions & Limitations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase font-mono text-[11px]">
                Model Assumptions:
              </h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                {simulationResult.assumptions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase font-mono text-[11px]">
                Boundary Limitations:
              </h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                {simulationResult.limitations.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

