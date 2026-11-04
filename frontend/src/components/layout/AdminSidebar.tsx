"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Cpu,
  Radio,
  Activity,
  BarChart2,
  Flame,
  Bell,
  AlertTriangle,
  FileCheck2,
  Bot,
  BrainCircuit,
  Building,
  Users2,
  PackageCheck,
  CreditCard,
  HardDrive,
  FileCode,
  Settings,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { label: "Command Centre", href: "/admin/command-centre", icon: <Cpu className="w-4 h-4" /> },
    { label: "Station Network", href: "/admin/stations", icon: <Radio className="w-4 h-4" /> },
    { label: "Readings Stream", href: "/admin/readings", icon: <Activity className="w-4 h-4" /> },
    { label: "Pollution Analytics", href: "/admin/analytics", icon: <BarChart2 className="w-4 h-4" /> },
    { label: "Hotspot Clusters", href: "/admin/hotspots", icon: <Flame className="w-4 h-4" /> },
    { label: "Alert Dispatch", href: "/admin/alerts", icon: <Bell className="w-4 h-4" /> },
    { label: "Incident Escalation", href: "/admin/incidents", icon: <AlertTriangle className="w-4 h-4" /> },
    { label: "Report Moderation", href: "/admin/reports", icon: <FileCheck2 className="w-4 h-4" /> },
    { label: "AI Services & Health", href: "/admin/ai", icon: <Bot className="w-4 h-4" /> },
    { label: "Model Registry", href: "/admin/models", icon: <BrainCircuit className="w-4 h-4" /> },
    { label: "Tenants / Orgs", href: "/admin/organisations", icon: <Building className="w-4 h-4" /> },
    { label: "User Access & Roles", href: "/admin/users", icon: <Users2 className="w-4 h-4" /> },
    { label: "Subscription Plans", href: "/admin/plans", icon: <PackageCheck className="w-4 h-4" /> },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: <CreditCard className="w-4 h-4" /> },
    { label: "Platform Usage", href: "/admin/usage", icon: <HardDrive className="w-4 h-4" /> },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: <FileCode className="w-4 h-4" /> },
    { label: "Platform Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 flex flex-col min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <span className="font-extrabold text-sm tracking-tight text-white">
            STREET<span className="gradient-air">AIR</span>
          </span>
          <span className="block text-[10px] text-red-300 font-mono uppercase tracking-wider">
            Command Centre
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5">
          Command Modules
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition",
                isActive
                  ? "bg-red-950/70 text-red-300 font-bold border border-red-800/80"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* Shortcuts */}
        <div className="pt-3 mt-3 border-t border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <span>Public Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </nav>
    </aside>
  );
}

