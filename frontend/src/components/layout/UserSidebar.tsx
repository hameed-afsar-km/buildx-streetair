"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wind,
  LayoutDashboard,
  MapPin,
  Bell,
  FilePlus,
  FileText,
  Bot,
  Settings,
  User,
  ExternalLink,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function UserSidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  const links = [
    { label: "Personal Overview", href: "/app", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Saved Locations", href: "/app/locations", icon: <MapPin className="w-4 h-4" /> },
    { label: "Personal Alerts", href: "/app/alerts", icon: <Bell className="w-4 h-4" /> },
    { label: "My Community Reports", href: "/app/reports", icon: <FileText className="w-4 h-4" /> },
    { label: "Submit New Report", href: "/app/reports/new", icon: <FilePlus className="w-4 h-4" /> },
    { label: "Environmental AI Assistant", href: "/app/chat", icon: <Bot className="w-4 h-4" /> },
    { label: "Profile & Identity", href: "/app/profile", icon: <User className="w-4 h-4" /> },
    { label: "Account Settings", href: "/app/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
          <Wind className="w-4 h-4" />
        </div>
        <div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
            STREET<span className="gradient-air">AIR</span>
          </span>
          <span className="block text-[10px] text-slate-400 font-mono">Citizen Workspace</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300 px-3 py-1.5">
          Portal Navigation
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
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* Secondary Portal Shortcuts */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300 px-3 py-1.5">
            Switch Portals
          </div>
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            <span>Public Dashboard</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <Link
            href="/intelligence"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            <span>AI Intelligence Suite</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          {(role === "org_admin" || role === "platform_admin") && (
            <Link
              href="/organisation/overview"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
            >
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Organisation Portal
              </span>
            </Link>
          )}
          {role === "platform_admin" && (
            <Link
              href="/admin/command-centre"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
            >
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Command Centre
              </span>
            </Link>
          )}
        </div>
      </nav>
    </aside>
  );
}

