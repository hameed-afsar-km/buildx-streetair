"use client";

import Link from "next/link";
import { useState } from "react";
import { Bot, ChevronDown, FileWarning, MapPinned, Sparkles } from "lucide-react";

export function AssistantDock({ admin = false }: { admin?: boolean }) {
  const [open, setOpen] = useState(false);
  const tone = admin ? "border-emerald-400/30 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-900";
  const chatHref = admin ? "/admin/command-centre#ai-trace" : "/dashboard#air-guide";

  return (
    <aside className="fixed bottom-20 right-4 z-40 w-[min(360px,calc(100vw-2rem))]">
      {open && (
        <div className={`mb-3 overflow-hidden rounded-2xl border shadow-2xl ${tone}`}>
          <div className="flex items-start gap-3 border-b border-current/10 p-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold">AURA</p>
              <p className="text-[11px] opacity-60">Environmental Intelligence Agent · CPCB & verified telemetry.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3 text-xs">
            <Link
              href={chatHref}
              className="rounded-xl bg-emerald-600 px-3 py-2.5 font-bold text-white hover:bg-emerald-700 text-center"
            >
              <Sparkles className="mr-1 inline h-3.5 w-3.5" />
              Ask AURA
            </Link>
            <Link
              href="/report"
              className="rounded-xl border border-current/15 px-3 py-2.5 font-bold hover:bg-current/5 text-center flex items-center justify-center gap-1"
            >
              <FileWarning className="h-3.5 w-3.5 text-rose-500" />
              <span>Report Issue</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 px-4 pb-3 text-[10px] opacity-60">
            <MapPinned className="h-3.5 w-3.5" />
            India CPCB health advisory standard
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="ml-auto flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-950/20 hover:bg-emerald-700 transition"
      >
        <Bot className="h-4 w-4" />
        {open ? "Close AURA" : "Ask AURA"}
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
    </aside>
  );
}

