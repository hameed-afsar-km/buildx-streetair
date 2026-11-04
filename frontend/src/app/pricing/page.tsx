"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getSubscriptionPlans } from "@/lib/api/endpoints";
import { SubscriptionPlan } from "@/lib/types";
import { Check, Sparkles, Building2, Zap, ArrowRight, HelpCircle } from "lucide-react";
import { PlanBadge } from "@/components/ui/PlanBadge";

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  useEffect(() => {
    getSubscriptionPlans().then(setPlans);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Title & Billing Toggle */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Commercial SaaS Tiers
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Predictable Pricing for Campuses, Industries & Cities
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            From single-beacon educational research monitoring to municipal smart-city mesh deployments.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <span
              className={`text-xs font-bold ${
                billingCycle === "monthly" ? "text-slate-900 dark:text-white" : "text-slate-500"
              }`}
            >
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              aria-label="Toggle Annual or Monthly Billing"
              className="relative w-12 h-6 rounded-full bg-brand-600 p-0.5 transition"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  billingCycle === "annual" ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold flex items-center gap-1.5 ${
                billingCycle === "annual" ? "text-slate-900 dark:text-white" : "text-slate-500"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const price = billingCycle === "annual" ? plan.price_annual : plan.price_monthly;
            const periodLabel = billingCycle === "annual" ? "/year" : "/month";

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-8 flex flex-col justify-between shadow-sm transition relative ${
                  plan.popular
                    ? "border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-slate-900 shadow-xl"
                    : "border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-brand-600 text-white shadow-sm uppercase tracking-wider">
                    Most Popular for Colleges & Plants
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <PlanBadge tier={plan.tier} size="sm" />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-xs font-bold text-slate-400 font-mono">₹</span>
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{periodLabel}</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    href={`/contact?plan=${plan.id}`}
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition shadow-sm ${
                      plan.popular
                        ? "bg-brand-600 hover:bg-brand-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    }`}
                  >
                    <span>Request Subscription Onboarding</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Commercial Features Comparison Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Plan Entitlement & Quota Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
                <tr>
                  <th className="py-3 px-4">Entitlement Feature</th>
                  <th className="py-3 px-4">Starter</th>
                  <th className="py-3 px-4">Professional</th>
                  <th className="py-3 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    Continuous Monitoring Stations
                  </td>
                  <td className="py-3 px-4 font-mono">1 Station</td>
                  <td className="py-3 px-4 font-mono">Up to 5 Stations</td>
                  <td className="py-3 px-4 font-mono">Unlimited Mesh</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    Historical Data Retention
                  </td>
                  <td className="py-3 px-4 font-mono">30 Days</td>
                  <td className="py-3 px-4 font-mono">90 Days</td>
                  <td className="py-3 px-4 font-mono">3 Years</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    Pollution Detective Anomaly Analysis
                  </td>
                  <td className="py-3 px-4 font-mono">Basic</td>
                  <td className="py-3 px-4 font-mono">Advanced Apportionment</td>
                  <td className="py-3 px-4 font-mono">Full Neural Stack</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    What-If City Simulator
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">—</td>
                  <td className="py-3 px-4 font-mono text-slate-400">—</td>
                  <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Included
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    CPCB Audit Reports
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">—</td>
                  <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Automated Monthly
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Custom Schedule
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

