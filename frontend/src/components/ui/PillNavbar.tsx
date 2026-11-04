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

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {Overlay}

      {/* ── Desktop Pill ─────────────────────────────────────────────── */}
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
          {/* Glass pill container */}
          <div
            className={[
              "relative flex items-center justify-between gap-4 px-5 py-2.5 rounded-full",
              "border transition-all duration-500",
              scrolled
                ? "border-gold-500/20 bg-emerald-950/92 backdrop-blur-2xl shadow-[0_8px_32px_rgba(6,26,22,0.72)]"
                : "border-emerald-800/40 bg-emerald-950/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(6,26,22,0.5)]",
            ].join(" ")}
          >
            {/* ── Logo ───── */}
            <Link
              href="/"
              className="group flex items-center gap-2 shrink-0 select-none"
            >
              {/* Animated dot */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500" />
              </span>
              <span
                className={[
                  "font-sans font-semibold text-sm tracking-[0.18em] uppercase",
                  "text-cream-100 group-hover:text-gold-400 transition-colors duration-200",
                ].join(" ")}
              >
                STREETAIR
              </span>
            </Link>

            {/* ── Nav Links (desktop) ───── */}
            <div className="hidden sm:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className={[
                    "relative px-3.5 py-1.5 rounded-full",
                    "font-sans text-[11.5px] font-medium tracking-wide",
                    "text-cream-200/60 hover:text-cream-100",
                    "hover:bg-emerald-800/40 transition-all duration-200",
                  ].join(" ")}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* ── CTAs ───── */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigateWithReveal("/admin", "Admin Command Console")}
                className={[
                  "group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full",
                  "font-sans text-[11.5px] font-medium tracking-wide",
                  "text-cream-200/55 border border-emerald-700/50",
                  "hover:text-cream-100 hover:border-gold-500/35 hover:bg-emerald-800/30",
                  "transition-all duration-200 cursor-pointer",
                ].join(" ")}
              >
                <ShieldCheck className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                Admin
              </button>

              <button
                onClick={() => navigateWithReveal("/dashboard", "Public Live Dashboard")}
                className={[
                  "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full",
                  "font-sans text-[11.5px] font-semibold tracking-wide",
                  "bg-gold-500 text-emerald-950",
                  "hover:bg-gold-400 active:scale-95",
                  "shadow-[0_0_16px_rgba(200,169,106,0.25)]",
                  "hover:shadow-[0_0_22px_rgba(200,169,106,0.4)]",
                  "transition-all duration-200 cursor-pointer",
                ].join(" ")}
              >
                Live
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ── Hamburger (mobile) ───── */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="sm:hidden ml-auto text-cream-200/70 hover:text-cream-100 transition-colors p-1"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* ── Mobile Dropdown ───── */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={[
                  "mt-2 mx-1 rounded-2xl overflow-hidden",
                  "border border-emerald-800/50 bg-emerald-950/95 backdrop-blur-2xl",
                  "shadow-[0_12px_40px_rgba(6,26,22,0.8)]",
                ].join(" ")}
              >
                <div className="flex flex-col px-4 py-4 gap-1">
                  {NAV_LINKS.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        "px-3 py-2.5 rounded-xl",
                        "font-sans text-sm font-medium tracking-wide",
                        "text-cream-200/70 hover:text-cream-100 hover:bg-emerald-800/40",
                        "transition-all duration-150",
                      ].join(" ")}
                    >
                      {label}
                    </Link>
                  ))}

                  <div className="mt-3 pt-3 border-t border-emerald-800/40 flex flex-col gap-2">
                    <button
                      onClick={() => { setMobileOpen(false); navigateWithReveal("/dashboard", "Public Live Dashboard"); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold-500 text-emerald-950 font-sans text-sm font-semibold tracking-wide cursor-pointer"
                    >
                      Public Live <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigateWithReveal("/admin", "Admin Command Console"); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-700/50 text-cream-200/70 font-sans text-sm font-medium tracking-wide cursor-pointer hover:border-gold-500/30 hover:text-cream-100 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" /> Admin
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
