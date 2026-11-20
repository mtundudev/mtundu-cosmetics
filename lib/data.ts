export type Product = {
  slug: string;
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
  priceValue?: number;
  originalPriceValue?: number;
  discountPercent?: number;
};

export type Service = {
  title: string;
  description: string;
  title_en?: string;
  description_en?: string;
};

export const SERVICES: Service[] = [
  {
    title: "Ushauri wa Urembo",
    description:
      "Tunakusaidia kuchagua bidhaa zinazoendana na aina ya ngozi yako, rangi na mahitaji yako binafsi.",
    title_en: "Beauty Consultation",
    description_en: "We help you choose products that suit your skin type, complexion and personal needs."
  },
  {
    title: "Mapambo kwa Matukio",
    description:
      "Huduma ya mapambo ya uso kwa harusi, sherehe na vipindi vya picha na wataalamu wetu wa vipodozi.",
    title_en: "Event Makeup",
    description_en: "Professional makeup for weddings, celebrations and photo sessions."
  },
  {
    title: "Uwekaji Rangi ya Ngozi (Skin Matching)",
    description:
      "Tunalinganisha rangi sahihi ya foundation na concealer kabla ya kununua ili kuepuka makosa.",
    title_en: "Skin Matching",
    description_en: "We match the right foundation and concealer shades before you buy."
  },
  {
    title: "Uwasilishaji wa Haraka",
    description:
      "Agiza mtandaoni na tutakufikishia bidhaa zako popote ulipo Mbeya, Dar es Salaam na mikoa yote ya Tanzania.",
    title_en: "Fast Delivery",
    description_en: "Order online and have your products delivered across Tanzania."
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
      "Bidhaa za Omega Cosmetics zimebadilisha kabisa jinsi ngozi yangu inavyoonekana. Huduma yao ni ya haraka na ya uaminifu mkubwa."
  },
  {
    name: "Zainab R.",
    role: "Mmiliki wa Saluni",
    quote:
      "Naagiza bidhaa za saluni yangu kutoka Omega Cosmetics kila mwezi. Ubora wa bidhaa haujawahi kunikatisha tamaa hata mara moja."
  },
  {
    name: "Grace M.",
    role: "Mteja Mpya",
    quote:
      "Walinisaidia kuchagua rangi sahihi ya foundation mara ya kwanza. Sasa siwezi kununua bidhaa za vipodozi mahali pengine popote."
  }
];
