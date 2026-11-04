import React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { RoleGuard } from "@/components/ui/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["platform_admin"]}>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          <DashboardHeader
            title="STREETAIR Central Command Centre"
            subtitle="Platform-wide sensor network telemetry, ingestion stream health, AI services, and moderation."
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}

