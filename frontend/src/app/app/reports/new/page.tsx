"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { createReport } from "@/lib/api/endpoints";
import { ReportCategory } from "@/lib/types";
import {
  FilePlus,
  MapPin,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowLeft,
} from "lucide-react";

export default function NewReportPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [category, setCategory] = useState<ReportCategory>("waste_burning");
  const [address, setAddress] = useState("Behind Crescent Sports Complex, Vandalur");
  const [lat, setLat] = useState<number>(12.8795);
  const [lng, setLng] = useState<number>(80.083);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [step, setStep] = useState<"form" | "preview" | "confirmed">("form");
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: { key: ReportCategory; label: string; desc: string }[] = [
    { key: "waste_burning", label: "Waste / Garbage Burning", desc: "Open combustion of plastic, garbage, or dry leaves." },
    { key: "construction_dust", label: "Construction Dust", desc: "Heavy dust plume from civil excavation or transport." },
    { key: "industrial_emissions", label: "Industrial Smoke / Stack", desc: "Dark or chemical emissions from factory stacks." },
    { key: "traffic_congestion", label: "Vehicular Exhaust Spike", desc: "Severe diesel truck idling or traffic corridor backlog." },
    { key: "smoke", label: "Dense Smoke Plume", desc: "Dense smoke from commercial kitchens, generators, or fires." },
    { key: "odour", label: "Chemical / Pungent Odour", desc: "Nauseating or irritating chemical stench." },
    { key: "other", label: "Other Environmental Hazard", desc: "Unspecified atmospheric pollution concern." },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await createReport({
        category,
        location: { lat, lng },
        address,
        description,
        image_url: imageUrl || undefined,
      });
      setCreatedReportId(res.id);
      setStep("confirmed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">
          Authentication Required to Report
        </h2>
        <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1 mb-4 leading-relaxed">
          Community reports enter verified legal moderation queues. Please sign in or create an
          account to submit.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-sm"
        >
          <span>Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/app/reports"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to My Reports</span>
      </Link>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        {step === "form" && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 font-mono">
                Community Reporting Protocol (Step 1 of 2)
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Report a Pollution Concern
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Your report will be time-stamped, cross-referenced with nearest sensor telemetry,
                and forwarded to municipal and campus enforcement.
              </p>
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                1. Select Pollution Category:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      category === cat.key
                        ? "border-brand-600 bg-brand-50/50 dark:bg-brand-950/30 text-brand-950 dark:text-brand-100 ring-2 ring-brand-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold">{cat.label}</span>
                    <span className="text-[10px] text-slate-500 mt-1">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                2. Location Coordinates & Address:
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-brand-600" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address or campus landmark..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span>Lat: {lat}</span>
                <span>Lng: {lng}</span>
                <span className="text-brand-600 font-semibold">(Tagged from Crescent beacon mesh)</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                3. Detailed Description:
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the visible smoke, smell, active duration, or observed vehicle/plant activity..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none leading-relaxed"
              />
            </div>

            {/* Image URL / Attachment */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                4. Photographic Evidence (Optional URL / Attachment):
              </label>
              <div className="relative">
                <Upload className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/pollution_photo.jpg (or paste storage image URL)"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                disabled={!description.trim()}
                onClick={() => setStep("preview")}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                <span>Preview Report</span>
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 font-mono">
                Verification (Step 2 of 2)
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Review Your Report Before Backend Transmission
              </h2>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs space-y-3 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold text-slate-900 dark:text-white uppercase">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-bold text-slate-900 dark:text-white">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reporter:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {user?.display_name} ({user?.email})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Description:</span>
                <p className="p-2.5 rounded-lg bg-white dark:bg-slate-900 font-sans text-slate-700 dark:text-slate-300">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Back to Edit
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                <span>{isSubmitting ? "Transmitting to Server..." : "Submit Report to Backend"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === "confirmed" && (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Report Confirmed & Transmitted
            </h2>

            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your pollution report has been assigned Reference ID{" "}
              <strong className="font-mono text-slate-800 dark:text-slate-200">{createdReportId}</strong>{" "}
              with initial status <strong>SUBMITTED</strong>. It has been logged to the spatial database.
            </p>

            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/app/reports"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-700"
              >
                <span>Track My Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

