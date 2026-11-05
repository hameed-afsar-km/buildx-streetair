"use client";

import React, { useState } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Search, Filter, Building2, Radio, Users, CheckCircle2, Clock } from "lucide-react";

interface OrgRow {
  id: string;
  name: string;
  type: "university" | "government" | "industry" | "ngo";
  adminEmail: string;
  stationsCount: number;
  usersCount: number;
  status: "Active" | "Inactive";
  joinedDate: string;
  primaryContact: string;
}

const INITIAL_ORGS: OrgRow[] = [
  {
    id: "org-001",
    name: "B.S. Abdur Rahman Crescent Institute of Science & Technology",
    type: "university",
    adminEmail: "admin@crescent.ac.in",
    stationsCount: 3,
    usersCount: 12,
    status: "Active",
    joinedDate: "Mar 2026",
    primaryContact: "Dr. A. K. Sundaram",
  },
  {
    id: "org-002",
    name: "Chennai Metropolitan Development Authority (CMDA)",
    type: "government",
    adminEmail: "env@cmda.gov.in",
    stationsCount: 8,
    usersCount: 24,
    status: "Active",
    joinedDate: "Apr 2026",
    primaryContact: "K. R. Vengat",
  },
  {
    id: "org-003",
    name: "Tamil Nadu Pollution Control Board (TNPCB)",
    type: "government",
    adminEmail: "monitoring@tnpcb.gov.in",
    stationsCount: 12,
    usersCount: 18,
    status: "Active",
    joinedDate: "Apr 2026",
    primaryContact: "Priya Ramanathan",
  },
  {
    id: "org-004",
    name: "Hexaware Technologies Campus — Siruseri IT Park",
    type: "industry",
    adminEmail: "environment@hexaware.com",
    stationsCount: 2,
    usersCount: 5,
    status: "Active",
    joinedDate: "Jun 2026",
    primaryContact: "Karthik Subramanian",
  },
  {
    id: "org-005",
    name: "Clean Air Tamil Nadu (CATN) — NGO",
    type: "ngo",
    adminEmail: "info@cleanairtamilnadu.org",
    stationsCount: 1,
    usersCount: 4,
    status: "Active",
    joinedDate: "Aug 2026",
    primaryContact: "Meera Pillai",
  },
  {
    id: "org-006",
    name: "Tambaram Municipal Corporation",
    type: "government",
    adminEmail: "env@tambaram.gov.in",
    stationsCount: 2,
    usersCount: 6,
    status: "Inactive",
    joinedDate: "Sep 2026",
    primaryContact: "V. Rajendran",
  },
];

const TYPE_LABELS: Record<string, string> = {
  university: "University",
  government: "Government",
  industry: "Industry",
  ngo: "NGO",
};

const TYPE_COLORS: Record<string, string> = {
  university: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  government: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  industry: "bg-amber-950 text-amber-300 border-amber-800",
  ngo: "bg-violet-950 text-violet-300 border-violet-800",
};

export default function AdminOrganisationsPage() {
  const [orgs, setOrgs] = useState<OrgRow[]>(INITIAL_ORGS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const toggleStatus = (id: string) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: o.status === "Active" ? "Inactive" : "Active" }
          : o
      )
    );
  };

  const filtered = orgs.filter((o) => {
    const matchSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
      o.primaryContact.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || o.type === typeFilter;
    return matchSearch && matchType;
  });

  const active = orgs.filter((o) => o.status === "Active");
  const totalStations = orgs.reduce((acc, o) => acc + o.stationsCount, 0);
  const totalUsers = orgs.reduce((acc, o) => acc + o.usersCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-900 dark:text-white transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
              Partner Network & Access Registry
            </span>
          </div>
          <h1 className="text-2xl font-black">Connected Organisations</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Universities, government agencies, industry partners, and NGOs connected to the STREETAIR monitoring network.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Organisation onboarding form coming soon")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm shrink-0"
        >
          <Building2 className="w-4 h-4" />
          Onboard Organisation
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Organisations"
          value={orgs.length}
          subtitle="Network partners"
          statusColor="blue"
        />
        <MetricCard
          title="Active Partners"
          value={active.length}
          subtitle="Currently operational"
          statusColor="emerald"
        />
        <MetricCard
          title="Total Stations"
          value={totalStations}
          subtitle="Across all partners"
          statusColor="amber"
        />
        <MetricCard
          title="Total Users"
          value={totalUsers}
          subtitle="Registered across partners"
          statusColor="purple"
        />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Search by name, email, or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="university">University</option>
            <option value="government">Government</option>
            <option value="industry">Industry</option>
            <option value="ngo">NGO</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Organisation</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Admin Email</th>
                <th className="py-3 px-4 text-center">Stations</th>
                <th className="py-3 px-4 text-center">Users</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {filtered.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{org.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Contact: {org.primaryContact}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${TYPE_COLORS[org.type]}`}>
                      {TYPE_LABELS[org.type]}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono text-[11px]">{org.adminEmail}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                      <Radio className="w-3 h-3 text-emerald-400" />
                      {org.stationsCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                      <Users className="w-3 h-3 text-blue-400" />
                      {org.usersCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      org.status === "Active"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                    }`}>
                      {org.status === "Active" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {org.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{org.joinedDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleStatus(org.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                        org.status === "Active"
                          ? "bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900"
                          : "bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                      }`}
                    >
                      {org.status === "Active" ? "Deactivate" : "Reactivate"}
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




