"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassRevealStreetAir } from "@/components/ui/liquid-glass-logo-reveal";

interface RouteTransitionOverlayProps {
  isTransitioning: boolean;
  destinationTitle: string;
}

export function RouteTransitionOverlay({
  isTransitioning,
  destinationTitle,
}: RouteTransitionOverlayProps) {
  if (!isTransitioning) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-950/95 backdrop-blur-2xl"
      >
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* Liquid Glass Reveal Animation with STREETAIR Logo */}
          <GlassRevealStreetAir
            className="w-full h-full rounded-3xl shadow-2xl border border-gold-500/20"
            background="#061A16"
            plateColor="#0F3D34"
            logoColor="#C8A96A"
            speed={1.4}
            hold={0.5}
            loop={false}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-center mt-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping" />
            <span className="text-[11px] font-mono tracking-[0.25em] text-gold-500 uppercase">
              Connecting
            </span>
          </div>
          <h3 className="font-serif text-lg tracking-wider text-cream-100">
            {destinationTitle}
          </h3>
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
  const [targetTitle, setTargetTitle] = useState("");

  const navigateWithReveal = (href: string, title: string) => {
    setTargetTitle(title);
    setIsTransitioning(true);
    // Allow the liquid glass mark to form and reveal before pushing the route
    setTimeout(() => {
      router.push(href);
    }, 1500);
  };

  return {
    isTransitioning,
    targetTitle,
    navigateWithReveal,
    Overlay: (
      <RouteTransitionOverlay
        isTransitioning={isTransitioning}
        destinationTitle={targetTitle}
      />
    ),
  };
}

