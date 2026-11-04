"use client";

import React, { useState } from "react";
import { Settings, Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function UserSettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [aqiStandard, setAqiStandard] = useState("NAQI_INDIA");
  const [tempUnit, setTempUnit] = useState("CELSIUS");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Application Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize display units, color mode, and regulatory reporting standards.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        {/* Theme */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Color Theme Mode
            </span>
            <span className="text-[11px] text-slate-400">
              Toggle between light and high-contrast dark theme
            </span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
          >
            {theme === "dark" ? "Dark Mode Active" : "Light Mode Active"}
          </button>
        </div>

        {/* AQI Standard */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              AQI Standard Calculation
            </span>
            <span className="text-[11px] text-slate-400">
              Default standard used for category breakpoints
            </span>
          </div>
          <select
            value={aqiStandard}
            onChange={(e) => setAqiStandard(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
          >
            <option value="NAQI_INDIA">Indian NAQI (CPCB)</option>
            <option value="US_EPA">US EPA Standard</option>
            <option value="WHO_2021">WHO 2021 Guidelines</option>
          </select>
        </div>

        {/* Temperature Unit */}
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Temperature Unit
            </span>
            <span className="text-[11px] text-slate-400">Unit displayed on weather sensors</span>
          </div>
          <select
            value={tempUnit}
            onChange={(e) => setTempUnit(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
          >
            <option value="CELSIUS">Celsius (°C)</option>
            <option value="FAHRENHEIT">Fahrenheit (°F)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

