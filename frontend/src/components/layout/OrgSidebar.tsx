"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Radio,
  BarChart3,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Activity,
  CreditCard,
  Settings,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { PlanBadge } from "@/components/ui/PlanBadge";

export function OrgSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = [
    { label: "Overview", href: "/organisation/overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Managed Stations", href: "/organisation/stations", icon: <Radio className="w-4 h-4" /> },
    { label: "Analytics & Trends", href: "/organisation/analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Incidents & Root Cause", href: "/organisation/incidents", icon: <AlertTriangle className="w-4 h-4" /> },
    { label: "Compliance & ESG Reports", href: "/organisation/reports", icon: <FileSpreadsheet className="w-4 h-4" /> },
    { label: "Team & Permissions", href: "/organisation/team", icon: <Users className="w-4 h-4" /> },
    { label: "Usage & Telemetry", href: "/organisation/usage", icon: <Activity className="w-4 h-4" /> },
    { label: "Subscription & Billing", href: "/organisation/subscription", icon: <CreditCard className="w-4 h-4" /> },
    { label: "Organisation Settings", href: "/organisation/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col min-h-screen">
      {/* Org Identity & Workspace */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.org_name || "Crescent Institute"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500 font-mono">B2B Tenant</span>
              <PlanBadge tier={user?.plan || "enterprise"} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300 px-3 py-1.5">
          Enterprise Workspace
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition",
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* Global Nav */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            <span>Public Live Dashboard</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <Link
            href="/app"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            <span>Citizen Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </nav>
    </aside>
  );
}

