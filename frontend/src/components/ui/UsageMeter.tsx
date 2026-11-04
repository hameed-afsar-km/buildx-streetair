import React from "react";
import { cn } from "@/lib/utils";

interface UsageMeterProps {
  label: string;
  current: number;
  limit: number;
  unit?: string;
  className?: string;
}

export function UsageMeter({ label, current, limit, unit = "", className }: UsageMeterProps) {
  const percentage = Math.min(100, Math.round((current / limit) * 100));

  const getMeterColor = () => {
    if (percentage > 90) return "bg-red-500";
    if (percentage > 75) return "bg-amber-500";
    return "bg-brand-500";
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="font-mono text-slate-500 dark:text-slate-400">
          {current.toLocaleString()} / {limit.toLocaleString()} {unit} ({percentage}%)
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500 rounded-full", getMeterColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

