"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MonitoringStation } from "@/lib/types";
import { getAQIColor } from "@/lib/aqi";
import { StationDetailDrawer } from "./StationDetailDrawer";
import { MapLegend } from "./MapLegend";
import { Layers, Eye, RefreshCw } from "lucide-react";

interface MapInnerProps {
  stations: MonitoringStation[];
  selectedStationId?: string;
  onSelectStation?: (station: MonitoringStation) => void;
  center?: [number, number];
  zoom?: number;
  heatmapIntensity?: number;
  showControls?: boolean;
  showLegend?: boolean;
}

export function MapInner({
  stations,
  selectedStationId,
  onSelectStation,
  center = [12.8797, 80.0833], // B.S. Abdur Rahman Crescent Institute, Vandalur
  zoom = 13,
  heatmapIntensity,
  showControls = true,
  showLegend = true,
}: MapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedStation, setSelectedStation] = useState<MonitoringStation | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showStations, setShowStations] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
    });

    // OpenStreetMap standard tile layer with proper required attribution
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | STREETAIR Telemetry Grid',
      maxZoom: 19,
    }).addTo(map);

    // Zoom controls at bottom right
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    const heatmapGroup = L.layerGroup().addTo(map);

    markersLayerRef.current = markersGroup;
    heatmapLayerRef.current = heatmapGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center, zoom]);

  // Handle selectedStationId changes from parent
  useEffect(() => {
    if (selectedStationId && stations.length > 0) {
      const match = stations.find((s) => s.id === selectedStationId);
      if (match) setSelectedStation(match);
    }
  }, [selectedStationId, stations]);

  // Update Markers and Heatmap Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !heatmapLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    heatmapLayerRef.current.clearLayers();

    stations.forEach((st) => {
      const color = getAQIColor(st.aqi);

      // Estimated Heatmap Interpolation Layer (Gaussian radius)
      if (showHeatmap) {
        const displayedAqi = st.id === selectedStationId && heatmapIntensity !== undefined ? heatmapIntensity : st.aqi;
        const circle = L.circle([st.coordinates.lat, st.coordinates.lng], {
          color: "transparent",
          fillColor: color,
          fillOpacity: 0.28,
          radius: 2200, // 2.2km radius for local dispersion surface
        });
        circle.bindTooltip(
          `<strong>${st.name}</strong><br/>Estimated Dispersion AQI: ${displayedAqi}`,
          { direction: "top" }
        );
        heatmapLayerRef.current?.addLayer(circle);
      }

      // Station Marker
      if (showStations) {
        const pinHtml = `
          <div class="custom-station-pin ${st.id === "crescent-vandalur-01" ? "live-pulse" : ""}" style="background-color: ${color}; width: 36px; height: 36px; border: 2.5px solid white;">
            <span style="font-size: 11px; font-family: monospace;">${st.aqi}</span>
          </div>
        `;

        const icon = L.divIcon({
          html: pinHtml,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([st.coordinates.lat, st.coordinates.lng], { icon });

        marker.on("click", () => {
          setSelectedStation(st);
          onSelectStation?.(st);
          mapInstanceRef.current?.panTo([st.coordinates.lat, st.coordinates.lng], {
            animate: true,
            duration: 0.5,
          });
        });

        markersLayerRef.current?.addLayer(marker);
      }
    });
  }, [stations, showHeatmap, showStations, onSelectStation, selectedStationId, heatmapIntensity]);

  const handleResetView = () => {
    mapInstanceRef.current?.setView(center, zoom, { animate: true });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
      {/* Map DOM node */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

      {/* Layer Controls Pill (Optional) */}
      {showControls && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs font-semibold">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-700 dark:text-slate-300 mr-1">Layers:</span>

          <button
            type="button"
            onClick={() => setShowStations(!showStations)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${
              showStations
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Stations</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${
              showHeatmap
                ? "bg-purple-600 text-white"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
            title="Localized spatial interpolation (Estimated)"
          >
            <span>Heatmap (Est.)</span>
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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

      {/* Map Legend (Bottom Left) (Optional) */}
      {showLegend && (
        <div className="absolute bottom-6 left-4 z-20 max-w-xs">
          <MapLegend />
        </div>
      )}
    </div>
  );
}
