"use client";

import Link from "next/link";
import { useState } from "react";
import { Bot, ChevronDown, FileWarning, MapPinned, Sparkles } from "lucide-react";

export function AssistantDock({ admin = false }: { admin?: boolean }) {
  const [open, setOpen] = useState(false);
  const tone = admin ? "border-violet-400/30 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-900";
  return <aside className="fixed bottom-20 right-4 z-40 w-[min(360px,calc(100vw-2rem))]">
    {open && <div className={`mb-3 overflow-hidden rounded-2xl border shadow-2xl ${tone}`}>
      <div className="flex items-start gap-3 border-b border-current/10 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white"><Bot className="h-5 w-5" /></span><div><p className="text-sm font-bold">Air guide is ready</p><p className="text-[11px] opacity-60">Answers cite CPCB guidance and local telemetry.</p></div></div>
      <div className="grid grid-cols-2 gap-2 p-3 text-xs"><Link href="/intelligence/chat" className="rounded-xl bg-violet-600 px-3 py-2.5 font-bold text-white hover:bg-violet-700"><Sparkles className="mr-1 inline h-3.5 w-3.5" />Ask about air</Link><Link href="/app/reports/new" className="rounded-xl border border-current/15 px-3 py-2.5 font-bold hover:bg-current/5"><FileWarning className="mr-1 inline h-3.5 w-3.5" />Report smoke</Link></div>
      <div className="flex items-center gap-2 px-4 pb-3 text-[10px] opacity-60"><MapPinned className="h-3.5 w-3.5" />India-first guidance · citations shown in chat</div>
    </div>}
    <button onClick={() => setOpen(!open)} aria-expanded={open} className="ml-auto flex items-center gap-2 rounded-full bg-violet-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-violet-950/30 hover:bg-violet-700"><Bot className="h-4 w-4" />{open ? "Close assistant" : "Need help?"}<ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} /></button>
  </aside>;
}
