"use client";

import React, { useState } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { PlanBadge } from "@/components/ui/PlanBadge";
import { CreditCard, FileText, Download, CheckCircle2, AlertCircle } from "lucide-react";

interface SubRow {
  id: string;
  orgName: string;
  plan: "starter" | "professional" | "enterprise";
  status: "Active" | "Trialing" | "Canceled";
  amount: number;
  billingCycle: "Monthly" | "Annual";
  nextRenewal: string;
  invoiceId: string;
}

const INITIAL_SUBSCRIPTIONS: SubRow[] = [
  {
    id: "sub-01",
    orgName: "B.S. Abdur Rahman Crescent Institute",
    plan: "professional",
    status: "Active",
    amount: 19999,
    billingCycle: "Monthly",
    nextRenewal: "2026-12-01",
    invoiceId: "INV-2026-11-001",
  },
  {
    id: "sub-02",
    orgName: "Chennai Metropolitan Development Authority",
    plan: "enterprise",
    status: "Active",
    amount: 74999,
    billingCycle: "Annual",
    nextRenewal: "2027-11-20",
    invoiceId: "INV-2025-11-089",
  },
  {
    id: "sub-03",
    orgName: "Tamil Nadu Pollution Control Board",
    plan: "enterprise",
    status: "Active",
    amount: 74999,
    billingCycle: "Annual",
    nextRenewal: "2027-02-10",
    invoiceId: "INV-2026-02-042",
  },
  {
    id: "sub-04",
    orgName: "Hexaware Tech Park Campus",
    plan: "professional",
    status: "Active",
    amount: 19999,
    billingCycle: "Monthly",
    nextRenewal: "2026-12-05",
    invoiceId: "INV-2026-11-014",
  },
  {
    id: "sub-05",
    orgName: "EcoSense Environmental Consultants",
    plan: "starter",
    status: "Trialing",
    amount: 4999,
    billingCycle: "Monthly",
    nextRenewal: "2026-11-15",
    invoiceId: "INV-TRIAL-005",
  },
];

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubRow[]>(INITIAL_SUBSCRIPTIONS);

  const totalMRR = subscriptions
    .filter((s) => s.status === "Active")
    .reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Recurring Revenue & Billing Operations
            </span>
          </div>
          <h1 className="text-2xl font-black">Organization Subscriptions & Invoicing</h1>
          <p className="text-xs text-slate-400 mt-1">
            Subscription lifecycle management, GST invoices, annual contracts, and collection telemetry.
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800 text-xs text-blue-300">
        ℹ️ <strong>Billing System Notice:</strong> Payment gateway integration (Razorpay / Stripe India) is currently set to Sandbox mode.
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={`₹${totalMRR.toLocaleString()}`}
          subtitle="Active MRR (INR)"
          statusColor="emerald"
        />
        <MetricCard
          title="Active Subscriptions"
          value={subscriptions.filter((s) => s.status === "Active").length}
          subtitle="Commercial accounts"
          statusColor="blue"
        />
        <MetricCard
          title="Trialing Accounts"
          value={subscriptions.filter((s) => s.status === "Trialing").length}
          subtitle="14-day pilots"
          statusColor="amber"
        />
        <MetricCard
          title="Churn Rate (30d)"
          value="0.0%"
          subtitle="Zero churn"
          statusColor="emerald"
        />
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Organization Name</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Billing Rate</th>
                <th className="py-3 px-4">Cadence</th>
                <th className="py-3 px-4">Next Renewal</th>
                <th className="py-3 px-4">Latest Invoice</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-100">
                    {sub.orgName}
                  </td>
                  <td className="py-3.5 px-4">
                    <PlanBadge tier={sub.plan} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sub.status === "Active"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : sub.status === "Trialing"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    ₹{sub.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{sub.billingCycle}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{sub.nextRenewal}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    {sub.invoiceId}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition">
                      <FileText className="w-3 h-3 text-slate-400" />
                      Invoice
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

