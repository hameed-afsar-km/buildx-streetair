"use client";

import React, { useState } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import {
  Cpu,
  BrainCircuit,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Sparkles,
} from "lucide-react";

interface ModelEntry {
  id: string;
  name: string;
  type: string;
  version: string;
  status: "ACTIVE" | "TRAINING" | "DEPRECATED";
  accuracy: string;
  lastTrained: string;
  description: string;
  framework: string;
}

const INITIAL_MODELS: ModelEntry[] = [
  {
    id: "mdl-01",
    name: "AQI-LSTM-v2",
    type: "Time Series Forecast",
    version: "2.1.0",
    status: "ACTIVE",
    accuracy: "94.2%",
    lastTrained: "2026-10-15",
    description: "Multi-horizon bidirectional LSTM network for 72-hour AQI trajectory forecasting.",
    framework: "PyTorch 2.4",
  },
  {
    id: "mdl-02",
    name: "Source-Apportionment-RF",
    type: "Classification / Source",
    version: "1.3.2",
    status: "ACTIVE",
    accuracy: "87.8%",
    lastTrained: "2026-10-20",
    description: "Random Forest ensemble for distinguishing vehicular NO2, waste burning, and dust signatures.",
    framework: "Scikit-Learn",
  },
  {
    id: "mdl-03",
    name: "Anomaly-IsolForest",
    type: "Outlier Detection",
    version: "1.1.0",
    status: "ACTIVE",
    accuracy: "91.5%",
    lastTrained: "2026-11-01",
    description: "Isolation forest pipeline detecting sensor drift, hardware clogs, and local emission spikes.",
    framework: "Scikit-Learn",
  },
  {
    id: "mdl-04",
    name: "Prophet-Seasonal",
    type: "Seasonal Decomposition",
    version: "3.0.1",
    status: "ACTIVE",
    accuracy: "89.3%",
    lastTrained: "2026-10-28",
    description: "Decomposes diurnal traffic and northeast monsoon meteorological cycles in Tamil Nadu.",
    framework: "Prophet",
  },
  {
    id: "mdl-05",
    name: "RAG-Embeddings",
    type: "Vector Semantic Retrieval",
    version: "1.0.0",
    status: "ACTIVE",
    accuracy: "N/A (k-NN)",
    lastTrained: "2026-10-30",
    description: "Embeddings generator for indexing CPCB guidelines, WHO air criteria, and campus sensor history.",
    framework: "Sentence-Transformers",
  },
];

export default function AdminModelsPage() {
  const [models, setModels] = useState<ModelEntry[]>(INITIAL_MODELS);
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRetrain = (id: string, name: string) => {
    setTrainingId(id);
    setMessage(`Queued asynchronous training job for model ${name} on Ray Cluster...`);
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "TRAINING" } : m))
    );

    setTimeout(() => {
      setTrainingId(null);
      setModels((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                status: "ACTIVE",
                lastTrained: new Date().toISOString().split("T")[0],
              }
            : m
        )
      );
      setMessage(`Model ${name} training successfully completed and deployed to FastAPI inference.`);
      setTimeout(() => setMessage(null), 4000);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
              Machine Learning Model Registry & Weights
            </span>
          </div>
          <h1 className="text-2xl font-black">AI & Predictive Model Registry</h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered forecasting architectures, anomaly detectors, and source apportionment models serving FastAPI inference pipelines.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-purple-950/70 border border-purple-800 text-xs text-purple-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total ML Models"
          value={models.length}
          subtitle="In model store"
          statusColor="blue"
        />
        <MetricCard
          title="Active in Production"
          value={models.filter((m) => m.status === "ACTIVE").length}
          subtitle="Inference active"
          statusColor="emerald"
        />
        <MetricCard
          title="Average Validation Accuracy"
          value="90.7%"
          subtitle="Weighted across pipelines"
          statusColor="purple"
        />
        <MetricCard
          title="Next Scheduled Retrain"
          value="In 4 Days"
          subtitle="Weekly drift cycle"
          statusColor="amber"
        />
      </div>

      {/* Models Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Production Models & Inference Endpoints
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Registry: v2.1-prod</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Model Name & Type</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Framework</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Trained</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                      {model.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {model.type} · <span className="italic">{model.description}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                    {model.version}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                    {model.framework}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {model.accuracy}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        model.status === "ACTIVE"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : model.status === "TRAINING"
                          ? "bg-amber-950 text-amber-300 border border-amber-800 animate-pulse"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {model.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">
                    {model.lastTrained}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleRetrain(model.id, model.name)}
                      disabled={trainingId === model.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition disabled:opacity-50"
                    >
                      <RotateCw
                        className={`w-3 h-3 ${trainingId === model.id ? "animate-spin" : ""}`}
                      />
                      {trainingId === model.id ? "Training..." : "Retrain"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

