"use client";

import React, { useState, useEffect } from "react";
import { getReports } from "@/lib/api/endpoints";
import { CommunityReport, ReportStatus } from "@/lib/types";
import { FileCheck2, Check, X, ShieldAlert, MapPin, Eye, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminReportsModerationPage() {
  const [reports, setReports] = useState<CommunityReport[]>([]);

  useEffect(() => {
    getReports().then(setReports);
  }, []);

  const handleAction = (reportId: string, newStatus: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Community Report Moderation Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review citizen pollution filings, corroborate with sensor signals, and dispatch municipal enforcement teams.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors p-6 space-y-4 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-red-400 block">
                  {rep.category.replace("_", " ")} &bull; Reference ID: {rep.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Reported by {rep.user_name} ({rep.user_email})
                </h3>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  rep.status === "verified"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                    : rep.status === "rejected"
                    ? "bg-red-950 text-red-300"
                    : "bg-amber-950 text-amber-300"
                }`}
              >
                {rep.status.replace("_", " ")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 space-y-2">
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">{rep.description}</p>
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{rep.address}</span>
                </div>
              </div>

              {rep.image_url && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-28 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rep.image_url}
                    alt="Citizen Evidence"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white">
                    Citizen Photo
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
              <span className="text-slate-500">Submitted: {formatDate(rep.submitted_at)}</span>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAction(rep.id, "verified")}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition"
                >
                  <Check className="w-3 h-3" />
                  <span>Verify & Dispatch Patrol</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(rep.id, "rejected")}
                  className="px-3 py-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-[11px] flex items-center gap-1 transition"
                >
                  <X className="w-3 h-3" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




