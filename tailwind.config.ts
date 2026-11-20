import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FBF6F1",
          muted: "#F3ECE4"
        },
        plum: {
          DEFAULT: "#3B1F2B",
          dark: "#2A141E",
          light: "#522C3D"
        },
        rose: {
          DEFAULT: "#C9788A",
          light: "#E8C6CC",
          subtle: "#F6ECEE",
          dark: "#9C4F63"
        },
        gold: {
          DEFAULT: "#B08D57",
          light: "#C5A879",
          dark: "#8F6E3B"
        },
        charcoal: {
          DEFAULT: "#2B2320",
          muted: "#5A4D49"
        }
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"]
      },
      maxWidth: {
        content: "1200px"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        fadeUp: "fadeUp 0.7s ease-out forwards"
      }
    }
  },
  plugins: []
};

export default config;
