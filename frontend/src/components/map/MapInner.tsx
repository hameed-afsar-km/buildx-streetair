"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import { MonitoringStation } from "@/lib/types";
import { getAQIColor } from "@/lib/aqi";
import { StationDetailDrawer } from "./StationDetailDrawer";
import { MapLegend } from "./MapLegend";
import { Layers, Eye, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";

interface MapInnerProps {
  stations: MonitoringStation[];
  selectedStationId?: string;
  onSelectStation?: (station: MonitoringStation) => void;
  center?: [number, number];
  zoom?: number;
  heatmapIntensity?: number;
  showControls?: boolean;
  showLegend?: boolean;
  showHeatmap?: boolean;
  showStations?: boolean;
}

export function MapInner({
  stations = [],
  selectedStationId,
  onSelectStation,
  center = [12.8797, 80.0833], // B.S. Abdur Rahman Crescent Institute, Vandalur
  zoom = 12,
  heatmapIntensity,
  showControls = true,
  showLegend = true,
  showHeatmap: propShowHeatmap,
  showStations: propShowStations,
}: MapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedStation, setSelectedStation] = useState<MonitoringStation | null>(null);
  const [internalShowHeatmap, setInternalShowHeatmap] = useState(true);
  const [internalShowStations, setInternalShowStations] = useState(true);

  const showHeatmap = propShowHeatmap !== undefined ? propShowHeatmap : internalShowHeatmap;
  const showStations = propShowStations !== undefined ? propShowStations : internalShowStations;

  // Extract center coordinates primitives to prevent unnecessary remounts
  const centerLat = center[0] ?? 12.8797;
  const centerLng = center[1] ?? 80.0833;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom,
      zoomControl: false,
    });

    // OpenStreetMap standard tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | STREETAIR Telemetry Grid',
      maxZoom: 19,
    }).addTo(map);

    // Zoom controls positioned safely at topleft (offset below top navbar)
    L.control
      .zoom({
        position: "topleft",
      })
      .addTo(map);

    const heatmapGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);

    heatmapLayerRef.current = heatmapGroup;
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Force size invalidation across rendering cycles
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", onResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [centerLat, centerLng, zoom]);

  // Handle selectedStationId changes from parent
  useEffect(() => {
    if (selectedStationId && stations.length > 0) {
      const match = stations.find((s) => s.id === selectedStationId);
      if (match) setSelectedStation(match);
    }
  }, [selectedStationId, stations]);

  // Update Markers and Heatmap Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const heatmapGroup = heatmapLayerRef.current;

    if (!map || !markersGroup || !heatmapGroup) return;

    markersGroup.clearLayers();
    heatmapGroup.clearLayers();

    if (!stations || stations.length === 0) return;

    stations.forEach((st) => {
      const lat = Number(st.coordinates?.lat ?? (st as any)?.latitude);
      const lng = Number(st.coordinates?.lng ?? (st as any)?.longitude);
      if (isNaN(lat) || isNaN(lng) || lat === 0) return;

      const aqi = typeof st.aqi === "number" ? st.aqi : 68;
      const color = getAQIColor(aqi);

      // Estimated Heatmap Dispersion Surface (Two-tier Gaussian gradient)
      if (showHeatmap) {
        const displayedAqi =
          st.id === selectedStationId && heatmapIntensity !== undefined ? heatmapIntensity : aqi;

        // Outer ambient dispersion halo
        const outerCircle = L.circle([lat, lng], {
          color: color,
          weight: 1.5,
          opacity: 0.6,
          fillColor: color,
          fillOpacity: 0.28,
          radius: 3200, // 3.2km dispersion radius
        });

        // Inner concentrated hotspot core
        const coreCircle = L.circle([lat, lng], {
          color: "transparent",
          weight: 0,
          fillColor: color,
          fillOpacity: 0.45,
          radius: 1200, // 1.2km core plume
        });

        outerCircle.bindTooltip(
          `<div class="px-2 py-1 font-sans text-xs">
            <strong class="font-bold">${st.name}</strong><br/>
            <span class="text-slate-600">Simulated Surface AQI:</span> <strong>${displayedAqi}</strong>
          </div>`,
          { direction: "top", opacity: 0.95 }
        );

        heatmapGroup.addLayer(outerCircle);
        heatmapGroup.addLayer(coreCircle);
      }

      // Station Pin Marker
      if (showStations) {
        const isMaster = st.id === "crescent-vandalur-01";
        const pinHtml = `
          <div class="custom-station-pin ${isMaster ? "live-pulse" : ""}" style="background-color: ${color}; width: 34px; height: 34px; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
            <span style="font-size: 11px; font-weight: 800; font-family: monospace; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${aqi}</span>
          </div>
        `;

        const icon = L.divIcon({
          html: pinHtml,
          className: "streetair-marker-icon",
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([lat, lng], { icon, zIndexOffset: isMaster ? 1000 : 100 });

        marker.on("click", () => {
          setSelectedStation(st);
          onSelectStation?.(st);
          map.panTo([lat, lng], {
            animate: true,
            duration: 0.5,
          });
        });

        markersGroup.addLayer(marker);
      }
    });

    // Invalidate size once layers are painted
    map.invalidateSize();
  }, [stations, showHeatmap, showStations, onSelectStation, selectedStationId, heatmapIntensity]);

  const handleResetView = () => {
    mapInstanceRef.current?.setView([centerLat, centerLng], zoom, { animate: true });
    mapInstanceRef.current?.invalidateSize();
  };

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
      {/* Map DOM node */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-0" />

      {/* Layer Controls Pill */}
      {showControls && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs font-semibold">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-700 dark:text-slate-300 mr-1">Layers:</span>

          <button
            type="button"
            onClick={() => setInternalShowStations(!showStations)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-medium ${
              showStations
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Stations</span>
          </button>

          <button
            type="button"
            onClick={() => setInternalShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-medium ${
              showHeatmap
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
            title="Localized spatial dispersion heatmap"
          >
            <span>Heatmap (Est.)</span>
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Recenter Map to Vandalur Campus"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected Station Drawer */}
      <StationDetailDrawer
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
      />

      {/* Map Legend (Bottom Left) */}
      {showLegend && (
        <div className="absolute bottom-6 left-4 z-20 max-w-xs">
          <MapLegend />
        </div>
      )}
    </div>
  );
}
