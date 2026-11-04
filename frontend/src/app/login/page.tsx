"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Wind, Lock, Mail, ArrowRight, ShieldCheck, User } from "lucide-react";
import { UserRole } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push("/app");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole, targetRoute: string) => {
    switchDemoRole(role);
    router.push(targetRoute);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
            <Wind className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight">
            STREET<span className="text-brand-600 dark:text-brand-400">AIR</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Access your personal monitoring workspace, organisation portal, or command centre.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          {/* Quick Demo Evaluation Personas */}
          <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/20 text-xs">
            <span className="font-bold text-purple-900 dark:text-purple-300 block mb-2">
              🚀 Hackathon Fast-Evaluation Personas:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("citizen", "/app")}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-purple-500 transition shadow-xs"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Citizen User</span>
                <span className="text-[10px] text-slate-400">Reports & Alerts</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("org_admin", "/organisation/overview")}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-purple-500 transition shadow-xs"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Org Admin</span>
                <span className="text-[10px] text-slate-400">Crescent Institute</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("analyst", "/organisation/analytics")}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-purple-500 transition shadow-xs"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Env Analyst</span>
                <span className="text-[10px] text-slate-400">CPCB Trends</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("platform_admin", "/admin/command-centre")}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-purple-500 transition shadow-xs"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Platform Admin</span>
                <span className="text-[10px] text-slate-400">Command Centre</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@crescent.education"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              <span>{loading ? "Authenticating with Firebase..." : "Sign in to STREETAIR"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-brand-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

