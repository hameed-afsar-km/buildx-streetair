"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export const InteractiveTitle: React.FC = () => {
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);
  const streetLetters = "STREET".split("");
  const airLetters = "AIR".split("");

  return (
    <div className="relative inline-block select-none cursor-default py-2">
      <motion.div
        className="flex items-center justify-center font-sans text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[0.14em]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        {/* STREET - Dark Slate with spring hover */}
        {streetLetters.map((char, index) => {
          const isHovered = hoveredLetter === index;
          const isNeighbor =
            hoveredLetter !== null && Math.abs(hoveredLetter - index) === 1;

          return (
            <motion.span
              key={`street-${index}`}
              onMouseEnter={() => setHoveredLetter(index)}
              onMouseLeave={() => setHoveredLetter(null)}
              animate={{
                y: isHovered ? -12 : isNeighbor ? -5 : 0,
                color: isHovered
                  ? "#059669"
                  : isNeighbor
                  ? "#1e293b"
                  : "#0f172a",
                scale: isHovered ? 1.08 : 1,
              }}
              transition={{ type: "spring", stiffness: 450, damping: 22 }}
              className="inline-block transition-transform duration-150"
            >
              {char}
            </motion.span>
          );
        })}

        {/* AIR - Continuous Theme Gradient Looping Animation */}
        <span className="gradient-air inline-flex ml-[0.02em]">
          {airLetters.map((char, i) => {
            const index = 6 + i;
            const isHovered = hoveredLetter === index;
            const isNeighbor =
              hoveredLetter !== null && Math.abs(hoveredLetter - index) === 1;

            return (
              <motion.span
                key={`air-${i}`}
                onMouseEnter={() => setHoveredLetter(index)}
                onMouseLeave={() => setHoveredLetter(null)}
                animate={{
                  y: isHovered ? -12 : isNeighbor ? -5 : 0,
                  scale: isHovered ? 1.08 : 1,
                  filter: isHovered
                    ? "drop-shadow(0 0 24px rgba(16, 185, 129, 0.75))"
                    : "none",
                }}
                transition={{ type: "spring", stiffness: 450, damping: 22 }}
                className="inline-block transition-transform duration-150"
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      </motion.div>

      {/* Modern Emerald hairline accent below title */}
      <motion.div
        className="w-28 sm:w-44 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto mt-4"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.8 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      />
    </div>
  );
};
