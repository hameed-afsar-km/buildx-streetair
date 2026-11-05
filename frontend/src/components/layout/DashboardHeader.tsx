"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLiveWebSocket } from "@/hooks/useLiveWebSocket";
import { LiveWebSocketIndicator } from "@/components/ui/LiveWebSocketIndicator";
import { ScenarioSelector } from "@/components/ui/ScenarioSelector";
import { Sun, Moon, LogOut, User, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/lib/types";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user, role, switchDemoRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { reading, connectionStatus, lastUpdateTime, triggerScenario } = useLiveWebSocket();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      {/* Title / Context */}
      <div>
        {title && (
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex flex-wrap items-center gap-2.5 ml-auto">
        {/* Live WebSocket Indicator */}
        <LiveWebSocketIndicator
          status={connectionStatus}
          lastUpdated={lastUpdateTime}
        />

        {/* Compact 9-Scenario Switcher */}
        {reading && (
          <ScenarioSelector
            activeScenario={reading.scenario}
            onSelectScenario={triggerScenario}
            isCompact={true}
          />
        )}

        {/* Demo Role Switcher Pill */}
        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-slate-500 font-mono">Role:</span>
          <select
            value={role}
            onChange={(e) => switchDemoRole(e.target.value as UserRole)}
            aria-label="Switch User Role for Evaluation"
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="citizen">Citizen</option>
            <option value="analyst">Analyst</option>
            <option value="org_admin">Org Admin (Crescent)</option>
            <option value="platform_admin">Platform Admin</option>
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Toggle Color Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Avatar & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <Link
              href="/admin/users"
              className="flex items-center gap-2 group"
              title={`Logged in as ${user.display_name} (${user.email})`}
            >
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {user.display_name.charAt(0)}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 transition truncate max-w-[120px]">
                {user.display_name.split(" ")[0]}
              </span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}


