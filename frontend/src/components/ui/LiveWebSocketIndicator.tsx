import React from "react";
import { LiveWSConnectionState } from "@/lib/types";
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface LiveWebSocketIndicatorProps {
  status: LiveWSConnectionState;
  lastUpdated?: Date | null;
  className?: string;
  showTime?: boolean;
}

export function LiveWebSocketIndicator({
  status,
  lastUpdated,
  className,
  showTime = true,
}: LiveWebSocketIndicatorProps) {
  const getConfig = () => {
    switch (status) {
      case "connected":
        return {
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-500" />,
          label: "WS Connected (Live)",
          dotClass: "bg-emerald-500 animate-pulse",
          containerClass: "border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
        };
      case "reconnecting":
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />,
          label: "Reconnecting...",
          dotClass: "bg-amber-500 animate-ping",
          containerClass: "border-amber-200 bg-amber-50/70 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
        };
      case "connecting":
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />,
          label: "Connecting...",
          dotClass: "bg-blue-500",
          containerClass: "border-blue-200 bg-blue-50/70 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300",
        };
      case "stale":
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-orange-500" />,
          label: "Telemetry Stale (>2m)",
          dotClass: "bg-orange-500",
          containerClass: "border-orange-200 bg-orange-50/70 text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300",
        };
      case "disconnected":
      default:
        return {
          icon: <WifiOff className="w-3.5 h-3.5 text-slate-400" />,
          label: "Offline / Polling Fallback",
          dotClass: "bg-slate-400",
          containerClass: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
        };
    }
  };

  const config = getConfig();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium transition-all shadow-sm",
        config.containerClass,
        className
      )}
      title={`Live Stream Status: ${config.label}. Last update: ${lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}`}
    >
      <span className="flex items-center gap-1.5">
        <span className={cn("w-2 h-2 rounded-full", config.dotClass)} />
        {config.icon}
        <span className="font-semibold">{config.label}</span>
      </span>

      {showTime && lastUpdated && (
        <span className="text-[10px] opacity-75 border-l border-current/20 pl-1.5 font-mono">
          {timeAgo(lastUpdated)}
        </span>
      )}
    </div>
  );
}

