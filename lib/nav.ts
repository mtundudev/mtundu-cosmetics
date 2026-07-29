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
  address: "Mwanjerwa,Mbeya"
};

export const SHADE_TONES = [
  "#F4D9C6",
  "#E7B996",
  "#C98A5E",
  "#9C6B45",
  "#6B4429",
  "#3B1F2B"
];
