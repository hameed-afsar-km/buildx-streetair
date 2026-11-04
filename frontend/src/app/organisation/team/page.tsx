"use client";

import React, { useState } from "react";
import { Users, UserPlus, Shield, Mail } from "lucide-react";

export default function OrgTeamPage() {
  const members = [
    {
      name: "Dr. K. Ahmed",
      email: "director.research@crescent.education",
      role: "Organisation Administrator",
      department: "Dean of Research & Sponsored Projects",
      status: "Active",
    },
    {
      name: "Dr. Priya Sundaram",
      email: "priya.analyst@crescent.education",
      role: "Environmental Analyst",
      department: "Dept of Civil Engineering / Environmental Tech",
      status: "Active",
    },
    {
      name: "K. R. Ramanathan",
      email: "facilities@crescent.education",
      role: "Operations Lead",
      department: "Estate & Campus Facilities Office",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Team & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage authorized staff, environmental researchers, and campus facilities operators.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Invite link generated")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      {m.name.charAt(0)}
                    </div>
                    <span>{m.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">{m.email}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{m.department}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {m.status}
                    </span>
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

