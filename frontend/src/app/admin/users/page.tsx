"use client";

import React, { useState } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { UserCheck, Search, Filter, ShieldCheck, ShieldAlert, User, MoreVertical } from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "platform_admin" | "org_admin" | "citizen";
  organisation: string;
  status: "Active" | "Disabled";
  lastLogin: string;
}

const INITIAL_USERS: UserRow[] = [
  {
    id: "usr-01",
    name: "Dr. A. K. Sundaram",
    email: "admin@crescent.ac.in",
    role: "org_admin",
    organisation: "B.S. Abdur Rahman Crescent Institute",
    status: "Active",
    lastLogin: "10 mins ago",
  },
  {
    id: "usr-02",
    name: "Platform Supervisor",
    email: "ops@streetair.in",
    role: "platform_admin",
    organisation: "STREETAIR Core",
    status: "Active",
    lastLogin: "Just now",
  },
  {
    id: "usr-03",
    name: "K. R. Vengat",
    email: "vengat.kr@chennaimetro.gov.in",
    role: "org_admin",
    organisation: "Chennai Metropolitan Dev Authority",
    status: "Active",
    lastLogin: "2 hours ago",
  },
  {
    id: "usr-04",
    name: "Priya Ramanathan",
    email: "priya.r@tnpcb.gov.in",
    role: "org_admin",
    organisation: "Tamil Nadu Pollution Control Board",
    status: "Active",
    lastLogin: "Yesterday",
  },
  {
    id: "usr-05",
    name: "Vandalur Resident",
    email: "citizen.vandalur@gmail.com",
    role: "citizen",
    organisation: "Public Citizen",
    status: "Active",
    lastLogin: "5 hours ago",
  },
  {
    id: "usr-06",
    name: "Karthik Subramanian",
    email: "karthik.s@hexaware.com",
    role: "org_admin",
    organisation: "Hexaware Tech Park",
    status: "Active",
    lastLogin: "1 day ago",
  },
  {
    id: "usr-07",
    name: "Crescent Student Contributor",
    email: "student.env@crescent.ac.in",
    role: "citizen",
    organisation: "B.S. Abdur Rahman Crescent Institute",
    status: "Active",
    lastLogin: "3 days ago",
  },
  {
    id: "usr-08",
    name: "Arun Kumar",
    email: "arun.kumar.old@gmail.com",
    role: "citizen",
    organisation: "Public Citizen",
    status: "Disabled",
    lastLogin: "12 days ago",
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        return {
          ...u,
          status: u.status === "Active" ? "Disabled" : "Active",
        };
      })
    );
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.organisation.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-900 dark:text-white transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
              Identity, RBAC & Access Control
            </span>
          </div>
          <h1 className="text-2xl font-black">User Accounts & Role Permissions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global identity management across Citizen reporters, Campus Org Admins, and Platform Operators.
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300">
        â„¹ï¸ <strong>RBAC Policy:</strong> Role elevation to Platform Administrator requires hardware security key MFA verification per platform policy.
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total User Accounts"
          value={users.length}
          subtitle="Registered identities"
          statusColor="blue"
        />
        <MetricCard
          title="Platform Admins"
          value={users.filter((u) => u.role === "platform_admin").length}
          subtitle="Superuser privileges"
          statusColor="rose"
        />
        <MetricCard
          title="Organization Admins"
          value={users.filter((u) => u.role === "org_admin").length}
          subtitle="Campus & municipal teams"
          statusColor="emerald"
        />
        <MetricCard
          title="Citizen Contributors"
          value={users.filter((u) => u.role === "citizen").length}
          subtitle="Public crowd reporters"
          statusColor="amber"
        />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Search by user name, email, or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="platform_admin">Platform Admin</option>
            <option value="org_admin">Organization Admin</option>
            <option value="citizen">Citizen</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{user.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{user.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === "platform_admin"
                          ? "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
                          : user.role === "org_admin"
                          ? "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                          : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 text-xs">{user.organisation}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.status === "Active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                          : "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {user.lastLogin}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                        user.status === "Active"
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900 dark:border-rose-800 dark:text-rose-300"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:border-emerald-800 dark:text-emerald-300"
                      }`}
                    >
                      {user.status === "Active" ? "Disable" : "Enable"}
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




