"use client";

import React, { useState } from "react";
import { Bell, ShieldCheck, Mail, Smartphone, Sliders } from "lucide-react";

export default function UserAlertsPage() {
  const [aqiThreshold, setAqiThreshold] = useState(100);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Personal Environmental Alert Rules
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure notifications when particulate or gas concentrations exceed your personal thresholds.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        {/* Threshold Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-900 dark:text-white">
              Trigger Alert When AQI Exceeds:
            </label>
            <span className="font-mono font-bold text-sm text-brand-600 dark:text-brand-400">
              AQI {aqiThreshold}
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={300}
            step={10}
            value={aqiThreshold}
            onChange={(e) => setAqiThreshold(+e.target.value)}
            className="w-full accent-brand-600"
          />
          <p className="text-[11px] text-slate-400">
            Recommended: 100 for sensitive individuals (asthma/elderly), 150 for general public.
          </p>
        </div>

        {/* Channels */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="font-bold text-slate-900 dark:text-white block">
            Dispatch Channels
          </span>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
            <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
              <Mail className="w-4 h-4 text-brand-600" />
              Email Advisory Alerts
            </span>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="accent-brand-600 w-4 h-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
            <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
              <Smartphone className="w-4 h-4 text-brand-600" />
              Instant SMS Emergency Alert
            </span>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="accent-brand-600 w-4 h-4 rounded"
            />
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={() => alert("Preferences saved to profile.")}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition"
          >
            Save Notification Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

