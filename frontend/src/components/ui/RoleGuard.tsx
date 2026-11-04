"use client";

import React from "react";
import { UserRole } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { role, isAuthenticated, switchDemoRole } = useAuth();

  const isAllowed = isAuthenticated && allowedRoles.includes(role);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-1">
        Restricted Operational Zone
      </h3>
      <p className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-300/80 mb-5 leading-relaxed">
        This view requires elevated permissions (<strong>{allowedRoles.join(" or ")}</strong>).
        Your current session role is <strong>{role || "Unauthenticated"}</strong>.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* Quick Demo Role Switcher button */}
        {allowedRoles[0] && (
          <button
            type="button"
            onClick={() => switchDemoRole(allowedRoles[0])}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <span>Switch Role to {allowedRoles[0]} (Demo)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        <Link
          href="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
        >
          Return to Public Dashboard
        </Link>
      </div>
    </div>
  );
}

