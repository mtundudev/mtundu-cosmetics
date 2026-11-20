export type NavLink = {
  href: string;
  label: string;
};

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Nyumbani" },
  { href: "/kuhusu", label: "Kuhusu Sisi" },
  { href: "/bidhaa", label: "Bidhaa" },
  { href: "/huduma", label: "Huduma" },
  { href: "/picha", label: "Picha" },
  { href: "/maoni", label: "Maoni" },
  { href: "/wasiliana", label: "Wasiliana Nasi" }
];

export const BRAND = {
  name: "Omega Cosmetics",
  tagline: "Urembo wa asili, ujasiri wa kila siku",
  phone: "+255625618209",
  whatsapp: "+255670320714",
  email: "Johnhandrick83@gmail.com",
  address: "Mwanjerwa, Mbeya"
};

export const BRAND_COLORS = {
  plum: "#3B1F2B",
  rose: {
    DEFAULT: "#C9788A",
    light: "#E8C6CC",
    dark: "#9C4F63"
  },
  gold: "#B08D57",
  cream: "#FBF6F1",
  charcoal: "#2B2320"
};

export const SHADE_TONES = [
  "#F4D9C6", // Fair Warm
  "#E7B996", // Golden Honey
  "#C98A5E", // Warm Almond
  "#9C6B45", // Caramel Chestnut
  "#6B4429", // Rich Espresso
  "#3B1F2B"  // Deep Velvet Plum
];
