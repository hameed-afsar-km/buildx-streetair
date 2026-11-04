"use client";

import React, { useState } from "react";
import { Settings, Bell, Globe, Key, ShieldCheck } from "lucide-react";

export default function OrgSettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.slack.com/services/T00/B00/XXXX");
  const [slaAlerts, setSlaAlerts] = useState(true);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Organisation & Compliance Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure automated webhook dispatch, SLA thresholds, and regulatory filing credentials.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        {/* Webhooks */}
        <div className="space-y-3">
          <label className="block font-bold text-slate-800 dark:text-slate-200">
            Emergency Webhook Endpoint (Slack / Microsoft Teams / Internal SIEM)
          </label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xs focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">
            Dispatches automated JSON payloads whenever any campus beacon triggers high/critical severity alerts.
          </p>
        </div>

        {/* SLA notifications */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            Automated Escalations
          </span>
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Escalate unresolved exceedances to Dean & Facility Director after 60 minutes
            </span>
            <input
              type="checkbox"
              checked={slaAlerts}
              onChange={(e) => setSlaAlerts(e.target.checked)}
              className="accent-indigo-600 w-4 h-4 rounded"
            />
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={() => alert("Organisation settings updated successfully.")}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
          >
            Save Organisation Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

