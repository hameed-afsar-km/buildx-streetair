"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from "recharts";
import { PredictionForecast } from "@/lib/types";
import { formatTime } from "@/lib/utils";

interface PredictionForecastChartProps {
  prediction: PredictionForecast;
  height?: number;
}

export function PredictionForecastChart({
  prediction,
  height = 260,
}: PredictionForecastChartProps) {
  const chartData = prediction.forecast.map((f) => ({
    time: formatTime(f.timestamp).replace(/:\d{2} /, " "),
    predicted: f.aqi_predicted,
    lower: f.aqi_lower_bound,
    upper: f.aqi_upper_bound,
    factor: f.dominant_factor,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="uncertaintyBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#c7d2fe" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <YAxis
            domain={[0, "dataMax + 20"]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-3 shadow-xl text-xs font-sans">
                    <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                      Forecast Model Projection
                    </span>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                      {label}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-slate-900 dark:text-white">Predicted AQI:</span>
                      <span className="font-mono font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                        {item.predicted}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Confidence Interval: {item.lower} - {item.upper} AQI
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                      Dominant Variable: {item.factor}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="transparent"
            fill="url(#uncertaintyBand)"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="transparent"
            fill="#ffffff"
            className="dark:fill-slate-900"
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: "#6366f1" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

