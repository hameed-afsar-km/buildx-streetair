"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Pollutants } from "@/lib/types";
import { getAQIColor } from "@/lib/aqi";
import { getMockLatestReading } from "@/lib/api/mockAdapter";

interface PollutantBreakdownChartProps {
  pollutants?: Pollutants;
  height?: number;
}

export function PollutantBreakdownChart({
  pollutants,
  height = 240,
}: PollutantBreakdownChartProps) {
  const p = pollutants || getMockLatestReading("crescent-vandalur-01").pollutants;
  const chartData = [
    {
      name: "PM2.5",
      value: p.pm25.value,
      unit: p.pm25.unit,
      subIndex: p.pm25.sub_index || 0,
      threshold: p.pm25.safe_threshold || 60,
    },
    {
      name: "PM10",
      value: p.pm10.value,
      unit: p.pm10.unit,
      subIndex: p.pm10.sub_index || 0,
      threshold: p.pm10.safe_threshold || 100,
    },
    {
      name: "NO2",
      value: p.no2.value,
      unit: p.no2.unit,
      subIndex: p.no2.sub_index || 0,
      threshold: p.no2.safe_threshold || 80,
    },
    {
      name: "SO2",
      value: p.so2.value,
      unit: p.so2.unit,
      subIndex: p.so2.sub_index || 0,
      threshold: p.so2.safe_threshold || 80,
    },
    {
      name: "CO",
      value: p.co.value,
      unit: p.co.unit,
      subIndex: p.co.sub_index || 0,
      threshold: p.co.safe_threshold || 2,
    },
    {
      name: "O3",
      value: p.o3.value,
      unit: p.o3.unit,
      subIndex: p.o3.sub_index || 0,
      threshold: p.o3.safe_threshold || 100,
    },
  ];

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
          <XAxis
            dataKey="name"
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
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-3 shadow-xl text-xs font-sans">
                    <p className="font-bold text-slate-900 dark:text-white mb-1">
                      {item.name} Telemetry
                    </p>
                    <div className="flex items-center justify-between gap-3 text-slate-600 dark:text-slate-300">
                      <span>Concentration:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {item.value} {item.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-slate-600 dark:text-slate-300 mt-1">
                      <span>Sub-Index AQI:</span>
                      <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                        {item.subIndex}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                      CPCB 24h Threshold: {item.threshold} {item.unit}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="subIndex" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getAQIColor(entry.subIndex)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

