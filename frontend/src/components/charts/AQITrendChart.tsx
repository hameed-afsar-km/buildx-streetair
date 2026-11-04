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
  ReferenceLine,
} from "recharts";
import { ReadingHistoryPoint } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { getMockReadingHistory } from "@/lib/api/mockAdapter";

interface AQITrendChartProps {
  data?: ReadingHistoryPoint[];
  height?: number;
}

export function AQITrendChart({ data, height = 260 }: AQITrendChartProps) {
  const points = data && data.length > 0 ? data : getMockReadingHistory("crescent-vandalur-01");
  const chartData = points.map((d) => ({
    time: formatTime(d.timestamp).replace(/:\d{2} /, " "),
    aqi: d.aqi,
    pm25: d.pm25,
    pm10: d.pm10,
    timestamp: d.timestamp,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
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
            domain={[0, "dataMax + 30"]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const val = payload[0].value as number;
                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-3 shadow-xl text-xs font-sans">
                    <p className="font-semibold text-slate-500 mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">AQI Index:</span>
                      <span className="font-mono font-extrabold text-sm text-brand-600 dark:text-brand-400">
                        {val}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400 font-mono">
                      PM2.5: {payload[0].payload.pm25} µg/m³
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={50} stroke="#10B981" strokeDasharray="3 3" label={{ value: "Good (50)", fill: "#10B981", fontSize: 10, position: "insideTopRight" }} />
          <ReferenceLine y={100} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: "Moderate (100)", fill: "#F59E0B", fontSize: 10, position: "insideTopRight" }} />
          <ReferenceLine y={200} stroke="#EF4444" strokeDasharray="3 3" label={{ value: "Unhealthy (200)", fill: "#EF4444", fontSize: 10, position: "insideTopRight" }} />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#16a34a"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#aqiGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

