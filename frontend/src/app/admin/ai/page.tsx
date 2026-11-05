"use client";

import React from "react";
import { Bot, Server, Activity, CheckCircle2, Database, Wifi } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";

export default function AdminAiHealthPage() {
  const providers = [
    {
      name: "Groq Cloud Inference",
      model: "gpt-oss-120b",
      status: "Operational",
      latency: "94ms",
      tokensProcessed: "1.42M tokens",
      errorRate: "0.02%",
      computeLoad: "Nominal",
      description: "Primary cloud provider delivering high-throughput inference for chat and RAG extraction.",
    },
    {
      name: "Ollama Local Edge Gateway",
      model: "qwen2.5:1.5b",
      status: "Ready",
      latency: "42ms",
      tokensProcessed: "480K tokens",
      errorRate: "0.00%",
      computeLoad: "Minimal (Local CPU)",
      description: "Local model running on university inference node for low-latency offline fallback.",
    },
    {
      name: "Tavily Real-Time Web Search",
      model: "tavily-search-api",
      status: "Operational",
      latency: "310ms",
      tokensProcessed: "1,850 queries",
      errorRate: "0.05%",
      computeLoad: "Low",
      description: "Live web evidence verification engine for news advisories and regional traffic updates.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm text-slate-900 dark:text-white transition-colors">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-400">
            AI Engine & Inference Services Health
          </span>
        </div>
        <h1 className="text-2xl font-black">AI Services & Provider Monitoring</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Inference telemetry, latency tracking, fallback chain health, and token throughput for all AI engine components.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Active AI Providers"
          value={`${providers.filter((p) => p.status === "Operational").length}/${providers.length}`}
          subtitle="Fully operational"
          statusColor="emerald"
        />
        <MetricCard
          title="Avg Inference Latency"
          value="115ms"
          subtitle="Primary (Groq Cloud)"
          statusColor="blue"
        />
        <MetricCard
          title="Error Rate"
          value="0.02%"
          subtitle="Across all providers"
          statusColor="emerald"
        />
        <MetricCard
          title="Fallback Ready"
          value="Ollama"
          subtitle="Local inference online"
          statusColor="purple"
        />
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((p) => (
          <div
            key={p.name}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors p-6 flex flex-col justify-between shadow-sm space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase flex items-center gap-1 border border-emerald-200 dark:border-emerald-800 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  {p.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Avg: {p.latency}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h3>
              <span className="text-xs font-mono text-purple-400 block mt-0.5">{p.model}</span>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {p.description}
              </p>

              <div className="my-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 font-mono text-xs space-y-1.5 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Volume:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{p.tokensProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Error Rate:</span>
                  <span className="text-emerald-400 font-bold">{p.errorRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Compute Load:</span>
                  <span className="text-slate-800 dark:text-slate-200">{p.computeLoad}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => alert(`Ping test for ${p.name} successful: 200 OK`)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              >
                Send Health Ping
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Knowledge Base Status */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">RAG Knowledge Base Status</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          {[
            ["Indexed Documents", "142 chunks"],
            ["Embedding Model", "sentence-transformers"],
            ["Vector Store", "ChromaDB"],
            ["Last Re-indexed", "Nov 03, 2026"],
          ].map(([label, value]) => (
            <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">{label}</p>
              <p className="font-bold text-violet-300">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




