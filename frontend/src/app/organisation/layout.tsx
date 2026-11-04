import React from "react";
import { OrgSidebar } from "@/components/layout/OrgSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { RoleGuard } from "@/components/ui/RoleGuard";

export default function OrganisationLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["org_admin", "analyst", "platform_admin"]}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <OrgSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader
            title="Organisation Environmental Workspace"
            subtitle="Campus & industrial facility telemetry, CPCB compliance, and incident resolution."
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}

