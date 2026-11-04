import React from "react";
import { UserSidebar } from "@/components/layout/UserSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function UserAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <UserSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Citizen Environmental Portal"
          subtitle="Hyperlocal monitoring, personal alerts, and verified community pollution reporting."
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

