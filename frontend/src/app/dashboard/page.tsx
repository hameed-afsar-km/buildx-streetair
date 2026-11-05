"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer } from "@/components/map/MapContainer";
import { MapLegend } from "@/components/map/MapLegend";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { BottomNavigation } from "@/components/ui/BottomNavigation";
import { AssistantDock } from "@/components/ui/AssistantDock";
import { MapSettingsDock } from "@/components/ui/MapSettingsDock";
import { EmergencyAlertToast } from "@/components/ui/EmergencyAlertToast";
import { NeighborhoodMeshScanner } from "@/components/dashboard/NeighborhoodMeshScanner";
import { useLiveWebSocket } from "@/hooks/useLiveWebSocket";
import { getAlerts, getStations } from "@/lib/api/endpoints";
import { EnvironmentalAlert, MonitoringStation } from "@/lib/types";
import { TAMIL_NADU_60_STATIONS } from "@/lib/stationsData";
import { X, Radar } from "lucide-react";

export default function PublicDashboardPage() {
  const { reading } = useLiveWebSocket();
  const [stations, setStations] = useState<MonitoringStation[]>(TAMIL_NADU_60_STATIONS);
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);

  const [mapCenter, setMapCenter] = useState<[number, number]>([12.8797, 80.0833]);
  const [mapZoom, setMapZoom] = useState(11);

  const aqi = reading?.aqi ?? 68;

  useEffect(() => {
    const refreshData = () => {
      getStations().then((data) => {
        if (Array.isArray(data) && data.length > 0) setStations(data);
      });
      getAlerts(true).then((data) => setAlerts(Array.isArray(data) ? data : []));
    };
    refreshData();

    if (typeof window !== "undefined") {
      const handleScenario = () => refreshData();
      const handleHeatmapToggle = (e: any) => {
        if (e.detail?.showHeatmap !== undefined) {
          setShowHeatmap(e.detail.showHeatmap);
        } else {
          setShowHeatmap((prev) => !prev);
        }
      };

      window.addEventListener("streetair:scenario_changed", handleScenario);
      window.addEventListener("streetair:toggle_heatmap", handleHeatmapToggle);

      return () => {
        window.removeEventListener("streetair:scenario_changed", handleScenario);
        window.removeEventListener("streetair:toggle_heatmap", handleHeatmapToggle);
      };
    }
  }, []);

  const handleRecenter = () => {
    setMapCenter([12.8797, 80.0833]);
    setMapZoom(11);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* 1. DYNAMIC PILL ISLAND NAVBAR (Floating at Top-Center, Click to Expand) */}
      <PublicHeader
        variant="pill"
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
      />

      {/* 2. FULL-SCREEN UNOBSTRUCTED LEAFLET MAP VIEW */}
      <main className="absolute inset-0 z-0">
        <MapContainer
          stations={stations.length > 0 ? stations : TAMIL_NADU_60_STATIONS}
          selectedStationId="crescent-vandalur-01"
          center={mapCenter}
          zoom={mapZoom}
          showControls={false}
          showLegend={false}
          showHeatmap={showHeatmap}
          showStations={showStations}
        />
      </main>

      {/* 3. BOTTOM-CENTER EMERGENCY ALERT TOAST MODAL POP-UP */}
      <EmergencyAlertToast
        alerts={alerts}
        currentAqi={aqi}
        onOpenScanner={() => setScannerModalOpen(true)}
      />

      {/* 4. MAP & SIMULATION SETTINGS BUTTON (Directly Above Chatbot Icon) */}
      <MapSettingsDock
        showHeatmap={showHeatmap}
        onToggleHeatmap={(val) => setShowHeatmap(val)}
        showStations={showStations}
        onToggleStations={(val) => setShowStations(val)}
        onRecenter={handleRecenter}
        currentAqi={aqi}
      />

      {/* 5. AURA CHATBOT FLOATING ICON (Bottom-Right) */}
      <AssistantDock />

      {/* 6. MODAL: AUTONOMOUS NEIGHBORHOOD MESH SCANNER */}
      {scannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Radar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Autonomous Neighborhood Systems Scanner
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Triangulating 8 nearest radial stations around Crescent Institute epicenter
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScannerModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <NeighborhoodMeshScanner originAqi={aqi} />
            </div>
          </div>
        </div>
      )}

      {/* 7. MAP LEGEND (Bottom-Left, Subtle) */}
      <div className="absolute bottom-6 left-6 z-20 hidden md:block max-w-xs pointer-events-none">
        <div className="pointer-events-auto opacity-80 hover:opacity-100 transition-opacity">
          <MapLegend />
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
