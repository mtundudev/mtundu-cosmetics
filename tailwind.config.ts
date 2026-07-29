import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6F1",
        plum: "#3B1F2B",
        rose: {
          DEFAULT: "#C9788A",
          light: "#E8C6CC",
          dark: "#9C4F63"
        },
        gold: "#B08D57",
        charcoal: "#2B2320"
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
