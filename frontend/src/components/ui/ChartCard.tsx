import React from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  subtitle,
  action,
  children,
  footer,
  className,
}: ChartCardProps) {
  const desc = subtitle || description;
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col p-5",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          {desc && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {desc}
            </p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>

      <div className="flex-1 w-full min-h-[220px]">{children}</div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
}

