"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassRevealStreetAir } from "@/components/ui/liquid-glass-logo-reveal";

interface RouteTransitionOverlayProps {
  isTransitioning: boolean;
  destinationHref: string;
}

export function RouteTransitionOverlay({
  isTransitioning,
}: RouteTransitionOverlayProps) {
  if (!isTransitioning) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white"
      >
        {/* Pure STREETAIR Liquid Glass Logo Reveal in Light Theme */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <GlassRevealStreetAir
            className="w-full h-full rounded-3xl"
            look="light"
            background="#ffffff"
            plateColor="#f8fafc"
            logoColor="#0f172a"
            speed={1.5}
            hold={0.4}
            loop={false}
          />
        </div>

        {/* Small subtle tagline below */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex items-center gap-2 mt-4"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium tracking-widest text-slate-400 uppercase">
            Scanning environmental data...
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook to trigger liquid glass logo reveal transition before routing
 */
export function useDashboardTransition() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetHref, setTargetHref] = useState("");

  const navigateWithReveal = (href: string, _title?: string) => {
    setTargetHref(href);
    setIsTransitioning(true);
    // Allow the liquid glass reveal animation to play smoothly
    setTimeout(() => {
      router.push(href);
    }, 1500);
  };

  return {
    isTransitioning,
    navigateWithReveal,
    Overlay: (
      <RouteTransitionOverlay
        isTransitioning={isTransitioning}
        destinationHref={targetHref}
      />
    ),
  };
}
