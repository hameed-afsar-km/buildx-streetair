"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export const InteractiveTitle: React.FC = () => {
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);
  const letters = "STREETAIR".split("");

  return (
    <div className="relative inline-block select-none cursor-default py-2">
      <motion.div
        className="flex items-center justify-center font-sans text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[0.12em] text-cream-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        {letters.map((char, index) => {
          const isHovered = hoveredLetter === index;
          const isNeighbor =
            hoveredLetter !== null && Math.abs(hoveredLetter - index) === 1;

          return (
            <motion.span
              key={index}
              onMouseEnter={() => setHoveredLetter(index)}
              onMouseLeave={() => setHoveredLetter(null)}
              animate={{
                y: isHovered ? -12 : isNeighbor ? -5 : 0,
                color: isHovered
                  ? "#C8A96A" // Gold 500
                  : isNeighbor
                  ? "#FAF9F5"
                  : "#F7F6F1",
                textShadow: isHovered
                  ? "0 0 35px rgba(200, 169, 106, 0.75), 0 0 10px rgba(200, 169, 106, 0.4)"
                  : "0 4px 24px rgba(0, 0, 0, 0.6)",
                scale: isHovered ? 1.08 : 1,
              }}
              transition={{ type: "spring", stiffness: 450, damping: 22 }}
              className="inline-block transition-colors duration-150"
            >
              {char}
            </motion.span>
          );
        })}
      </motion.div>

      {/* Decorative Gold hairline below title */}
      <motion.div
        className="w-32 sm:w-48 h-[1px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-4"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.8 }}
        transition={{ delay: 0.6, duration: 1 }}
      />
    </div>
  );
};

