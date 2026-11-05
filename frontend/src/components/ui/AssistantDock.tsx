"use client";

import Link from "next/link";
import { useState } from "react";
import { Bot, FileWarning, MapPinned, Sparkles, X } from "lucide-react";

export function AssistantDock({ admin = false }: { admin?: boolean }) {
  const [open, setOpen] = useState(false);
  const chatHref = "/admin/intelligence/chat";

  return (
    <aside className="fixed bottom-8 right-8 sm:bottom-9 sm:right-9 z-50 flex flex-col items-end select-none">
      {open && (
        <div className="mb-4 w-[min(380px,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                  AURA Intelligence
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Environmental Agent · CPCB & telemetry RAG
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 p-4 text-xs">
            <Link
              href={chatHref}
              onClick={() => setOpen(false)}
              className="rounded-xl bg-emerald-600 px-3.5 py-3 font-bold text-white hover:bg-emerald-500 text-center flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Chat with AURA</span>
            </Link>
            <Link
              href="/report"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-3 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-center flex items-center justify-center gap-1.5 transition"
            >
              <FileWarning className="h-3.5 w-3.5 text-rose-500" />
              <span>Report Issue</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 px-4 pb-3.5 text-[10px] text-slate-400">
            <MapPinned className="h-3.5 w-3.5 text-emerald-500" />
            Live National CPCB standard · Real-time mesh
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) with AI Icon */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Toggle AI Assistant"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-2xl shadow-emerald-950/30 hover:scale-105 hover:from-emerald-500 hover:to-teal-400 active:scale-95 transition-all duration-200 ring-4 ring-emerald-500/25 cursor-pointer"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-white dark:border-slate-900" />
        </span>
        {open ? (
          <X className="h-6 w-6 transition-transform duration-200 group-hover:rotate-90 pointer-events-none" />
        ) : (
          <Bot className="h-7 w-7 transition-transform duration-200 group-hover:scale-110 pointer-events-none" />
        )}
      </button>
    </aside>
  );
}

export default AssistantDock;
