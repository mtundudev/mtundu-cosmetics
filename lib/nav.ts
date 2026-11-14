export type NavLink = {
  href: string;
  label: string;
};

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/kuhusu", label: "About us" },
  { href: "/bidhaa", label: "Products" },
  { href: "/huduma", label: "Services" },
  { href: "/picha", label: "Picture" },
  { href: "/maoni", label: "Comments" },
  { href: "/wasiliana", label: "Wasiliana Nasi" },
  { href: "/kikapu", label: "My Order" }
];

export const BRAND = {
  name: "Mtundu Cosmetics",
  tagline: "Urembo wa asili, ujasiri wa kila siku",
  phone: "+255 769752523",
  whatsapp: "+255769752523",
  email: "dottomtundu9@gmail.com",
  address: "Mwanjerwa, Mbeya",
  website: "https://mtunducosmetics.co.tz"
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
