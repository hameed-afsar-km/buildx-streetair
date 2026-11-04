"use client";

import Link from "next/link";
import { useState } from "react";
import { BarChart3, ChevronUp, Map, MessageCircle, Siren, X } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Live map", icon: Map },
  { href: "/history", label: "Timeline", icon: BarChart3 },
  { href: "/app/reports/new", label: "Report", icon: Siren },
  { href: "/intelligence/chat", label: "Ask AI", icon: MessageCircle },
];

export function BottomNavigation() {
  const [open, setOpen] = useState(false);
  return <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none flex justify-center">
    <div className="pointer-events-auto w-full max-w-xl px-3">
      {open && <nav className="mb-2 grid grid-cols-4 gap-1 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className="flex flex-col items-center gap-1 rounded-xl p-2 text-[10px] font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Icon className="h-4 w-4 text-emerald-600" />{label}</Link>)}
      </nav>}
      <button onClick={() => setOpen(!open)} aria-label={open ? "Collapse navigation" : "Expand navigation"} aria-expanded={open} className="mx-auto flex h-11 min-w-32 items-center justify-center gap-2 rounded-t-2xl border border-b-0 border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        {open ? <X className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />} {open ? "Close" : "Explore"}
      </button>
    </div>
  </div>;
}
