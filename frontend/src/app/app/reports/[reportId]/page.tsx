"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getReportById } from "@/lib/api/endpoints";
import { CommunityReport } from "@/lib/types";
import { ArrowLeft, MapPin, CheckCircle, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = (params?.reportId as string) || "rep_5501";

  const [report, setReport] = useState<CommunityReport | null>(null);

  useEffect(() => {
    getReportById(reportId)
      .then(setReport)
      .catch((e) => console.error(e));
  }, [reportId]);

  if (!report) {
    return (
      <div className="py-12 text-center text-xs text-slate-500">
        Loading report records...
      </div>
    );
  }

  const steps = [
    { label: "Submitted", done: true },
    { label: "Under Review", done: report.status !== "submitted" },
    { label: "Verified / Actioned", done: report.status === "verified" || report.status === "resolved" },
    { label: "Resolved", done: report.status === "resolved" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/app/reports"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Reports List</span>
      </Link>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                {report.category.replace("_", " ")}
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {report.id}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Pollution Incident Report
            </h1>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block font-mono">Current Status</span>
            <span className="font-mono font-bold uppercase text-brand-600 dark:text-brand-400 text-sm">
              {report.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Verification Progress Tracker */}
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3 font-mono">
            Verification Pipeline
          </span>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {steps.map((st, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[10px] font-bold ${
                    st.done
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-[10px] font-semibold ${
                    st.done ? "text-slate-900 dark:text-white" : "text-slate-400"
                  }`}
                >
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-4 text-xs">
          <div>
            <span className="text-slate-400 font-mono block mb-1">Location:</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>{report.address}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-mono block mb-1">Citizen Statement:</span>
            <p className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {report.description}
            </p>
          </div>

          {report.reviewer_notes && (
            <div>
              <span className="text-slate-400 font-mono block mb-1">Reviewer Officer Notes:</span>
              <p className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 leading-relaxed">
                {report.reviewer_notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

