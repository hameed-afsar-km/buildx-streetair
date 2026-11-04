"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  Wind,
  Sun,
  Moon,
  Menu,
  X,
  Radio,
  Sparkles,
  User,
  ShieldAlert,
  Building2,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Public Dashboard", href: "/dashboard" },
    { label: "Interactive Map", href: "/map" },
    { label: "Stations Grid", href: "/stations" },
    { label: "Platform", href: "/platform" },
    { label: "AI Intelligence", href: "/intelligence" },
    { label: "Pricing & SaaS", href: "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                STREET<span className="gradient-air">AIR</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 -mt-0.5 tracking-tight font-medium">
              Environmental Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition",
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Live Campus Beacon Badge (Crescent Institute) */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100/70 transition"
            title="Live Station: B.S. Abdur Rahman Crescent Institute of Science and Technology, Vandalur"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Vandalur Campus Beacon</span>
            <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
              LIVE
            </span>
          </Link>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Color Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User / Org Navigation */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {/* Quick links to workspaces */}
              {user.role === "platform_admin" && (
                <Link
                  href="/admin/command-centre"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900 text-xs font-bold hover:bg-red-100 transition"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Admin Hub</span>
                </Link>
              )}

              {user.role === "org_admin" && (
                <Link
                  href="/organisation/overview"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900 text-xs font-bold hover:bg-indigo-100 transition"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Org Portal</span>
                </Link>
              )}

              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Portal</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
              >
                <span>Get Started</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-lg bg-brand-600 text-white text-xs font-bold"
            >
              Open User Workspace
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

