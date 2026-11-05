"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<"fadein" | "split" | "done">("fadein");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Clean up any legacy sessionStorage flag
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("streetair_splash_played");
      }
    } catch {
      // Ignore
    }

    const t1 = setTimeout(() => {
      setPhase("split");
    }, 1100);

    const t2 = setTimeout(() => {
      setPhase("done");
      onCompleteRef.current?.();
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []); // Empty array ensures it runs exactly once per page load and never duplicates on parent re-renders

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
        {/* 8 vertical panels — white, lifting up sequentially */}
        <div className="absolute inset-0 grid grid-cols-8 w-full h-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 0 }}
              animate={phase === "split" ? { y: "-100%" } : { y: 0 }}
              transition={{ duration: 0.85, delay: i * 0.05, ease: [0.65, 0, 0.35, 1] }}
              className="h-full bg-white border-r border-slate-100"
            />
          ))}
        </div>

        {/* Center: STREETAIR wordmark */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={
              phase === "fadein"
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: -16 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="font-sans font-bold text-3xl sm:text-4xl tracking-[0.22em] uppercase text-slate-900">
              STREET<span className="text-emerald-600">AIR</span>
            </h1>
            <p className="mt-3 text-[11px] font-medium tracking-[0.25em] uppercase text-slate-400">
              Environmental Intelligence
            </p>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
