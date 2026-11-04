import React from "react";
import { getAQIClassification } from "@/lib/aqi";
import { ShieldCheck, AlertCircle, AlertTriangle, Flame, Skull, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AQIBadgeProps {
  aqi: number;
  size?: "sm" | "md" | "lg" | "xl";
  showCategory?: boolean;
  className?: string;
}

export function AQIBadge({ aqi, size = "md", showCategory = true, className }: AQIBadgeProps) {
  const classification = getAQIClassification(aqi);

  const getIcon = () => {
    if (aqi <= 50) return <ShieldCheck className="w-3.5 h-3.5" />;
    if (aqi <= 100) return <AlertCircle className="w-3.5 h-3.5" />;
    if (aqi <= 200) return <AlertTriangle className="w-3.5 h-3.5" />;
    if (aqi <= 300) return <Flame className="w-3.5 h-3.5" />;
    return <Skull className="w-3.5 h-3.5" />;
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold gap-1",
    md: "px-2.5 py-1 text-sm font-semibold gap-1.5",
    lg: "px-3.5 py-1.5 text-base font-bold gap-2",
    xl: "px-4 py-2 text-xl font-extrabold gap-2.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border transition-colors shadow-sm",
        classification.bgColor,
        classification.borderColor,
        classification.textColor,
        sizeClasses[size],
        className
      )}
      title={`AQI ${aqi}: ${classification.category} - ${classification.advisory}`}
    >
      {getIcon()}
      <span>AQI {aqi}</span>
      {showCategory && (
        <span className="opacity-90 font-medium">({classification.category})</span>
      )}
    </span>
  );
}

