import React from "react";
import { AQI_SCALE } from "@/lib/aqi";

export function MapLegend() {
  const levels = Object.values(AQI_SCALE);

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-2">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 font-bold text-slate-800 dark:text-slate-200">
        <span>India National AQI Scale</span>
        <span className="text-[10px] text-slate-500 font-normal">NAQI (CPCB)</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {levels.map((lvl) => (
          <div key={lvl.category} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10"
              style={{ backgroundColor: lvl.color }}
            />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {lvl.category}
            </span>
            <span className="text-[10px] text-slate-400 font-mono ml-auto">
              {lvl.min}-{lvl.max}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 italic">
        * Heatmap overlay represents localized spatial interpolation (Estimated).
      </div>
    </div>
  );
}

