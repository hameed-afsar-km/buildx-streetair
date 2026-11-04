"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Radio,
  ScanSearch,
  BrainCircuit,
  BarChart3,
  Zap,
  Bell,
  ArrowUpRight,
  Cpu,
  Wifi,
  Database,
} from "lucide-react";

import { RotatingWireframeGlobe } from "@/components/ui/RotatingWireframeGlobe";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { InteractiveTitle } from "@/components/ui/InteractiveTitle";
import { PillNavbar } from "@/components/ui/PillNavbar";
import { useDashboardTransition } from "@/components/ui/DashboardTransition";

const stages = [
  {
    step: "01",
    title: "Monitor",
    desc: "Continuous telemetry from distributed IoT nodes — PM2.5, PM10, temperature, humidity, gas resistance.",
    icon: Radio,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    step: "02",
    title: "Detect",
    desc: "Real-time anomaly detection flags particulate spikes and unusual environmental shifts instantly.",
    icon: ScanSearch,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    step: "03",
    title: "Investigate",
    desc: "Co-pollutant covariance analysis and local context reasoning to find the root cause.",
    icon: BrainCircuit,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    step: "04",
    title: "Analyse",
    desc: "Spatial hotspot mapping, diurnal trend curves, and cross-station historical comparison.",
    icon: BarChart3,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    step: "05",
    title: "Predict",
    desc: "ML-driven forecasting estimates elevated pollution risk windows hours before they peak.",
    icon: Zap,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    step: "06",
    title: "Respond",
    desc: "Situation-specific advisories pushed to citizens, operators, and public health responders.",
    icon: Bell,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
];

const techStack = [
  { icon: Cpu, label: "ESP32 IoT Nodes" },
  { icon: Wifi, label: "Real-time WebSocket" },
  { icon: Database, label: "Firebase + Firestore" },
];

export default function LandingPage() {
  const [, setSplashFinished] = useState(false);
  const { navigateWithReveal, Overlay } = useDashboardTransition();

  return (
    <div className="min-h-screen bg-emerald-950 text-cream-100 selection:bg-gold-500/80 selection:text-emerald-950 font-sans overflow-x-hidden">
      {Overlay}
      <SplashScreen onComplete={() => setSplashFinished(true)} />
      <PillNavbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-12 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-900/60 to-emerald-950 pointer-events-none" />

        {/* Soft radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-700/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-gold-500/8 blur-[80px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-700/50 bg-emerald-900/40 backdrop-blur-sm mb-8"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-medium tracking-widest uppercase text-emerald-300/80">
              Live Environmental Monitoring
            </span>
          </motion.div>

          {/* Interactive title */}
          <InteractiveTitle />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 text-base sm:text-lg text-cream-200/70 font-normal leading-relaxed max-w-xl mx-auto"
          >
            An AI-powered platform that turns raw IoT sensor data into
            real-time air quality intelligence and predictive environmental insights.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <button
              onClick={() => navigateWithReveal("/dashboard", "Public Live Dashboard")}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-emerald-950 font-semibold text-sm hover:bg-gold-400 hover:scale-[1.02] active:scale-100 transition-all duration-200 shadow-[0_0_24px_rgba(200,169,106,0.3)] cursor-pointer"
            >
              View Public Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigateWithReveal("/admin", "Admin Command Console")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-emerald-700/60 bg-emerald-900/30 text-cream-200/80 font-medium text-sm hover:border-emerald-600/60 hover:text-cream-100 transition-all duration-200 backdrop-blur-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-gold-500/80" />
              Admin
            </button>
          </motion.div>

          {/* Tech badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-10 flex items-center justify-center gap-5"
          >
            {techStack.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-cream-200/35 text-[11px] font-medium">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Globe */}
        <div className="absolute inset-x-0 bottom-0 h-[48vh] pointer-events-none overflow-hidden flex items-end justify-center">
          <div className="w-full h-[120%] relative">
            <RotatingWireframeGlobe />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ── ABOUT / FLOW SECTION ─────────────────────────────────────── */}
      <section id="about" className="relative py-24 bg-emerald-950">
        {/* Subtle top separator */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-700/40 to-transparent" />

        <div className="max-w-6xl mx-auto px-6">

          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-500/80 mb-3">
              How it works
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-semibold text-cream-100 leading-tight max-w-sm">
                From sensor to<br className="hidden sm:block" /> actionable insight
              </h2>
              <p className="text-sm text-cream-200/55 max-w-xs leading-relaxed sm:text-right">
                Six interconnected stages that process raw environmental
                data into meaningful decisions in real time.
              </p>
            </div>
          </motion.div>

          {/* Stage cards — 2-col then 3-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.45, delay: idx * 0.07 }}
                  className="group relative p-6 rounded-2xl border border-emerald-800/40 bg-emerald-900/20 hover:bg-emerald-900/35 hover:border-emerald-700/60 transition-all duration-300"
                >
                  {/* Number */}
                  <span className="text-[10px] font-mono font-medium tracking-widest text-cream-200/25 mb-4 block">
                    {stage.step}
                  </span>

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-4 ${stage.bg}`}>
                    <Icon className={`w-4.5 h-4.5 ${stage.color}`} strokeWidth={1.75} />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-cream-100 mb-2 group-hover:text-white transition-colors">
                    {stage.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-cream-200/50 leading-relaxed">
                    {stage.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Deployment callout — minimal modern style */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 flex items-center justify-between gap-4 p-5 rounded-2xl border border-emerald-800/30 bg-emerald-900/15"
          >
            <div>
              <p className="text-xs font-medium text-cream-200/40 uppercase tracking-wider mb-1">
                Demonstration Deployment
              </p>
              <p className="text-sm text-cream-200/70">
                B.S. Abdur Rahman Crescent Institute of Science & Technology — Vandalur, Tamil Nadu
              </p>
            </div>
            <button
              onClick={() => navigateWithReveal("/dashboard", "Public Live Dashboard")}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-700/50 text-cream-200/60 text-xs font-medium hover:text-cream-100 hover:border-emerald-600/60 transition-all cursor-pointer"
            >
              View live <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="relative bg-emerald-950 border-t border-emerald-900/40 pt-10 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-emerald-900/30">
            <div>
              <span className="font-sans font-semibold text-sm tracking-[0.18em] uppercase text-cream-100">
                STREETAIR
              </span>
              <p className="text-xs text-cream-200/40 mt-1">
                Environmental Monitoring & Pollution Intelligence
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-cream-200/50">
              <button
                onClick={() => navigateWithReveal("/dashboard", "Public Live Dashboard")}
                className="hover:text-cream-200/80 transition-colors cursor-pointer"
              >
                Live Monitor
              </button>
              <Link href="/map" className="hover:text-cream-200/80 transition-colors">
                Pollution Map
              </Link>
              <button
                onClick={() => navigateWithReveal("/admin", "Admin Command Console")}
                className="hover:text-cream-200/80 transition-colors cursor-pointer"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-cream-200/30 gap-3">
            <p>© {new Date().getFullYear()} STREETAIR. Research deployment.</p>
            <p>CPCB National Air Quality Standards · ESP32 IoT</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
