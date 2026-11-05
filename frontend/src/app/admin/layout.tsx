import React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { RoleGuard } from "@/components/ui/RoleGuard";
import { ESP32AlertProvider } from "@/lib/esp32AlertStore";
import { CitizenReportToast } from "@/components/ui/CitizenReportToast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["platform_admin", "analyst"]}>
      <ESP32AlertProvider>
        <CitizenReportToast />
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
            <DashboardHeader
              title="STREETAIR Admin Dashboard"
              subtitle="Environmental monitoring operations, incident investigation, device telemetry, and system management."
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      </ESP32AlertProvider>
    </RoleGuard>
  );
}
