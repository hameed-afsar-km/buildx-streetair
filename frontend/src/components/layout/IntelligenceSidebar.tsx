"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  SearchCode,
  Clock,
  SlidersHorizontal,
  BookOpen,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function IntelligenceSidebar() {
  const pathname = usePathname();

  const links = [
    { label: "Intelligence Hub", href: "/intelligence", icon: <Sparkles className="w-4 h-4" /> },
    { label: "Pollution Detective", href: "/intelligence/pollution-detective", icon: <SearchCode className="w-4 h-4" /> },
    { label: "Pollution Time Machine", href: "/intelligence/time-machine", icon: <Clock className="w-4 h-4" /> },
    { label: "What-If City Simulator", href: "/intelligence/what-if", icon: <SlidersHorizontal className="w-4 h-4" /> },
    { label: "RAG Knowledge Explorer", href: "/intelligence/knowledge", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Environmental AI Chat", href: "/intelligence/chat", icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
            STREET<span className="text-purple-600 dark:text-purple-400">AI</span>
          </span>
          <span className="block text-[10px] text-slate-400 font-mono">Neural Intelligence</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300 px-3 py-1.5">
          Intelligence Capabilities
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition",
                isActive
                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* Return to Dashboard */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            <span>Return to Public Dashboard</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <Link
            href="/app"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            <span>My Citizen Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </nav>
    </aside>
  );
}

