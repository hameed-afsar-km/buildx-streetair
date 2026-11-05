"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLiveWebSocket } from "@/hooks/useLiveWebSocket";
import { getAQIClassification, getAQIColor } from "@/lib/aqi";
import {
  Wind,
  Sun,
  Moon,
  Menu,
  X,
  User,
  ShieldCheck,
  FileWarning,
  ChevronDown,
  MapPin,
  Gauge,
  CloudSun,
  Radio,
  Sparkles,
  Layers,
  Activity,
  Map,
  TrendingUp,
  Bell,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PublicHeaderProps {
  variant?: "standard" | "pill";
  showHeatmap?: boolean;
  onToggleHeatmap?: () => void;
}

export function PublicHeader({
  variant = "standard",
  showHeatmap,
  onToggleHeatmap,
}: PublicHeaderProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // State for pill island expansion
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);

  // Live real-time telemetry from Crescent Institute master beacon
  const { reading } = useLiveWebSocket();
  const aqi = reading?.aqi ?? 68;
  const health = getAQIClassification(aqi);
  const aqiColor = getAQIColor(aqi);

  // Close island on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        setIslandExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Collapse island on route change
  useEffect(() => {
    setIslandExpanded(false);
  }, [pathname]);

  const navLinks = [
    { label: "Overview", href: "/dashboard", icon: Activity },
    { label: "Air Map", href: "/map", icon: Map },
    { label: "Trends", href: "/history", icon: TrendingUp },
    { label: "Alerts", href: "/alerts", icon: Bell },
    { label: "Predictions", href: "/dashboard/predictions", icon: LineChart },
    { label: "AI Assistant", href: "/chat", icon: Sparkles },
    { label: "About", href: "/contact", icon: Wind },
  ];

  // ════════════════════════════════════════════════════════════════════════════
  // 1. PILL ISLAND NAVBAR (For Public Dashboard — Clean, Floating, Expandable)
  // ════════════════════════════════════════════════════════════════════════════
  if (variant === "pill") {
    return (
      <header
        ref={islandRef}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 select-none"
      >
        {!islandExpanded ? (
          // RESTING COMPACT PILL ISLAND
          <button
            type="button"
            onClick={() => setIslandExpanded(true)}
            className="flex items-center gap-3.5 px-4 py-2 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl hover:scale-105 active:scale-95 hover:bg-white dark:hover:bg-slate-900 transition-all duration-200 cursor-pointer group"
          >
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-xs">
                <Wind className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white">
                STREET<span className="gradient-air">AIR</span>
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:border-slate-800" />

            {/* Live AQI Badge */}
            <div className="flex items-center gap-2 text-xs">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: aqiColor }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: aqiColor }}
                />
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Vandalur
              </span>
              <span
                className="px-1.5 py-0.2 rounded font-mono font-bold text-[11px]"
                style={{
                  backgroundColor: `${aqiColor}20`,
                  color: aqiColor,
                }}
              >
                AQI {aqi}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 pl-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
              <span>Menu</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
            </div>
          </button>
        ) : (
          // EXPANDED FLOATING ISLAND MENU
          <div className="w-[min(580px,calc(100vw-2rem))] rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Top Bar inside Island */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-sm">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-none">
                    STREET<span className="gradient-air">AIR</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Live Environmental Intelligence · Chennai South
                  </p>
                </div>
              </div>

              {/* Live Pill & Close */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AQI {aqi}</span>
                  <span className="text-slate-400 font-sans font-normal">· {health.category}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIslandExpanded(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIslandExpanded(false)}
                    className={cn(
                      "flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold transition group",
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300"
                        : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200"
                    )}
                  >
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions & Utility Row */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Link
                  href="/report"
                  onClick={() => setIslandExpanded(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs"
                >
                  <FileWarning className="w-3.5 h-3.5" />
                  <span>Report Pollution</span>
                </Link>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Toggle Theme"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              {isAuthenticated && user ? (
                <Link
                  href="/admin/command-centre"
                  onClick={() => setIslandExpanded(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold hover:bg-emerald-100 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIslandExpanded(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Admin Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. STANDARD HEADER (For Regular Inner Pages: History, Alerts, Predictions)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
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
              Environmental Monitoring
            </p>
          </div>
        </Link>

        {/* Live Campus Telemetry Badge */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Vandalur Campus</span>
            <span
              className="px-1.5 py-0.2 rounded font-mono font-bold text-[11px]"
              style={{ backgroundColor: `${aqiColor}20`, color: aqiColor }}
            >
              AQI {aqi}
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
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

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2">
          <Link
            href="/report"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
          >
            <FileWarning className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated && user ? (
            <Link
              href="/admin/command-centre"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 text-xs font-bold hover:bg-emerald-100 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Sign In</span>
            </Link>
          )}

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
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <Link
                href="/admin/command-centre"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-slate-900 text-white text-xs font-bold"
              >
                Admin Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
