"use client";

import React, { useState, useEffect } from "react";
import { getSubscriptionPlans } from "@/lib/api/endpoints";
import { SubscriptionPlan } from "@/lib/types";
import { PlanBadge } from "@/components/ui/PlanBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Check, Sparkles, Building2, Zap, Edit3, ShieldCheck } from "lucide-react";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionPlans().then((data) => {
      setPlans(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Commercial Tier & Quota Configuration
            </span>
          </div>
          <h1 className="text-2xl font-black">Subscription Plans & Quota Limits</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure pricing tiers, ingest quotas, storage retention rules, and feature flags for enterprise customers.
          </p>
        </div>
      </div>

      {/* Plan Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-96 rounded-2xl" />
          <LoadingSkeleton className="h-96 rounded-2xl" />
          <LoadingSkeleton className="h-96 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between bg-slate-900/80 transition relative ${
                p.popular ? "border-emerald-600 ring-1 ring-emerald-600/50" : "border-slate-800"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <PlanBadge tier={p.tier} size="md" />
                  <span className="text-[11px] font-mono text-slate-400">{p.id}</span>
                </div>

                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{p.description}</p>

                <div className="my-5 pb-5 border-b border-slate-800">
                  <span className="text-3xl font-black text-white font-mono">
                    ₹{p.price_monthly.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                  <div className="text-[11px] text-emerald-400 font-mono mt-1">
                    Billed annually: ₹{p.price_annual.toLocaleString()} / year
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Included Features:
                  </span>
                  {p.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Max: <strong className="text-slate-200">{p.limits.max_stations} stations</strong>
                </span>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition">
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Tier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feature Matrix Comparison Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Technical Specification & Resource Quota Matrix
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Feature / Resource</th>
                <th className="py-3 px-4">Starter</th>
                <th className="py-3 px-4">Professional</th>
                <th className="py-3 px-4">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-slate-200">Max Monitoring Stations</td>
                <td className="py-3 px-4 font-mono text-slate-300">1 Node</td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-bold">5 Nodes</td>
                <td className="py-3 px-4 font-mono text-indigo-400 font-bold">Unlimited / Custom</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-slate-200">API Calls / Month</td>
                <td className="py-3 px-4 font-mono text-slate-300">25,000</td>
                <td className="py-3 px-4 font-mono text-slate-300">250,000</td>
                <td className="py-3 px-4 font-mono text-slate-300">2,500,000+</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-slate-200">Telemetry Retention</td>
                <td className="py-3 px-4 font-mono text-slate-300">30 Days</td>
                <td className="py-3 px-4 font-mono text-slate-300">90 Days</td>
                <td className="py-3 px-4 font-mono text-slate-300">365 Days / Permanent</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-slate-200">AI Intelligence Queries</td>
                <td className="py-3 px-4 font-mono text-slate-300">100 / mo</td>
                <td className="py-3 px-4 font-mono text-slate-300">1,000 / mo</td>
                <td className="py-3 px-4 font-mono text-slate-300">Unlimited (Groq/Ollama)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-slate-200">Team Members with RBAC</td>
                <td className="py-3 px-4 font-mono text-slate-300">3 Members</td>
                <td className="py-3 px-4 font-mono text-slate-300">15 Members</td>
                <td className="py-3 px-4 font-mono text-slate-300">Unlimited</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-slate-200">SLA Guarantee</td>
                <td className="py-3 px-4 text-slate-400">Best effort (99.0%)</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">99.5% Uptime SLA</td>
                <td className="py-3 px-4 text-indigo-400 font-semibold">99.95% Enterprise SLA</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-slate-200">Support Channel</td>
                <td className="py-3 px-4 text-slate-400">Community / Email</td>
                <td className="py-3 px-4 text-slate-300">Priority Email & Chat</td>
                <td className="py-3 px-4 text-indigo-400 font-semibold">24/7 Dedicated Account Rep</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

