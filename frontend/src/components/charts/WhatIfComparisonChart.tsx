"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface WhatIfComparisonChartProps {
  hourlyProjection: {
    hour: string;
    baseline: number;
    simulated: number;
  }[];
  height?: number;
}

export function WhatIfComparisonChart({
  hourlyProjection,
  height = 260,
}: WhatIfComparisonChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={hourlyProjection}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
          <XAxis
            dataKey="hour"
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
              if (active && payload && payload.length >= 2) {
                const baselineVal = payload[0].value as number;
                const simVal = payload[1].value as number;
                const delta = simVal - baselineVal;
                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-3 shadow-xl text-xs font-sans">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {label} Projection
                    </p>
                    <div className="flex items-center justify-between gap-3 text-slate-500">
                      <span>Observed Baseline:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        AQI {baselineVal}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <span>Simulated Policy:</span>
                      <span className="font-mono font-bold">
                        AQI {simVal}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-brand-600 dark:text-brand-400 mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 font-mono">
                      Mitigation Delta: {delta} AQI ({Math.round((delta / baselineVal) * 100)}%)
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Line
            type="monotone"
            name="Baseline AQI (Current)"
            dataKey="baseline"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            name="Simulated Policy Outcome"
            dataKey="simulated"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

