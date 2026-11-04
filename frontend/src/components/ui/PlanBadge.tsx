import React from "react";
import { SubscriptionTier } from "@/lib/types";
import { Sparkles, Zap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  tier?: SubscriptionTier | string;
  size?: "sm" | "md";
  className?: string;
}

export function PlanBadge({ tier = "starter", size = "md", className }: PlanBadgeProps) {
  const getTier = () => {
    switch (tier?.toLowerCase()) {
      case "enterprise":
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-indigo-500" />,
          label: "ENTERPRISE",
          className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
        };
      case "professional":
        return {
          icon: <Zap className="w-3.5 h-3.5 text-emerald-500" />,
          label: "PROFESSIONAL",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        };
      case "starter":
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-slate-500" />,
          label: "STARTER",
          className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        };
    }
  };

  const t = getTier();
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono font-bold tracking-wider shadow-sm",
        t.className,
        sizeClasses,
        className
      )}
    >
      {t.icon}
      {t.label}
    </span>
  );
}

