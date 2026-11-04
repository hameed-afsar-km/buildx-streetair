"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getReports } from "@/lib/api/endpoints";
import { CommunityReport } from "@/lib/types";
import { FilePlus, FileText, MapPin, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ReportsListPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<CommunityReport[]>([]);

  useEffect(() => {
    getReports(user?.uid).then(setReports);
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            My Community Pollution Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track verification progress, review officer notes, and incident linkages.
          </p>
        </div>

        <Link
          href="/app/reports/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
        >
          <FilePlus className="w-4 h-4" />
          <span>New Report</span>
        </Link>
      </div>

      <div className="space-y-3">
        {reports.map((rep) => (
          <Link
            key={rep.id}
            href={`/app/reports/${rep.id}`}
            className="block p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 shadow-sm transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-slate-400">
                {rep.category.replace("_", " ")} &bull; ID: {rep.id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  rep.status === "verified"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : rep.status === "resolved"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {rep.status.replace("_", " ")}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 transition">
              {rep.description}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {rep.address}
              </span>
              <div className="flex items-center gap-2">
                <span>Submitted {formatDate(rep.submitted_at)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-600 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

