import React from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Shield, Lock, FileText, AlertCircle } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Notice Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Demonstration Draft Notice:</strong> This privacy policy is a draft document prepared for the STREETAIR demonstration and hackathon evaluation. While it aligns with India’s Digital Personal Data Protection (DPDP) Act, 2023, it has not undergone formal corporate legal review.
          </span>
        </div>

        {/* Page Title */}
        <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-500 font-mono">
            Effective Date: November 1, 2026 · Version: 1.0 (India DPDP Act Compliant)
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Introduction & Scope
            </h2>
            <p>
              STREETAIR (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates an environmental intelligence platform providing real-time air quality monitoring, micro-sensor telemetry, and predictive analytics. This policy explains how personal and environmental data is handled across our web applications, public portals, citizen reporting tools, and enterprise dashboards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Data We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, work email address, institutional affiliation (e.g. Crescent Institute), and authentication tokens provided through Firebase Authentication.
              </li>
              <li>
                <strong>Citizen Community Reports:</strong> Approximate geographic coordinates, photo submissions, textual observations of smoke/dust/odour incidents, and optional citizen contact details.
              </li>
              <li>
                <strong>Telemetry & Device Diagnostics:</strong> Public environmental sensor readings (PM2.5, PM10, NO2, CO, Temperature, Humidity) emitted by hardware stations (e.g. ESP32 devices) or demonstration scenario engines.
              </li>
              <li>
                <strong>Log & Usage Data:</strong> Anonymized HTTP request logs, IP addresses, browser user agents, and feature usage counters for system reliability.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3. Purpose & Legal Basis for Processing
            </h2>
            <p>
              Under India&rsquo;s Digital Personal Data Protection Act, 2023 (DPDP Act), we process data for:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Delivering continuous environmental monitoring and public health notifications.</li>
              <li>Verifying crowd-sourced pollution incident reports for municipal action.</li>
              <li>Compiling regulatory CPCB/SPCB air quality compliance documents for enterprise tenants.</li>
              <li>Preventing denial-of-service attacks and ensuring operational stability.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              4. Simulated vs Live Hardware Telemetry Disclosure
            </h2>
            <p>
              STREETAIR clearly tags all readings as either <code>HARDWARE</code> (physical sensors), <code>SIMULATED</code> (scenario generator matrix), <code>HISTORICAL</code>, or <code>FORECAST</code>. Demonstration scenario data is explicitly quarantined from official regulatory filings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              5. Data Retention & Erasure
            </h2>
            <p>
              Raw second-by-second telemetry is retained for 30 to 90 days according to organization tier SLAs, after which data is downsampled into 1-hour rollup averages for long-term climate trend analysis. Users may request account deletion at any time by contacting{" "}
              <a href="mailto:privacy@streetair.in" className="text-emerald-600 dark:text-emerald-400 font-semibold underline">
                privacy@streetair.in
              </a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              6. Contact Information & Grievance Officer
            </h2>
            <p>
              In accordance with the Information Technology Act and DPDP Act 2023:
            </p>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                Data Protection & Grievance Officer
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                STREETAIR Environmental Intelligence Team
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                B.S. Abdur Rahman Crescent Institute of Science and Technology Campus
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                GST Road, Vandalur, Chennai – 600048, Tamil Nadu, India
              </p>
              <p className="font-mono text-emerald-600 dark:text-emerald-400 pt-1">
                privacy@streetair.in
              </p>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

