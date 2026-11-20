/**
 * Omega Cosmetics - Brand Identity & Design System
 * --------------------------------------------------
 * Color Palette, Typography & Brand Styling Constants
 */

export const BRAND_COLORS = {
  // Primary Luxury Tone
  plum: {
    DEFAULT: "#3B1F2B",
    dark: "#2A141E",
    light: "#522C3D"
  },
  // Romantic & Soft Accent Tones
  rose: {
    DEFAULT: "#C9788A",
    light: "#E8C6CC",
    subtle: "#F6ECEE",
    dark: "#9C4F63"
  },
  // Prestige Metallic Accent
  gold: {
    DEFAULT: "#B08D57",
    light: "#C5A879",
    dark: "#8F6E3B"
  },
  // Silk Backgrounds & Neutral Canvases
  cream: {
    DEFAULT: "#FBF6F1",
    pure: "#FFFFFF",
    muted: "#F3ECE4"
  },
  // High-Contrast Deep Charcoal for Typography
  charcoal: {
    DEFAULT: "#2B2320",
    muted: "#5A4D49",
    light: "#847570"
  }
} as const;

/**
 * Signature Swatch Strip - Foundation & Skin Tone Range
 * Represents inclusivity for all African skin shades
 */
export const SHADE_PALETTE = [
  { name: "Fair Warm", hex: "#F4D9C6" },
  { name: "Golden Honey", hex: "#E7B996" },
  { name: "Warm Almond", hex: "#C98A5E" },
  { name: "Caramel Chestnut", hex: "#9C6B45" },
  { name: "Rich Espresso", hex: "#6B4429" },
  { name: "Deep Velvet Plum", hex: "#3B1F2B" }
] as const;

export const TYPOGRAPHY = {
  display: "var(--font-display), Fraunces, Georgia, serif",
  body: "var(--font-body), Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
} as const;
