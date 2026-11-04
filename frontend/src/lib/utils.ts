import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(val: number | undefined | null, decimals: number = 1): string {
  if (val === undefined || val === null || isNaN(val)) return "—";
  return val.toFixed(decimals);
}

export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  try {
    const d = typeof dateString === "string" ? new Date(dateString) : dateString;
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...options,
    });
  } catch {
    return String(dateString);
  }
}

export function formatTime(dateString: string | Date): string {
  try {
    const d = typeof dateString === "string" ? new Date(dateString) : dateString;
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString: string | Date): string {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

export function timeAgo(dateString: string | Date): string {
  try {
    const d = typeof dateString === "string" ? new Date(dateString) : dateString;
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 5) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "Unknown";
  }
}

