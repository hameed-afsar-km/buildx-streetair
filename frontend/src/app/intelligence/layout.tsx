import React from "react";
import { IntelligenceSidebar } from "@/components/layout/IntelligenceSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function IntelligenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <IntelligenceSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Environmental Intelligence & Simulation Suite"
          subtitle="AI anomaly detection, spatial-temporal time machine, what-if policy forecasting, and RAG knowledge."
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

