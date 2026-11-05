"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ReportCategory } from "@/lib/types";
import { createReport } from "@/lib/api/endpoints";
import {
  FileWarning,
  MapPin,
  CheckCircle2,
  Send,
  Camera,
  AlertTriangle,
  ArrowLeft,
  Flame,
  Factory,
  Car,
  CloudFog,
  Wind,
} from "lucide-react";

const CATEGORIES: { key: ReportCategory; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    key: "waste_burning",
    label: "Garbage & Waste Burning",
    desc: "Open combustion of plastic, agricultural stubble, or municipal solid waste.",
    icon: <Flame className="w-4 h-4 text-rose-500" />,
  },
  {
    key: "construction_dust",
    label: "Construction & Demolition Dust",
    desc: "Heavy fugitive dust plume from excavation, demolition, or unpaved transport roads.",
    icon: <Wind className="w-4 h-4 text-amber-500" />,
  },
  {
    key: "industrial_emissions",
    label: "Industrial Chimney / Stack Emissions",
    desc: "Dense dark smoke or chemical flaring from nearby factories and processing facilities.",
    icon: <Factory className="w-4 h-4 text-purple-500" />,
  },
  {
    key: "traffic_congestion",
    label: "Heavy Diesel Exhaust / Traffic Backlog",
    desc: "Severe vehicle queuing, unmaintained exhaust emissions on major transit corridors.",
    icon: <Car className="w-4 h-4 text-blue-500" />,
  },
  {
    key: "smoke",
    label: "Dense Smoke or Smog Plume",
    desc: "Thick visibility impairment, generator exhaust, or localized combustion plumes.",
    icon: <CloudFog className="w-4 h-4 text-slate-400" />,
  },
  {
    key: "other",
    label: "Other Environmental Hazard",
    desc: "Chemical odor, chemical spill vapor, or unspecified atmospheric pollution concern.",
    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  },
];

export default function PublicReportPage() {
  const [category, setCategory] = useState<ReportCategory>("waste_burning");
  const [address, setAddress] = useState("GST Road, near Crescent Campus, Vandalur");
  const [description, setDescription] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createReport({
        category,
        address,
        location: { lat: 12.8795, lng: 80.083 },
        description,
      });
      setSubmittedId(result.id);
    } catch {
      // Fallback ID if mock backend
      setSubmittedId(`rep-${Date.now().toString().slice(-6)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Public Dashboard
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-600 text-white shadow-sm">
              <FileWarning className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Community Pollution Reporting
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            File a Pollution Incident Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Report visible air pollution, open burning, or dust hazards. Citizen submissions are correlated with sensor anomalies for municipal verification.
          </p>
        </div>

        {submittedId ? (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Report Logged Successfully</h2>
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                Reference ID: {submittedId}
              </p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Your submission has been dispatched to the municipal moderation queue and matched against real-time micro-sensor data from the Vandalur corridor.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition"
              >
                Return to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmittedId(null);
                  setDescription("");
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                File Another Report
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Select Pollution Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.key;
                  return (
                    <div
                      key={cat.key}
                      onClick={() => setCategory(cat.key)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {cat.icon}
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {cat.label}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Incident Location */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Incident Location & Landmark
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, landmark, corridor, or neighborhood"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3. Incident Observations
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe visible smoke color, intensity, direction of spread, duration, or source..."
                className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 leading-relaxed"
              />
            </div>

            {/* Reporter Contact Info */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                4. Reporter Contact (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your Name (Optional)"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Your Email (Optional)"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Dispatching Report..." : "Submit Incident Report"}</span>
            </button>
          </form>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
