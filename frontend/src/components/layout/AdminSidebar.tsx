"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Bot,
  BarChart3,
  BookOpen,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Map,
  Radio,
  Settings,
  ShieldCheck,
  Terminal,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    title: "Monitor",
    links: [
      { label: "Command Centre", href: "/admin/command-centre", icon: LayoutDashboard },
      { label: "Live Readings", href: "/admin/readings", icon: Activity },
      { label: "Pollution Map", href: "/admin/hotspots", icon: Map },
    ],
  },
  {
    title: "Intelligence",
    links: [
      { label: "Incident Investigation", href: "/admin/intelligence/investigation", icon: Zap },
      { label: "AURA Assistant", href: "/admin/intelligence/chat", icon: Bot },
      { label: "Predictive Models", href: "/admin/intelligence/predictions", icon: TrendingUp },
      { label: "What-If Simulator", href: "/admin/intelligence/what-if", icon: FlaskConical },
    ],
  },
  {
    title: "Respond",
    links: [
      { label: "Alerts & Incidents", href: "/admin/incidents", icon: Bell },
      { label: "Community Reports", href: "/admin/reports", icon: FileText },
    ],
  },
  {
    title: "Manage",
    links: [
      { label: "Stations & Devices", href: "/admin/stations", icon: Radio },
      { label: "Users & Roles", href: "/admin/users", icon: Users },
      { label: "Analytics & Export", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "System",
    links: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "AI Services", href: "/admin/ai", icon: Terminal },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: BookOpen },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin/command-centre" && pathname.startsWith(href + "/")) ||
    (href !== "/admin" && pathname.startsWith(href));

  return (
    <aside className="flex min-h-screen w-60 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 p-4">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white shadow-sm">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            STREET<span className="text-emerald-600 dark:text-emerald-400">AIR</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Admin Dashboard
          </p>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto space-y-4 p-3 py-4">
        {groups.map((group) => (
          <section key={group.title}>
            <p className="px-3 pb-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.links.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                    isActive(href)
                      ? "border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3">
        <Link
          href="/dashboard"
          className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          ↗ Open Public Dashboard
        </Link>
      </div>
    </aside>
  );
}
