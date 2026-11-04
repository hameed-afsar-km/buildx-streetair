"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Download, CheckCircle2, Calendar, FileText } from "lucide-react";

export default function OrgReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);

  const pastReports = [
    {
      title: "CPCB Monthly Ambient Air Quality Audit (October 2026)",
      period: "Oct 1 – Oct 31, 2026",
      status: "Compliant (91.2%)",
      format: "PDF + CSV",
      generatedOn: "2026-11-01",
    },
    {
      title: "Quarterly ESG Sustainability & Particulate Footprint",
      period: "Q3 2026 (July – Sept)",
      status: "Verified",
      format: "PDF",
      generatedOn: "2026-10-02",
    },
    {
      title: "GST Highway Corridor Construction Dust Assessment",
      period: "Special Investigation",
      status: "Resolved",
      format: "PDF",
      generatedOn: "2026-09-18",
    },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setDownloadReady(true);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Regulatory CPCB & ESG Compliance Reporting
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated statutory compliance audits matching Central Pollution Control Board (Schedule VII) standards.
          </p>
        </div>

        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isGenerating ? "Synthesizing Telemetry Audit..." : "Generate New Compliance Audit"}</span>
        </button>
      </div>

      {downloadReady && (
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Audit ready: <strong>CPCB_Compliance_Report_Nov_2026.pdf</strong></span>
          </div>
          <button
            type="button"
            onClick={() => alert("Downloading certified audit PDF...")}
            className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      )}

      {/* Generated Reports Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Archived Regulatory Filings & ESG Disclosures
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="py-2.5 px-3">Report Document</th>
                <th className="py-2.5 px-3">Reporting Period</th>
                <th className="py-2.5 px-3">Compliance Result</th>
                <th className="py-2.5 px-3">Filing Date</th>
                <th className="py-2.5 px-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pastReports.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>{r.title}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">{r.period}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono">{r.generatedOn}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Downloading ${r.title}`)}
                      className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{r.format}</span>
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

