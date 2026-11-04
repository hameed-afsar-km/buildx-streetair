"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<"fadein" | "split" | "done">("fadein");

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase("split");
    }, 1500);

    const t2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {/* 8 Vertical columns that lift upward sequentially */}
        <div className="absolute inset-0 grid grid-cols-8 w-full h-full">
          {Array.from({ length: 8 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ y: 0 }}
              animate={phase === "split" ? { y: "-100%" } : { y: 0 }}
              transition={{
                duration: 0.9,
                delay: index * 0.05,
                ease: [0.65, 0, 0.35, 1],
              }}
              className="h-full bg-emerald-950 border-r border-emerald-900/40 relative"
            >
              <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-gold-500/20 to-transparent" />
            </motion.div>
          ))}
        </div>

        {/* Center Title Splash Reveal: Purely STREETAIR */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              phase === "fadein"
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 1.12, y: -30 }
            }
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center px-4"
          >
            <h1 className="font-serif text-4xl sm:text-5xl text-cream-100 tracking-[0.3em] font-light">
              STREETAIR
            </h1>
            <div className="w-16 h-[1px] bg-gold-500/60 mx-auto mt-4" />
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
