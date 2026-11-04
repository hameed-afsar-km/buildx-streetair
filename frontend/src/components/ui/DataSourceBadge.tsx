import React from "react";
import { DataSource, DataStatus } from "@/lib/types";
import { Cpu, Radio, Sparkles, Clock, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataSourceBadgeProps {
  source: DataSource;
  dataStatus?: DataStatus;
  size?: "sm" | "md";
  className?: string;
}

export function DataSourceBadge({
  source,
  dataStatus = "LIVE",
  size = "md",
  className,
}: DataSourceBadgeProps) {
  const getSourceConfig = () => {
    switch (source) {
      case "HARDWARE":
        return {
          icon: <Cpu className="w-3 h-3" />,
          label: "PHYSICAL HARDWARE",
          style: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
        };
      case "SIMULATED":
        return {
          icon: <Radio className="w-3 h-3" />,
          label: "SIMULATED (ESP32)",
          style: "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
        };
      case "DEMONSTRATION":
      default:
        return {
          icon: <Sparkles className="w-3 h-3" />,
          label: "DEMO PRESET",
          style: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
        };
    }
  };

  const getStatusConfig = () => {
    switch (dataStatus) {
      case "LIVE":
        return {
          icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />,
          label: "LIVE",
          style: "text-emerald-700 dark:text-emerald-400 font-bold",
        };
      case "STALE":
        return {
          icon: <Clock className="w-3 h-3 text-amber-500" />,
          label: "STALE",
          style: "text-amber-600 dark:text-amber-400 font-medium",
        };
      case "HISTORICAL":
        return {
          icon: <Clock className="w-3 h-3 text-slate-500" />,
          label: "HISTORICAL",
          style: "text-slate-600 dark:text-slate-400 font-medium",
        };
      case "FORECAST":
        return {
          icon: <LineChart className="w-3 h-3 text-indigo-500" />,
          label: "FORECAST",
          style: "text-indigo-600 dark:text-indigo-400 font-medium",
        };
    }
  };

  const src = getSourceConfig();
  const st = getStatusConfig();

  const sizeClasses = size === "sm" ? "text-[10px] px-1.5 py-0.5 gap-1" : "text-xs px-2 py-0.5 gap-1.5";

  return (
    <div className={cn("inline-flex items-center gap-1.5 font-mono", className)}>
      <span
        className={cn(
          "inline-flex items-center rounded border font-semibold uppercase tracking-wider",
          src.style,
          sizeClasses
        )}
        title="Sensor Data Ingestion Origin"
      >
        {src.icon}
        {src.label}
      </span>

      {dataStatus && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase tracking-wider",
            st.style,
            sizeClasses
          )}
        >
          {st.icon}
          {st.label}
        </span>
      )}
    </div>
  );
}

