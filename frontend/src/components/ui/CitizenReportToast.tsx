"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  X,
  FileWarning,
  MapPin,
  Clock,
  ExternalLink,
  Flame,
  Factory,
  Car,
  CloudFog,
  Wind,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  CHANNEL_NAME,
  LS_KEY,
  CitizenReport,
} from "@/lib/citizenReportBroadcast";

const SEVERITY_STYLES = {
  critical: {
    bar: "bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 animate-pulse",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    icon: "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400",
    border: "border-rose-300/80 dark:border-rose-700/80",
  },
  high: {
    bar: "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 animate-pulse",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    icon: "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
    border: "border-orange-300/80 dark:border-orange-700/80",
  },
  medium: {
    bar: "bg-gradient-to-r from-amber-500 to-yellow-400",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    icon: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    border: "border-amber-300/80 dark:border-amber-700/80",
  },
  low: {
    bar: "bg-gradient-to-r from-sky-500 to-blue-400",
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    icon: "bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400",
    border: "border-sky-300/80 dark:border-sky-700/80",
  },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  waste_burning: <Flame className="w-4 h-4" />,
  construction_dust: <Wind className="w-4 h-4" />,
  industrial_emissions: <Factory className="w-4 h-4" />,
  traffic_congestion: <Car className="w-4 h-4" />,
  smoke: <CloudFog className="w-4 h-4" />,
  other: <AlertTriangle className="w-4 h-4" />,
};

interface ToastItem {
  report: CitizenReport;
  id: string;
}

export function CitizenReportToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((report: CitizenReport) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [{ report, id }, ...prev].slice(0, 4)); // max 4 stacked

    // Auto-dismiss after 15 s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 15000);
  }, []);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    // 1. BroadcastChannel listener
    let ch: BroadcastChannel | null = null;
    try {
      ch = new BroadcastChannel(CHANNEL_NAME);
      ch.onmessage = (e) => {
        if (e.data && e.data.id) addToast(e.data as CitizenReport);
      };
    } catch {
      // not available
    }

    // 2. localStorage fallback
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY && e.newValue) {
        try {
          const report = JSON.parse(e.newValue) as CitizenReport;
          if (report?.id) addToast(report);
        } catch {
          // malformed
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      ch?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2.5 w-[min(400px,calc(100vw-2rem))]">
      {toasts.map(({ report, id }, idx) => {
        const styles = SEVERITY_STYLES[report.severity] ?? SEVERITY_STYLES.low;
        const timeAgo = new Date(report.timestamp).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={id}
            className={`overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/97 dark:bg-slate-900/97 ${styles.border} animate-in slide-in-from-right-6 fade-in duration-300`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Severity Bar */}
            <div className={`h-1.5 w-full ${styles.bar}`} />

            <div className="p-3.5">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`p-1.5 rounded-xl shrink-0 ${styles.icon}`}>
                    {CATEGORY_ICONS[report.category] ?? <FileWarning className="w-4 h-4" />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide leading-tight">
                        {report.isSimulation ? "⚠️ Simulated Issue Alert" : "🚨 Citizen Report Incoming"}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0 ${styles.badge}`}>
                        {report.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold truncate">
                      {report.categoryLabel}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => dismiss(id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Location & Description */}
              <div className="mt-2 space-y-1">
                <p className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1 font-semibold">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="truncate">{report.address}</span>
                </p>
                {report.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2 pl-4">
                    "{report.description}"
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1" suppressHydrationWarning>
                  <Clock className="w-3 h-3" />
                  {timeAgo} IST
                  {report.reporterName && (
                    <span className="ml-1 text-slate-500">· by {report.reporterName}</span>
                  )}
                </span>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={report.isSimulation ? "/admin/command-centre" : "/admin/reports"}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] shadow-sm transition"
                  >
                    <span>{report.isSimulation ? "Investigate" : "View Reports"}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => dismiss(id)}
                    className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold text-[10px] transition border border-slate-200 dark:border-slate-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

