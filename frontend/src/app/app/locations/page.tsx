"use client";

import React from "react";
import { MapPin, Plus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AQIBadge } from "@/components/ui/AQIBadge";

export default function SavedLocationsPage() {
  const locations = [
    {
      name: "Crescent Institute Research Lab (Primary)",
      address: "School of Infrastructure, GST Road, Vandalur",
      aqi: 34,
      stationId: "crescent-vandalur-01",
      primary: true,
    },
    {
      name: "Kilambakkam Metro Terminal Gateway",
      address: "Kalaignar Centenary Bus Terminus",
      aqi: 148,
      stationId: "kilambakkam-terminal-02",
      primary: false,
    },
    {
      name: "Tambaram Residence",
      address: "East Tambaram, Chennai South",
      aqi: 165,
      stationId: "tambaram-junction-03",
      primary: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Saved Monitored Locations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pin and track air quality for your home, university department, or daily commute nodes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Added to saved places")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Save New Location</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {locations.map((loc, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-brand-600">
                  {loc.primary ? "Primary Home Beacon" : "Saved Place"}
                </span>
                <AQIBadge aqi={loc.aqi} size="sm" />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {loc.name}
              </h3>

              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{loc.address}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href={`/stations/${loc.stationId}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
              >
                <span>View Station</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

