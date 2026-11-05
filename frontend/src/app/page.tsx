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
} from "lucide-react";

import { RotatingWireframeGlobe } from "@/components/ui/RotatingWireframeGlobe";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { InteractiveTitle } from "@/components/ui/InteractiveTitle";
import { PillNavbar } from "@/components/ui/PillNavbar";
import { useDashboardTransition } from "@/components/ui/DashboardTransition";
import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer";

const stages = [
  {
    step: "01",
    title: "Monitor",
    desc: "Continuous telemetry from distributed IoT nodes — PM2.5, PM10, temperature, humidity, gas resistance.",
    icon: Radio,
    accent: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  },
  {
    step: "02",
    title: "Detect",
    desc: "Real-time anomaly detection flags particulate spikes and unusual environmental shifts instantly.",
    icon: ScanSearch,
    accent: "bg-sky-50 text-sky-600 ring-1 ring-sky-200",
  },
  {
    step: "03",
    title: "Investigate",
    desc: "Co-pollutant covariance analysis and local context reasoning to identify the root cause.",
    icon: BrainCircuit,
    accent: "bg-violet-50 text-violet-600 ring-1 ring-violet-200",
  },
  {
    step: "04",
    title: "Analyse",
    desc: "Spatial hotspot mapping, diurnal trend curves, and cross-station historical comparison.",
    icon: BarChart3,
    accent: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
  },
  {
    step: "05",
    title: "Predict",
    desc: "ML-driven forecasting estimates elevated pollution risk windows hours before they peak.",
    icon: Zap,
    accent: "bg-orange-50 text-orange-600 ring-1 ring-orange-200",
  },
  {
    step: "06",
    title: "Respond",
    desc: "Situation-specific advisories pushed to citizens, operators, and public health responders.",
    icon: Bell,
    accent: "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
  },
];

export default function LandingPage() {
  const { navigateWithReveal, Overlay } = useDashboardTransition();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {Overlay}
      <SplashScreen />
      <PillNavbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-0 overflow-hidden bg-white">

        {/* Very subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#0F3D34 1px, transparent 1px), linear-gradient(90deg, #0F3D34 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top emerald glow — very subtle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-400/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

          {/* Interactive Mouse Hover Title: STREETAIR */}
          <InteractiveTitle />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 text-base sm:text-lg text-slate-500 font-normal leading-relaxed max-w-lg mx-auto"
          >
            An AI-powered platform that turns raw IoT sensor data into
            real-time air quality intelligence and predictive environmental insights.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <button
              onClick={() => navigateWithReveal("/dashboard", "Public Live Dashboard")}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 hover:scale-[1.02] active:scale-100 transition-all duration-200 shadow-sm shadow-emerald-200 cursor-pointer"
            >
              View Public Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigateWithReveal("/admin", "Admin Command Console")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-white text-slate-700 font-medium text-sm hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Admin
            </button>
          </motion.div>
        </div>

        {/* Globe — Vibrant Emerald wireframe in lower 20% arc */}
        <div className="absolute inset-x-0 bottom-0 h-[48vh] pointer-events-none overflow-hidden flex items-end justify-center">
          <div className="w-full h-[120%] relative opacity-100">
            <RotatingWireframeGlobe />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/30 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ── ABOUT / FLOW SECTION ─────────────────────────────────────── */}
      <section id="about" className="relative py-24 bg-slate-50">
        {/* Top separator */}
        <div className="absolute inset-x-0 top-0 h-px bg-slate-200" />

        <div className="max-w-6xl mx-auto px-6">

          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600 mb-3">
              How it works
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                From sensor to<br className="hidden sm:block" /> actionable insight
              </h2>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed sm:text-right">
                Six interconnected stages that process raw environmental
                data into meaningful decisions in real time.
              </p>
            </div>
          </motion.div>

          {/* Stage cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.step}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.4, delay: idx * 0.065 }}
                  className="group p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-250"
                >
                  {/* Step */}
                  <span className="text-[10px] font-mono font-medium tracking-widest text-slate-300 mb-4 block">
                    {stage.step}
                  </span>

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-4 ${stage.accent}`}>
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                    {stage.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {stage.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Deployment callout */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white"
          >
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Demonstration Deployment
              </p>
              <p className="text-sm text-slate-700">
                B.S. Abdur Rahman Crescent Institute of Science & Technology — Vandalur, Tamil Nadu
              </p>
            </div>
            <button
              onClick={() => navigateWithReveal("/dashboard", "Public Live Dashboard")}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-500 text-xs font-medium hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition-all cursor-pointer"
            >
              View live <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── HALFTONE WORDMARK FOOTER (STREETAIR) ───────────────────────── */}
      <HalftoneWordmarkFooter
        wordmark="streetair"
        label="STREETAIR"
        meta="© 2026 · Vandalur Corridor, Chennai · Environmental Telemetry Grid"
        palette={{
          background: "#080d1a",
          ink: "#e2e8f0",
          warm: "#10b981",
        }}
        columns={[
          {
            title: "Network",
            links: [
              { label: "Live Overview", href: "/dashboard" },
              { label: "Interactive Air Map", href: "/map" },
              { label: "Station Fleet", href: "/stations" },
              { label: "Nearby Corridors", href: "/nearby-air" },
            ],
          },
          {
            title: "Intelligence",
            links: [
              { label: "AQI Predictions", href: "/dashboard/predictions" },
              { label: "Report Incident", href: "/report" },
              { label: "Historical Trends", href: "/history" },
              { label: "Clean Air Navigation", href: "/clean-air-navigation" },
            ],
          },
          {
            title: "Platform",
            links: [
              { label: "Admin Console", href: "/admin" },
              { label: "AURA Assistant", href: "/admin/intelligence/chat" },
              { label: "System Health", href: "/admin/ai" },
              { label: "Research Inquiries", href: "/contact" },
            ],
          },
        ]}
        height="520px"
        dotGap={5}
        radius={80}
        crop={0.18}
        grain={0.4}
        backToTop={true}
      />
    </div>
  );
}
