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
    description: "Foundation nyepesi yenye kufunika ngozi vizuri na mng'ao wa asili siku nzima.",
    image: "/products/pinterest.jpg"
  },
  {
    slug: "lipstick-matte",
    name: "Lipstick ya Matte",
    category: "Midomo",
    price: "TZS 15,000",
    description: "Rangi thabiti ya matte inayodumu hadi masaa 8 bila kukauka midomo.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80"
  },
 {
    slug: "skin lotion",
    name: "Lipstick ya Matte",
    category: "Ngozi",
    price: "TZS 15,000",
    description: "Rangi thabiti ya matte inayodumu hadi masaa 8 bila kukauka midomo.",
    image: "/products/hair.jpg"
  },
 {
    slug: "Skin care",
    name: "Lipstick ya Matte",
    category: "Ngozi",
    price: "TZS 15,000",
    description: "Rangi thabiti ya matte inayodumu hadi masaa 8 bila kukauka midomo.",
    image: "/products/Soft.jpg"
  },
 {
    slug: "Skin care",
    name: "perfumes",
    category: "Ngozi",
    price: "TZS 15,000",
    description: "Rangi thabiti ya matte inayodumu hadi masaa 8 bila kukauka midomo.",
    image: "/products/Skincares.jpg"
  },
 {
    slug: "lipstick-matte",
    name: "Lipstick ya Matte",
    category: "Midomo",
    price: "TZS 15,000",
    description: "Rangi thabiti ya matte inayodumu hadi masaa 8 bila kukauka midomo.",
    image: "/products/pinte.jpg"
  },
 {
    slug: "Serum",
    name: "skin care",
    category: "Midomo",
    price: "TZS 15,000",
    description: "Rangi thabiti ya matte inayodumu hadi masaa 8 bila kukauka midomo.",
    image: "/products/Product.jpg"
  },
  {
    slug: "serum-vitaminc",
    name: "Serum ya Vitamin C",
    category: "Utunzaji wa Ngozi",
    price: "TZS 32,000",
    description: "Husaidia kuondoa madoa na kuipa ngozi mng'ao wenye afya.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
  },
  {
    slug: "eyeshadow-palette",
    name: "Eyeshadow Palette",
    category: "Ngozi",
    price: "TZS 24,000",
    description: "Rangi 12 za kifahari zinazochanganyika kwa urahisi kwa mapambo ya kila siku au tukio maalum.",
    image: "/products/Bakina.jpg"
  },
     {
    slug: "eyeshadow-palette",
    name: "skin care",
    category: "Macho",
    price: "TZS 24,000",
    description: "Rangi 12 za kifahari zinazochanganyika kwa urahisi kwa mapambo ya kila siku au tukio maalum.",
    image: "/products/Skincare.jpg"
  },
  {
    slug: "eyeshadow-palette",
    name: "Eyeshadow Palette",
    category: "Macho",
    price: "TZS 24,000",
    description: "Rangi 12 za kifahari zinazochanganyika kwa urahisi kwa mapambo ya kila siku au tukio maalum.",
    image: "/products/Anti.jpg"
  },
  {
    slug: "eyeshadow-palette",
    name: "Eyeshadow Palette",
    category: "Ngozi laini",
    price: "TZS 24,000",
    description: "Rangi 12 za kifahari zinazochanganyika kwa urahisi kwa mapambo ya kila siku au tukio maalum.",
    image:"/products/Belleza.jpg"
  },
  {
    slug: "hair-oil",
    name: "Mafuta ya Nywele ya Asili",
    category: "Nywele",
    price: "TZS 18,000",
    description: "Mchanganyiko wa mafuta ya asili unaoimarisha nywele na kupunguza kukatika.",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80"
  },
  {
    slug: "sunscreen-spf50",
    name: "Sunscreen SPF 50",
    category: "Utunzaji wa Ngozi",
    price: "TZS 22,000",
    description: "Kinga imara dhidi ya jua bila kuacha ngozi na mafuta.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
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
    title: "Uwasilishaji wa Bidhaa Nyumbani",
    description:
      "Agiza mtandaoni na tutakufikishia bidhaa zako popote ulipo ndani ya Dar es Salaam na mikoa jirani."
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
    role: "Mteja wa Kudumu",
    quote:
      "Bidhaa za Nia Cosmetics zimebadilisha kabisa jinsi ngozi yangu inavyoonekana. Huduma yao ni ya haraka na ya kirafiki."
  },
  {
    name: "Zainab R.",
    role: "Mmiliki wa Saluni",
    quote:
      "Naagiza bidhaa za saluni yangu kutoka Nia Cosmetics kila mwezi. Ubora haujawahi kunikatisha tamaa."
  },
  {
    name: "Grace M.",
    role: "Mteja Mpya",
    quote:
      "Walinisaidia kuchagua rangi sahihi ya foundation mara ya kwanza. Sasa siwezi kununua mahali pengine."
  }
];
