import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositiveGood?: boolean;
    label?: string;
  };
  badge?: React.ReactNode;
  statusColor?: "emerald" | "amber" | "orange" | "red" | "purple" | "blue" | "slate" | "rose";
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  badge,
  statusColor = "slate",
  className,
}: MetricCardProps) {
  const borderColors = {
    emerald: "border-l-4 border-l-emerald-500",
    amber: "border-l-4 border-l-amber-500",
    orange: "border-l-4 border-l-orange-500",
    red: "border-l-4 border-l-red-500",
    rose: "border-l-4 border-l-rose-500",
    purple: "border-l-4 border-l-purple-500",
    blue: "border-l-4 border-l-blue-500",
    slate: "border-l-4 border-l-slate-400 dark:border-l-slate-600",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm transition hover:shadow-md",
        borderColors[statusColor],
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {title}
        </span>
        {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
            {unit}
          </span>
        )}
        {badge && <div className="ml-auto">{badge}</div>}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {trend && (
            <span
              className={cn(
                "inline-flex items-center font-semibold font-mono",
                trend.value < 0
                  ? trend.isPositiveGood
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                  : trend.isPositiveGood
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}{" "}
              <span className="text-slate-600 dark:text-slate-400 font-normal ml-1">
                {trend.label || "vs yesterday"}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

