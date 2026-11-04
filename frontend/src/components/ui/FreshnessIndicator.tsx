import React from "react";
import { timeAgo } from "@/lib/utils";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FreshnessIndicatorProps {
  timestamp: string | Date;
  className?: string;
  showIcon?: boolean;
}

export function FreshnessIndicator({
  timestamp,
  className,
  showIcon = true,
}: FreshnessIndicatorProps) {
  const dateObj = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffSec = (now.getTime() - dateObj.getTime()) / 1000;

  // Under 2 mins is considered fresh real-time
  const isFresh = diffSec < 120;
  const isStale = diffSec >= 120 && diffSec < 600;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-mono",
        isFresh
          ? "text-emerald-600 dark:text-emerald-400 font-medium"
          : isStale
          ? "text-amber-600 dark:text-amber-400"
          : "text-slate-500 dark:text-slate-400",
        className
      )}
      title={`Telemetry timestamp: ${dateObj.toLocaleString()}`}
    >
      {showIcon && <Clock className="w-3.5 h-3.5 opacity-80" />}
      <span>Updated {timeAgo(dateObj)}</span>
    </span>
  );
}

