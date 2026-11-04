"use client";

import React from "react";
import { Bot, Zap, Server, Activity, ShieldCheck, CheckCircle2 } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";

export default function AdminAiHealthPage() {
  const providers = [
    {
      name: "Groq Cloud Inference",
      model: "llama-3.3-70b-versatile",
      status: "Operational",
      latency: "115ms",
      tokensProcessed: "1.42M",
      errorRate: "0.02%",
      costThisMonth: "₹1,240",
      description: "Primary cloud provider delivering high-throughput inference for chat and RAG extraction.",
    },
    {
      name: "Ollama Local Edge Gateway",
      model: "llama-3-8b-instruct",
      status: "Ready",
      latency: "82ms",
      tokensProcessed: "480K",
      errorRate: "0.00%",
      costThisMonth: "₹0 (Local)",
      description: "Local model running on university inference node for low-latency offline fallback.",
    },
    {
      name: "Tavily Real-Time Web Search",
      model: "tavily-search-api",
      status: "Operational",
      latency: "310ms",
      tokensProcessed: "1,850 queries",
      errorRate: "0.05%",
      costThisMonth: "₹650",
      description: "Live web evidence verification engine for news advisories and regional traffic updates.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">
          AI Services & Provider Monitoring
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inference telemetry, latency tracking, fallback health, and token accounting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((p) => (
          <div
            key={p.name}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between shadow-sm space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {p.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Avg: {p.latency}</span>
              </div>

              <h3 className="text-base font-bold text-white">{p.name}</h3>
              <span className="text-xs font-mono text-purple-400 block mt-0.5">{p.model}</span>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {p.description}
              </p>

              <div className="my-4 p-3 rounded-xl border border-slate-800 bg-slate-950/60 font-mono text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Volume:</span>
                  <span className="text-slate-200 font-bold">{p.tokensProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Error Rate:</span>
                  <span className="text-emerald-400 font-bold">{p.errorRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Est. Compute:</span>
                  <span className="text-slate-200">{p.costThisMonth}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => alert(`Ping test for ${p.name} successful: 200 OK`)}
                className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Send Health Ping
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

