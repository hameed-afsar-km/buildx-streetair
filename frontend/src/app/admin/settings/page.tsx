"use client";

import React, { useState } from "react";
import { Settings, Shield, Sliders, Database, Bell, Key, Save, Check } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "standards" | "retention" | "security">("general");
  const [saved, setSaved] = useState(false);

  // Form states
  const [platformName, setPlatformName] = useState("STREETAIR Environmental Intelligence");
  const [contactEmail, setContactEmail] = useState("ops@streetair.in");
  const [primaryCoordinates, setPrimaryCoordinates] = useState("12.8797, 80.0833");
  const [aqiStandard, setAqiStandard] = useState("NAQI_INDIA");
  const [retentionDays, setRetentionDays] = useState(90);
  const [mfaRequired, setMfaRequired] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("60");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-900 dark:text-white transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              System Configuration & Environmental Standards
            </span>
          </div>
          <h1 className="text-2xl font-black">Platform & Global System Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure Indian NAQI calculation parameters, TimescaleDB retention windows, and tenant security defaults.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Settings Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "general"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sliders className="w-4 h-4" />
            General Platform
          </button>

          <button
            onClick={() => setActiveTab("standards")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "standards"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" />
            AQI & CPCB Standards
          </button>

          <button
            onClick={() => setActiveTab("retention")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "retention"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Database className="w-4 h-4" />
            Data Retention
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "security"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" />
            Security & Authentication
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="md:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors/70 p-6 space-y-6">
          {activeTab === "general" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
                General Configuration
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Platform Title</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Operations Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Primary Demonstration Coordinates (Crescent Institute)
                </label>
                <input
                  type="text"
                  value={primaryCoordinates}
                  onChange={(e) => setPrimaryCoordinates(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-slate-600"
                />
                <p className="text-[11px] text-slate-400">
                  Used as default center for spatial interpolation and clean-air navigation routing.
                </p>
              </div>
            </div>
          )}

          {activeTab === "standards" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
                Air Quality Indices & Regulatory Thresholds
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active AQI Standard</label>
                <select
                  value={aqiStandard}
                  onChange={(e) => setAqiStandard(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="NAQI_INDIA">Indian National AQI (CPCB 6-Category Standard - Active)</option>
                  <option value="US_EPA">US EPA Air Quality Index (0-500 scale)</option>
                  <option value="WHO_2021">WHO 2021 Global Air Quality Guidelines</option>
                </select>
                <p className="text-[11px] text-emerald-400 mt-1">
                  âœ“ Configured for Crescent Institute / Tamil Nadu CPCB regional compliance.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">CPCB 24-Hour Permissible Limits:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-400 font-mono text-[11px]">
                  <div>PM2.5: 60 Âµg/m³</div>
                  <div>PM10: 100 Âµg/m³</div>
                  <div>NO2: 80 Âµg/m³</div>
                  <div>SO2: 80 Âµg/m³</div>
                  <div>CO: 4 mg/m³</div>
                  <div>O3: 100 Âµg/m³</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "retention" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
                Telemetry Retention & Storage Compaction
              </h2>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Raw Sensor Retention Window</label>
                  <span className="font-mono text-emerald-400 font-bold">{retentionDays} Days</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="365"
                  step="30"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  Raw 1-second ESP32 readings are downsampled to 1-hour rollup aggregates after {retentionDays} days to preserve storage bandwidth.
                </p>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
                Platform Security & Session Rules
              </h2>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Enforce MFA for Organization Admins</div>
                  <div className="text-[11px] text-slate-400">
                    Requires TOTP or WebAuthn hardware key for role elevation.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={mfaRequired}
                  onChange={(e) => setMfaRequired(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Session Inactivity Timeout</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="240">4 Hours</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




