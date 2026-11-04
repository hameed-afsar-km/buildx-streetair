"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getStationById, getLatestReading, getReadingHistory } from "@/lib/api/endpoints";
import { MonitoringStation, AirReading, ReadingHistoryPoint } from "@/lib/types";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { StationStatus } from "@/components/ui/StationStatus";
import { FreshnessIndicator } from "@/components/ui/FreshnessIndicator";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { AQITrendChart } from "@/components/charts/AQITrendChart";
import { PollutantBreakdownChart } from "@/components/charts/PollutantBreakdownChart";
import { ArrowLeft, MapPin, Cpu, Radio, ShieldCheck } from "lucide-react";
import { getAQIClassification } from "@/lib/aqi";

export default function StationDetailPage() {
  const params = useParams();
  const stationId = (params?.stationId as string) || "crescent-vandalur-01";

  const [station, setStation] = useState<MonitoringStation | null>(null);
  const [reading, setReading] = useState<AirReading | null>(null);
  const [history, setHistory] = useState<ReadingHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const st = await getStationById(stationId);
        setStation(st);
        const rd = await getLatestReading(stationId);
        setReading(rd);
        const hist = await getReadingHistory(stationId);
        setHistory(hist);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [stationId]);

  if (loading || !station) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      </div>
    );
  }

  const classification = getAQIClassification(station.aqi);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb / Back button */}
        <Link
          href="/stations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Stations</span>
        </Link>

        {/* Station Hero Header */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StationStatus status={station.status} size="sm" />
                <DataSourceBadge source={station.source} size="sm" />
                {station.is_hardware_connected && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    ESP32 HARDWARE LINKED
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {station.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>
                  {station.location_name}, {station.city}, {station.state} (
                  {station.coordinates.lat}° N, {station.coordinates.lng}° E)
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <AQIBadge aqi={station.aqi} size="xl" />
            </div>
          </div>
        </div>

        {/* Real-time Pollutant Breakdown */}
        {reading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard
              title="PM2.5"
              value={reading.pollutants.pm25.value}
              unit="µg/m³"
              subtitle={`Safe: ${reading.pollutants.pm25.safe_threshold}`}
              statusColor="emerald"
            />
            <MetricCard
              title="PM10"
              value={reading.pollutants.pm10.value}
              unit="µg/m³"
              subtitle={`Safe: ${reading.pollutants.pm10.safe_threshold}`}
              statusColor="emerald"
            />
            <MetricCard
              title="NO2"
              value={reading.pollutants.no2.value}
              unit="ppb"
              subtitle={`Safe: ${reading.pollutants.no2.safe_threshold}`}
              statusColor="blue"
            />
            <MetricCard
              title="SO2"
              value={reading.pollutants.so2.value}
              unit="ppb"
              subtitle={`Safe: ${reading.pollutants.so2.safe_threshold}`}
              statusColor="purple"
            />
            <MetricCard
              title="CO"
              value={reading.pollutants.co.value}
              unit="ppm"
              subtitle={`Safe: ${reading.pollutants.co.safe_threshold}`}
              statusColor="slate"
            />
            <MetricCard
              title="O3"
              value={reading.pollutants.o3.value}
              unit="ppb"
              subtitle={`Safe: ${reading.pollutants.o3.safe_threshold}`}
              statusColor="amber"
            />
          </div>
        )}

        {/* Historical Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="24-Hour Continuous AQI Trend"
            description="Time-series observations with NAQI severity bands."
          >
            <AQITrendChart data={history} height={260} />
          </ChartCard>

          {reading && (
            <ChartCard
              title="Pollutant Sub-Index Matrix"
              description="Relative concentrations against National Ambient Air Quality standards."
            >
              <PollutantBreakdownChart pollutants={reading.pollutants} height={260} />
            </ChartCard>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

