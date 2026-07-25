import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        mist: "var(--mist)",
        foam: "var(--foam)",
        tide: "var(--tide)",
        ember: "var(--ember)",
        slate: "var(--slate)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(13, 148, 136, 0.18), 0 24px 60px rgba(15, 45, 56, 0.12)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        reveal: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        pulseBar: {
          "0%, 100%": { opacity: "0.45", transform: "scaleY(0.7)" },
          "50%": { opacity: "1", transform: "scaleY(1)" },
        },
      },
      animation: {
        drift: "drift 7s ease-in-out infinite",
        reveal: "reveal 0.8s ease-out both",
        shimmer: "shimmer 4s linear infinite",
        pulseBar: "pulseBar 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
