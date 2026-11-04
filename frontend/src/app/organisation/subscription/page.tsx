"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getOrgSubscription } from "@/lib/api/endpoints";
import { OrgSubscription } from "@/lib/types";
import { PlanBadge } from "@/components/ui/PlanBadge";
import { CreditCard, CheckCircle2, Download, ArrowRight, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function OrgSubscriptionPage() {
  const [sub, setSub] = useState<OrgSubscription | null>(null);

  useEffect(() => {
    getOrgSubscription().then(setSub);
  }, []);

  if (!sub) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Subscription, Entitlements & Billing
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review active tier capabilities, billing renewal schedule, and certified tax invoices.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                Current Active Tier
              </span>
              <PlanBadge tier={sub.tier} size="sm" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {sub.plan_name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Billed {sub.billing_cycle} &bull; Next renewal on {formatDate(sub.current_period_end)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 transition"
            >
              <span>Change Subscription Tier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Invoices History */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Billing History & GST Tax Invoices
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Invoice Number</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment Status</th>
                  <th className="py-2.5 px-3 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sub.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {inv.id}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {formatDate(inv.date)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      ₹{inv.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Downloading Invoice ${inv.id}`)}
                        className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

