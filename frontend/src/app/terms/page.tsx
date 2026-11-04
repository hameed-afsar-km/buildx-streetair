import React from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { AlertCircle, Scale, FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Notice Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Demonstration Draft Notice:</strong> These Terms of Service are a draft prepared for the STREETAIR demonstration and hackathon evaluation. They reflect standard environmental SaaS governance terms but have not been formally finalized by legal counsel.
          </span>
        </div>

        {/* Page Title */}
        <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Terms of Service</h1>
          <p className="text-xs text-slate-500 font-mono">
            Last Updated: November 1, 2026 · Jurisdiction: Chennai, Tamil Nadu, India
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the STREETAIR web application, API endpoints, hardware telemetry streams, or mobile interfaces, you agree to be bound by these Terms of Service. If you are entering into these terms on behalf of a university, municipality, or corporation, you represent that you possess appropriate authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Description of the Service
            </h2>
            <p>
              STREETAIR is an AI-powered environmental intelligence platform providing:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Continuous micro-sensor telemetry ingestion and Indian NAQI indexing.</li>
              <li>Neural anomaly detection and source apportionment (&ldquo;Pollution Detective&rdquo;).</li>
              <li>Atmospheric dispersion time-machine playback and policy &ldquo;What-If&rdquo; simulations.</li>
              <li>Citizen crowd-sourced environmental reporting and audit reporting tools.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-3 text-rose-900 dark:text-rose-200">
              <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-rose-700 dark:text-rose-300">
                <Scale className="w-5 h-5" />
                3. Non-Certified Environmental Data & Safety Disclaimer
              </h2>
              <p className="font-medium text-xs leading-relaxed">
                IMPORTANT: Environmental readings and indices displayed on STREETAIR—including data received from simulated hardware keypad matrices, optical particle counters, and electrochemical sensors—are indicative measurements intended for research, awareness, and operational guidance. They do NOT replace certified Continuous Ambient Air Quality Monitoring Stations (CAAQMS) operated by the Central Pollution Control Board (CPCB) or State Pollution Control Boards.
              </p>
              <p className="text-xs leading-relaxed">
                STREETAIR readings must not be used as the sole basis for life-safety evacuations, legal evidence in administrative tribunals, or emergency medical triage without independent verification.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              4. Community Crowd-Sourced Reporting
            </h2>
            <p>
              Users submitting pollution incident reports agree to submit accurate, non-fraudulent observations. Submitting knowingly defamatory, falsified, or abusive reports is grounds for permanent account termination and IP blacklisting.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              5. Intellectual Property & Academic Research
            </h2>
            <p>
              Aggregated open environmental data generated by the Crescent Institute demonstration station is made available for public education and academic research under open data principles, while the STREETAIR platform architecture, ML pipeline weights, and proprietary UI components remain the exclusive intellectual property of STREETAIR.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              6. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts situated in Chennai, Tamil Nadu, India.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              7. Legal Inquiries
            </h2>
            <p>
              For legal inquiries or corporate contracts, contact our legal counsel at:{" "}
              <a href="mailto:legal@streetair.in" className="text-emerald-600 dark:text-emerald-400 font-semibold underline">
                legal@streetair.in
              </a>.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

