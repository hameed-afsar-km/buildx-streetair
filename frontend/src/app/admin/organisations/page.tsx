"use client";

import React, { useState } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { PlanBadge } from "@/components/ui/PlanBadge";
import { Building2, Search, Filter, ShieldAlert, CheckCircle2, UserCheck, Plus } from "lucide-react";

interface OrgRow {
  id: string;
  name: string;
  plan: "starter" | "professional" | "enterprise";
  adminEmail: string;
  stationsCount: number;
  usersCount: number;
  status: "Active" | "Trial" | "Suspended";
  joinedDate: string;
}

const INITIAL_ORGS: OrgRow[] = [
  {
    id: "org-01",
    name: "B.S. Abdur Rahman Crescent Institute",
    plan: "professional",
    adminEmail: "admin@crescent.ac.in",
    stationsCount: 3,
    usersCount: 12,
    status: "Active",
    joinedDate: "2026-01-15",
  },
  {
    id: "org-02",
    name: "Chennai Metropolitan Development Authority",
    plan: "enterprise",
    adminEmail: "ops@chennaimetro.gov.in",
    stationsCount: 15,
    usersCount: 48,
    status: "Active",
    joinedDate: "2025-11-20",
  },
  {
    id: "org-03",
    name: "Tamil Nadu Pollution Control Board (TNPCB)",
    plan: "enterprise",
    adminEmail: "data@tnpcb.gov.in",
    stationsCount: 8,
    usersCount: 22,
    status: "Active",
    joinedDate: "2026-02-10",
  },
  {
    id: "org-04",
    name: "Hexaware Tech Park Campus",
    plan: "professional",
    adminEmail: "env@hexaware.com",
    stationsCount: 2,
    usersCount: 5,
    status: "Active",
    joinedDate: "2026-05-01",
  },
  {
    id: "org-05",
    name: "EcoSense Environmental Consultants",
    plan: "starter",
    adminEmail: "contact@ecosense.in",
    stationsCount: 1,
    usersCount: 3,
    status: "Trial",
    joinedDate: "2026-10-20",
  },
];

export default function AdminOrganisationsPage() {
  const [orgs, setOrgs] = useState<OrgRow[]>(INITIAL_ORGS);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const toggleStatus = (id: string) => {
    setOrgs((prev) =>
      prev.map((org) => {
        if (org.id !== id) return org;
        const nextStatus = org.status === "Active" ? "Suspended" : "Active";
        return { ...org, status: nextStatus };
      })
    );
  };

  const filtered = orgs.filter((o) => {
    const matchSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.adminEmail.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || o.plan === planFilter;
    return matchSearch && matchPlan;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Multi-Tenant Governance & Organizations
            </span>
          </div>
          <h1 className="text-2xl font-black">Registered Tenants & Organizations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise tenants, educational campuses, municipal bodies, and environmental consulting firms on STREETAIR.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          Provision New Tenant
        </button>
      </div>

      {/* API Notice Banner */}
      <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800 text-xs text-blue-300 flex items-center justify-between">
        <span>
          ℹ️ <strong>Developer Notice:</strong> Multi-tenant management API endpoint is under active contract finalization. Currently rendering verified schema state.
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Organizations"
          value={orgs.length}
          subtitle="All tiers"
          statusColor="blue"
        />
        <MetricCard
          title="Active Deployments"
          value={orgs.filter((o) => o.status === "Active").length}
          subtitle="Reporting sensors"
          statusColor="emerald"
        />
        <MetricCard
          title="Total Managed Sensors"
          value={orgs.reduce((acc, o) => acc + o.stationsCount, 0)}
          subtitle="Across all tenants"
          statusColor="purple"
        />
        <MetricCard
          title="Total Provisioned Seats"
          value={orgs.reduce((acc, o) => acc + o.usersCount, 0)}
          subtitle="Active team members"
          statusColor="amber"
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Search by organization name or admin email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Subscription Plans</option>
            <option value="enterprise">Enterprise</option>
            <option value="professional">Professional</option>
            <option value="starter">Starter</option>
          </select>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Organization Name</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">Admin Email</th>
                <th className="py-3 px-4">Sensors</th>
                <th className="py-3 px-4">Seats</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((org) => (
                <tr key={org.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {org.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{org.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <PlanBadge tier={org.plan} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                    {org.adminEmail}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    {org.stationsCount} stations
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {org.usersCount} users
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        org.status === "Active"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : org.status === "Trial"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {org.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {org.joinedDate}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => toggleStatus(org.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                        org.status === "Active"
                          ? "bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900"
                          : "bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                      }`}
                    >
                      {org.status === "Active" ? "Suspend" : "Activate"}
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

