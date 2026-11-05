import Link from "next/link";
import { Wind } from "lucide-react";

export function PublicFooter() {
  return <footer className="mt-auto border-t border-slate-200 bg-white text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950">
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white"><Wind className="h-4 w-4" /></span><div><p className="font-extrabold text-slate-900 dark:text-white">STREET<span className="text-emerald-600">AIR</span></p><p className="text-[11px]">Environmental monitoring for Indian communities.</p></div></div>
      <nav className="flex flex-wrap gap-x-4 gap-y-2 font-semibold"><Link href="/dashboard" className="hover:text-emerald-600">Dashboard</Link><Link href="/chat" className="hover:text-emerald-600">AI Assistant</Link><Link href="/history" className="hover:text-emerald-600">Trends</Link><Link href="/alerts" className="hover:text-emerald-600">Advisories</Link><Link href="/contact" className="hover:text-emerald-600">About & method</Link><Link href="/privacy" className="hover:text-emerald-600">Privacy</Link></nav>
      <p className="text-[10px] text-slate-400">Data labels distinguish live, simulated, and cached readings.</p>
    </div>
  </footer>;
}
