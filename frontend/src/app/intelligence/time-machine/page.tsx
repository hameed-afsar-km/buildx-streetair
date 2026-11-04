"use client";

import React, { useState, useEffect } from "react";
import { getStations, getReadingHistory } from "@/lib/api/endpoints";
import { MonitoringStation, ReadingHistoryPoint } from "@/lib/types";
import { ChartCard } from "@/components/ui/ChartCard";
import { AQITrendChart } from "@/components/charts/AQITrendChart";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";

export default function PollutionTimeMachinePage() {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [selectedStation, setSelectedStation] = useState("crescent-vandalur-01");
  const [history, setHistory] = useState<ReadingHistoryPoint[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);

  useEffect(() => {
    getStations().then(setStations);
    getReadingHistory(selectedStation).then((data) => {
      setHistory(data);
      setPlaybackIndex(data.length - 1);
    });
  }, [selectedStation]);

  // Automated Playback Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && history.length > 0) {
      timer = setInterval(() => {
        setPlaybackIndex((prev) => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, history]);

  const currentPoint = history[playbackIndex] || history[0];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
            <Clock className="w-4 h-4" />
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Pollution Time Machine: Atmospheric Playback
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Scrub through historical time-series observations, compare diurnal periods, and examine
          past pollution spikes.
        </p>
      </div>

      {/* Playback Controls Strip */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition"
              title={isPlaying ? "Pause Playback" : "Start Time Machine Playback"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setPlaybackIndex(0);
              }}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              title="Reset Timeline to Start"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                Playback Timestamp
              </span>
              <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                {currentPoint ? new Date(currentPoint.timestamp).toLocaleTimeString() : "—"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block">Instantaneous AQI</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {currentPoint?.aqi ?? 34}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={Math.max(0, history.length - 1)}
            value={playbackIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setPlaybackIndex(+e.target.value);
            }}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>24 Hours Ago</span>
            <span>Current Real-Time</span>
          </div>
        </div>
      </div>

      {/* Main Historical Chart */}
      <ChartCard
        title="Atmospheric Chronology Profile"
        description="Scrubbed historical point highlighted against diurnal baseline."
      >
        <AQITrendChart data={history} height={300} />
      </ChartCard>
    </div>
  );
}

