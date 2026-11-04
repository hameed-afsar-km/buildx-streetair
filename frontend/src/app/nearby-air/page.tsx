"use client";

import React, { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getStations, getLatestReading } from "@/lib/api/endpoints";
import { MonitoringStation, AirReading } from "@/lib/types";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { FreshnessIndicator } from "@/components/ui/FreshnessIndicator";
import { MetricCard } from "@/components/ui/MetricCard";
import {
  Navigation,
  MapPin,
  AlertCircle,
  ShieldCheck,
  Compass,
  ArrowRight,
  Info,
} from "lucide-react";
import { getAQIClassification } from "@/lib/aqi";

export default function NearbyAirPage() {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [nearestStation, setNearestStation] = useState<MonitoringStation | null>(null);
  const [reading, setReading] = useState<AirReading | null>(null);
  const [userLocationName, setUserLocationName] = useState("Vandalur Junction, Chennai");
  const [distanceKm, setDistanceKm] = useState<number>(0.8);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    getStations().then((list) => {
      setStations(list);
      // Default to Crescent Institute
      const primary = list.find((s) => s.id === "crescent-vandalur-01") || list[0];
      if (primary) {
        setNearestStation(primary);
        getLatestReading(primary.id).then(setReading);
      }
    });
  }, []);

  const handleUseBrowserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserLocationName(
          `Current Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
        );
        // Compute nearest station (Haversine approximation)
        if (stations.length > 0) {
          let closest = stations[0];
          let minD = 999999;
          stations.forEach((st) => {
            const dLat = st.coordinates.lat - pos.coords.latitude;
            const dLng = st.coordinates.lng - pos.coords.longitude;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng) * 111; // Approx km
            if (dist < minD) {
              minD = dist;
              closest = st;
            }
          });
          setNearestStation(closest);
          setDistanceKm(+minD.toFixed(1));
          getLatestReading(closest.id).then(setReading);
        }
      },
      () => {
        setIsLocating(false);
        alert("Location access denied or unavailable. Using default Vandalur demonstration point.");
      }
    );
  };

  const isDistant = distanceKm > 3.0;
  const classification = nearestStation ? getAQIClassification(nearestStation.aqi) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Nearby Air Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Detect the nearest continuous monitoring station and evaluate localized air quality
            with honest proximity boundaries.
          </p>
        </div>

        {/* Location Input & GPS Trigger */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center flex-shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                Your Monitored Location
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {userLocationName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseBrowserLocation}
            disabled={isLocating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Locating..." : "Use My Current GPS Location"}</span>
          </button>
        </div>

        {/* Spatial Proximity Disclosure Banner */}
        {isDistant && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Distance Uncertainty Notice:</strong> The nearest operational station (
              <strong>{nearestStation?.name}</strong>) is <strong>{distanceKm} km away</strong>.
              Microclimate factors, local diesel traffic, and building wake effects mean your immediate
              block may differ from this station&apos;s observations.
            </div>
          </div>
        )}

        {/* Nearest Station Card */}
        {nearestStation && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                    NEAREST BEACON: {distanceKm} KM AWAY
                  </span>
                  <DataSourceBadge source={nearestStation.source} size="sm" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {nearestStation.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{nearestStation.location_name}</p>
              </div>

              <div className="flex items-center gap-3">
                <AQIBadge aqi={nearestStation.aqi} size="xl" />
              </div>
            </div>

            {/* Health Advisory */}
            {classification && (
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Recommended Precaution for Your Vicinity:
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {classification.advisory}
                </p>
                <p className="text-[11px] text-slate-500">
                  {classification.activityRecommendation}
                </p>
              </div>
            )}

            {/* Pollutants Grid */}
            {reading && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  title="PM2.5"
                  value={reading.pollutants.pm25.value}
                  unit="µg/m³"
                  subtitle={`Sub-AQI: ${reading.pollutants.pm25.sub_index}`}
                  statusColor="emerald"
                />
                <MetricCard
                  title="PM10"
                  value={reading.pollutants.pm10.value}
                  unit="µg/m³"
                  subtitle={`Sub-AQI: ${reading.pollutants.pm10.sub_index}`}
                  statusColor="emerald"
                />
                <MetricCard
                  title="NO2"
                  value={reading.pollutants.no2.value}
                  unit="ppb"
                  subtitle={`Sub-AQI: ${reading.pollutants.no2.sub_index}`}
                  statusColor="blue"
                />
                <MetricCard
                  title="SO2"
                  value={reading.pollutants.so2.value}
                  unit="ppb"
                  subtitle={`Sub-AQI: ${reading.pollutants.so2.sub_index}`}
                  statusColor="purple"
                />
              </div>
            )}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

