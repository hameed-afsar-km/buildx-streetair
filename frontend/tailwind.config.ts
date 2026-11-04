import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Emerald & Cream Luxury Palette
        emerald: {
          950: "#061A16", // deepest forest
          900: "#0F3D34", // base deep emerald
          800: "#134E43", // rich secondary emerald
          700: "#1A6457", // mid emerald
          600: "#228070",
        },
        cream: {
          50: "#FAF9F5",  // bright pure silk cream
          100: "#F7F6F1", // ivory cream
          200: "#E6F0E9", // pale mint sage cream
          300: "#D3E2D8",
        },
        gold: {
          400: "#D6AF76",
          500: "#C8A96A", // warm champagne gold
          600: "#B59556",
          700: "#997C42",
        },
        // Environmental Intelligence Design Tokens
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#0F3D34",
          950: "#061A16",
        },
        aqi: {
          good: "#10B981",
          moderate: "#C8A96A",
          sensitive: "#F97316",
          unhealthy: "#EF4444",
          veryUnhealthy: "#8B5CF6",
          hazardous: "#881337",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif: ["Cinzel", "Playfair Display", "Georgia", "serif"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "spin-slow": "spin 45s linear infinite",
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
