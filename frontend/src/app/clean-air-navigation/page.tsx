"use client";

import React, { useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Navigation, AlertTriangle, ShieldAlert, MapPin, CheckCircle, ArrowRight } from "lucide-react";

export default function CleanAirNavigationPage() {
  const [origin, setOrigin] = useState("Crescent Institute Gate 1, Vandalur");
  const [destination, setDestination] = useState("Kilambakkam Bus Terminus (KCBT)");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Clean-Air Navigation Routing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare commuter transit corridors by cumulative particulate exposure and traffic exhaust density.
          </p>
        </div>

        {/* Route Input Form */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Departure Origin
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-brand-600" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Destination Point
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-red-500" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Honest Data Coverage & Feature Status Disclosure */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Limited Spatial Coverage & Experimental Status
            </h3>
          </div>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            Clean-Air Routing requires high-density micro-sensor mesh coverage along each street segment.
            Currently, our live mesh covers the <strong>Vandalur–Kilambakkam–GST Road</strong> corridor with
            5 active nodes.
            We do not interpolate route exposure for residential side streets where no verified telemetry exists.
          </p>
        </div>

        {/* Route Exposure Comparison Demonstration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Route A: Fastest (GST Highway) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Route Option A (Direct Highway)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                Fastest
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Via GST Road (NH 45) Main Carriageway
            </h3>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono">
              <div className="flex justify-between">
                <span>Distance:</span>
                <span className="font-bold text-slate-900 dark:text-white">2.8 km</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Travel Time:</span>
                <span className="font-bold text-slate-900 dark:text-white">8 mins</span>
              </div>
              <div className="flex justify-between text-red-600 dark:text-red-400 font-bold">
                <span>Estimated Exposure AQI:</span>
                <span>AQI 148 (High NO2 & PM2.5)</span>
              </div>
            </div>
          </div>

          {/* Route B: Lower Exposure (Buffer Road) */}
          <div className="rounded-2xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/30 dark:bg-brand-950/20 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 font-mono">
                Route Option B (Green Buffer)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300 font-bold">
                Lower Exposure
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Via Otteri Lake Perimeter & Reserve Road
            </h3>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono">
              <div className="flex justify-between">
                <span>Distance:</span>
                <span className="font-bold text-slate-900 dark:text-white">3.4 km</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Travel Time:</span>
                <span className="font-bold text-slate-900 dark:text-white">12 mins</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Estimated Exposure AQI:</span>
                <span>AQI 62 (42% Lower Exposure)</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

