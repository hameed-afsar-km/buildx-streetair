"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { User, ShieldCheck, Mail, Building, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function UserProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Profile & Identity
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Your authenticated citizen/organisation identity verified via Firebase SDK.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
            {user?.display_name.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {user?.display_name}
            </h2>
            <span className="font-mono text-slate-400 block">{user?.email}</span>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 uppercase">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-3 font-mono">
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Unique UID:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{user?.uid}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Organisation:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              {user?.org_name || "Independent Citizen"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Entitlement Plan:</span>
            <span className="text-brand-600 font-bold uppercase">{user?.plan || "Starter"}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Account Created:</span>
            <span className="text-slate-800 dark:text-slate-200">
              {formatDate(user?.created_at || new Date())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

