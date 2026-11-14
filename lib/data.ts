export type Product = {
  slug: string;
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: "foundation-glow",
    name: "Foundation ya Glow",
    category: "Uso",
    price: "TZS 28,000",
    description: "Foundation nyepesi yenye kufunika ngozi vizuri na kutoa mng'ao wa asili siku nzima.",
    image: "/products/pinterest.jpg"
  },
  {
    slug: "lipstick-matte-luxury",
    name: "Lipstick ya Matte ya Kifahari",
    category: "Midomo",
    price: "TZS 15,000",
    description: "Rangi thabiti ya matte inayodumu hadi masaa 8 bila kukauka wala kupasua midomo.",
    image: "/products/pinte.jpg"
  },
  {
    slug: "skin-lotion-soft",
    name: "Lotion Laini ya Mwili",
    category: "Ngozi",
    price: "TZS 20,000",
    description: "Hulainisha ngozi kavu, kurutubisha na kuacha harufu nzuri ya asili siku nzima.",
    image: "/products/Soft.jpg"
  },
  {
    slug: "hair-care-oil",
    name: "Mafuta ya Asili ya Nywele",
    category: "Nywele",
    price: "TZS 18,000",
    description: "Mchanganyiko wa mafuta asilia unaokuza nywele, kuzuia kukatika na kuleta unyevu.",
    image: "/products/hair.jpg"
  },
  {
    slug: "luxury-perfume",
    name: "Perfume ya Kifahari ya Mtundu",
    category: "Manukato",
    price: "TZS 35,000",
    description: "Manukato yenye mvuto na harufu inayodumu muda mrefu kwa hafla yoyote.",
    image: "/products/Skincares.jpg"
  },
  {
    slug: "serum-vitaminc-glow",
    name: "Serum ya Vitamin C & Glow",
    category: "Ngozi",
    price: "TZS 32,000",
    description: "Husaidia kuondoa madoa sugu, kusawazisha rangi ya ngozi na kuongeza mng'ao.",
    image: "/products/Product.jpg"
  },
  {
    slug: "eyeshadow-palette-deluxe",
    name: "Eyeshadow Palette ya Rangi 12",
    category: "Macho",
    price: "TZS 24,000",
    description: "Rangi 12 za kifahari zinazochanganyika kwa urahisi kwa mapambo ya kila siku au harusi.",
    image: "/products/Bakina.jpg"
  },
  {
    slug: "complete-skincare-set",
    name: "Seti Kamili ya Utunzaji wa Ngozi",
    category: "Ngozi",
    price: "TZS 45,000",
    description: "Seti inayojumuisha cleanser, toner na moisturizer kwa ngozi yenye afya na mng'ao.",
    image: "/products/Skincare.jpg"
  },
  {
    slug: "anti-aging-face-cream",
    name: "Cream ya Kuzuia Mikunjo (Anti-Aging)",
    category: "Uso",
    price: "TZS 30,000",
    description: "Inarutubisha seli za uso na kupunguza mistari ya uzee kwa ngozi nyororo.",
    image: "/products/Anti.jpg"
  },
  {
    slug: "belleza-moisturizer",
    name: "Moisturizer ya Ngozi Laini",
    category: "Ngozi",
    price: "TZS 22,000",
    description: "Mchanganyiko mwepesi unaopenya kwa haraka bila kuacha utelezi au mafuta mengi.",
    image: "/products/Belleza.jpg"
  },
  {
    slug: "compact-powder-matte",
    name: "Compact Powder ya Asili",
    category: "Uso",
    price: "TZS 18,000",
    description: "Inadhibiti mafuta usoni na kutoa mwonekano wa kuvutia usio na kuteleza.",
    image: "/products/get.jpg"
  },
  {
    slug: "lip-gloss-shine",
    name: "Lip Gloss ya Kung'arisha Midomo",
    category: "Midomo",
    price: "TZS 12,000",
    description: "Inaleta unyevu wa kina na mng'ao wa glasi wenye kupendeza bila kunata.",
    image: "/products/f.jpg"
  },
  {
    slug: "gentle-face-cleanser",
    name: "Sabuni ya Asili ya Kusafisha Uso",
    category: "Ngozi",
    price: "TZS 16,000",
    description: "Huondoa uchafu wote na mabaki ya vipodozi bila kukausha unyevu wa ngozi.",
    image: "/products/my.jpg"
  },
  {
    slug: "sunscreen-spf50-shield",
    name: "Sunscreen SPF 50 ya Asili",
    category: "Ngozi",
    price: "TZS 25,000",
    description: "Kinga thabiti dhidi ya miale mikali ya jua (UVA/UVB) isiyoacha madoa meupe.",
    image: "/products/Kuzeyhidayet25___Freepik.jpg"
  },
  {
    slug: "concealer-pro-cover",
    name: "Concealer ya Kufunika Madoa",
    category: "Uso",
    price: "TZS 20,000",
    description: "Huficha duru za giza chini ya macho na madoa yote kwa umaridadi wa asili.",
    image: "/products/makeup_artist_model.jpg"
  },
  {
    slug: "makeup-artist-collection",
    name: "Mkusanyiko Maalum wa Mapambo",
    category: "Uso",
    price: "TZS 55,000",
    description: "Mkusanyiko kamili wa bidhaa za urembo kwa wataalamu wa makeup na matukio maalum.",
    image: "/products/Aesthetic_Makeup_Collection_Flatlay.jpg"
  }
];

export type Service = {
  title: string;
  description: string;
};

export const SERVICES: Service[] = [
  {
    title: "Ushauri wa Urembo",
    description:
      "Tunakusaidia kuchagua bidhaa zinazoendana na aina ya ngozi yako, rangi na mahitaji yako binafsi."
  },
  {
    title: "Mapambo kwa Matukio",
    description:
      "Huduma ya mapambo ya uso kwa harusi, sherehe na vipindi vya picha na wataalamu wetu wa vipodozi."
  },
  {
    title: "Uwekaji Rangi ya Ngozi (Skin Matching)",
    description:
      "Tunalinganisha rangi sahihi ya foundation na concealer kabla ya kununua ili kuepuka makosa."
  },
  {
    title: "Uwasilishaji wa Haraka",
    description:
      "Agiza mtandaoni na tutakufikishia bidhaa zako popote ulipo Mbeya, Dar es Salaam na mikoa yote ya Tanzania."
  }
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Amina J.",
    role: "Mteja wa Kudumu - Mbeya",
    quote:
      "Bidhaa za Mtundu Cosmetics zimebadilisha kabisa jinsi ngozi yangu inavyoonekana. Huduma yao ni ya haraka na ya uaminifu mkubwa."
  },
  {
    name: "Zainab R.",
    role: "Mmiliki wa Saluni",
    quote:
      "Naagiza bidhaa za saluni yangu kutoka Mtundu Cosmetics kila mwezi. Ubora wa bidhaa haujawahi kunikatisha tamaa hata mara moja."
  },
  {
    name: "Grace M.",
    role: "Mteja Mpya",
    quote:
      "Walinisaidia kuchagua rangi sahihi ya foundation mara ya kwanza. Sasa siwezi kununua bidhaa za vipodozi mahali pengine popote."
  }
];
