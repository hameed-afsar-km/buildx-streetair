import React from "react";
import { StationOperationalStatus } from "@/lib/types";
import { CheckCircle2, XCircle, Wrench, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface StationStatusProps {
  status: StationOperationalStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StationStatus({ status, size = "md", className }: StationStatusProps) {
  const getBadge = () => {
    switch (status) {
      case "online":
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
          label: "ONLINE",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        };
      case "offline":
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,
          label: "OFFLINE",
          className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
        };
      case "calibrating":
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />,
          label: "CALIBRATING",
          className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        };
      case "maintenance":
        return {
          icon: <Wrench className="w-3.5 h-3.5 text-blue-500" />,
          label: "MAINTENANCE",
          className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        };
    }
  };

  const badge = getBadge();
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono font-bold tracking-wider",
        badge.className,
        sizeClasses,
        className
      )}
    >
      {badge.icon}
      {badge.label}
    </span>
  );
}

