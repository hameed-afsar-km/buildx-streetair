"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ShieldCheck, Menu, X } from "lucide-react";
import { useDashboardTransition } from "@/components/ui/DashboardTransition";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Pollution Map", href: "/map" },
  { label: "AI Assistant", href: "/intelligence/chat" },
];

export const PillNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { navigateWithReveal, Overlay } = useDashboardTransition();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {Overlay}

      <div className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.nav
          initial={{ y: -24, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            width: scrolled ? "min(94vw, 900px)" : "min(88vw, 760px)",
          }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="pointer-events-auto"
        >
          {/* Pill */}
          <div
            className={[
              "relative flex items-center justify-between gap-4 px-5 py-2.5 rounded-full",
              "border transition-all duration-500",
              scrolled
                ? "border-slate-200 bg-white/95 shadow-[0_4px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl"
                : "border-slate-200/70 bg-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-lg",
            ].join(" ")}
          >
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2 shrink-0 select-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-50" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="font-sans font-semibold text-sm tracking-[0.16em] uppercase text-slate-800 group-hover:text-emerald-700 transition-colors duration-200">
                STREETAIR
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden sm:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="px-3.5 py-1.5 rounded-full font-sans text-[12px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* CTAs */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigateWithReveal("/admin", "Admin Command Console")}
                className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-sans text-[12px] font-medium text-slate-500 border border-slate-200 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 opacity-80" />
                Admin
              </button>

              <button
                onClick={() => navigateWithReveal("/dashboard", "Public Live Dashboard")}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-sans text-[12px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-sm shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-200 cursor-pointer"
              >
                Live
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="sm:hidden ml-auto text-slate-500 hover:text-slate-800 transition-colors p-1"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile dropdown */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="mt-1 mx-1 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
              >
                <div className="flex flex-col px-3 py-3 gap-0.5">
                  {NAV_LINKS.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 rounded-xl font-sans text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-150"
                    >
                      {label}
                    </Link>
                  ))}

                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      onClick={() => { setMobileOpen(false); navigateWithReveal("/dashboard", "Public Dashboard"); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white font-sans text-sm font-semibold cursor-pointer hover:bg-emerald-700 transition-colors"
                    >
                      Public Live <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigateWithReveal("/admin", "Admin Console"); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-sans text-sm font-medium cursor-pointer hover:bg-slate-50 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Admin
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
    </>
  );
};
