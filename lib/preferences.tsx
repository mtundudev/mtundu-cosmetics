"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

export type Language = "sw" | "en";
export type Theme = "light" | "dark";

const translations = {
  "nav.home": ["Nyumbani", "Home"],
  "nav.about": ["Kuhusu Sisi", "About Us"],
  "nav.products": ["Bidhaa", "Products"],
  "nav.services": ["Huduma", "Services"],
  "nav.gallery": ["Picha", "Gallery"],
  "nav.reviews": ["Maoni", "Reviews"],
  "nav.contact": ["Wasiliana Nasi", "Contact Us"],
  "action.switchLanguage": ["Badili lugha", "Switch language"],
  "action.switchTheme": ["Badili mwonekano", "Switch theme"],
  "theme.roseVelvet": ["Rose Velvet", "Rose Velvet"],
  "theme.classic": ["Mandhari ya kawaida", "Classic theme"],
  "action.contact": ["Wasiliana Nasi", "Contact Us"],
  "action.addToCart": ["Ongeza kwenye Oda", "Add to Order"],
  "action.addedToCart": ["Imeongezwa kwenye Oda ✓", "Added to order ✓"],
  "action.proceedToOrder": ["Kamilisha oda", "Proceed to order"],
  "page.shopEyebrow": ["Duka Letu", "Our Store"],
  "page.shopTitle": ["Bidhaa Zetu", "Our Products"],
  "page.shopDescription": ["Chagua kutoka kategoria mbalimbali za bidhaa za urembo zilizothibitishwa kuwa bora.", "Choose from a range of quality-checked beauty products."],
  "page.homeEyebrow": ["Duka la Vipodozi la Kuaminika", "Your Trusted Cosmetics Store"],
  "page.homeTitle": ["Kila rangi ina hadithi yake — chagua inayokufaa.", "Every shade tells a story — find the one that is yours."],
  "page.homeDescription": ["inakuletea bidhaa bora za urembo, utunzaji wa ngozi na nywele, zilizochaguliwa kwa makini kwa ngozi za Kiafrika.", "brings you carefully selected beauty, skincare and haircare products made for African skin."],
  "page.featuredEyebrow": ["Vipendwa Zaidi", "Customer Favourites"],
  "page.featuredTitle": ["Bidhaa Zinazopendwa na Wateja", "Products Our Customers Love"],
  "page.featuredDescription": ["Chaguo bora zaidi kutoka kwenye mkusanyiko wetu wa vipodozi na utunzaji wa ngozi.", "Top picks from our cosmetics and skincare collection."],
  "page.servicesTitle": ["Huduma Zetu", "Our Services"],
  "page.contactTitle": ["Wasiliana Nasi", "Contact Us"],
  "page.contactDescription": ["Una swali kuhusu bidhaa au unahitaji ushauri wa urembo? Jaza fomu hapa chini au tumia mawasiliano yetu ya moja kwa moja.", "Have a question about a product or need beauty advice? Send us a message or use our contact details."],
  "page.leaveReview": ["Acha Maoni Yako", "Leave a Review"],
  "page.reviewModeration": ["Maoni yako yataonekana hapa baada ya kupitiwa na timu yetu.", "Your review will appear here after it has been approved by our team."],
  "page.customerVoices": ["Sauti za Wateja", "Customer Voices"],
  "page.reviewDescription": ["Soma uzoefu wa wateja wetu, au acha maoni yako mwenyewe hapa chini.", "Read our customers' experiences, or leave your own review below."],
  "page.storeEyebrow": ["Tuko Karibu Nawe", "We Are Here for You"],
  "page.aboutTitle": ["Hadithi ya Omega Cosmetics", "The Omega Cosmetics Story"],
  "page.aboutDescription": ["Tulianzishwa kwa lengo moja: kuhakikisha kila mteja anapata bidhaa za vipodozi zenye ubora wa kimataifa, kwa bei nafuu na ushauri sahihi.", "We began with one goal: to help every customer find quality beauty products at fair prices, with advice they can trust."],
  "page.aboutStory1": ["Omega Cosmetics ilianza Mwanjerwa jijini Mbeya, ikilenga kuleta mapinduzi chanya kwenye sekta ya urembo kwa kutoa bidhaa salama na bora za ngozi, uso na nywele. Leo, tumekuwa kitovu cha uaminifu kwa maelfu ya wateja mkoani Mbeya na kote nchini.", "Omega Cosmetics began in Mwanjerwa, Mbeya, to bring safe, quality skincare, makeup and haircare to our community. Today, customers across Mbeya and Tanzania trust us for their beauty needs."],
  "page.aboutStory2": ["Tunaamini kuwa urembo wa kweli unaanzia kwenye kujiamini. Ndiyo maana kila mteja anayeagiza au kuwasiliana nasi anapata ushauri wa dhati wa kitaalamu unaomfaa binafsi.", "We believe true beauty begins with confidence. Every customer who shops with or contacts us receives thoughtful, personal advice."],
  "page.values": ["Misingi Yetu", "Our Values"],
  "page.valueQuality": ["Ubora", "Quality"],
  "page.valueQualityText": ["Kila bidhaa tunayouza imepitia uchunguzi wa ubora kabla ya kufika dukani.", "Every product is checked for quality before it reaches our shelves."],
  "page.valueTrust": ["Uaminifu", "Trust"],
  "page.valueTrustText": ["Tunauza bidhaa halisi tu, hakuna nakala au bidhaa feki.", "We sell authentic products only, never counterfeits."],
  "page.valueCommunity": ["Jumuiya", "Community"],
  "page.valueCommunityText": ["Tunawekeza katika mafunzo ya urembo na kuwawezesha wanawake na vijana kujiamini.", "We invest in beauty education and help women and young people grow in confidence."],
  "page.servicesEyebrow": ["Tunachotoa", "What We Offer"],
  "page.servicesDescription": ["Zaidi ya kuuza bidhaa, tunasindikiza wateja wetu katika kila hatua ya safari yao ya urembo.", "More than a shop, we support our customers at every step of their beauty journey."],
  "page.servicesCtaTitle": ["Unahitaji ushauri wa moja kwa moja?", "Need personal advice?"],
  "page.servicesCtaText": ["Wasiliana na timu yetu leo na tutakusaidia kuchagua bidhaa na huduma zinazokufaa.", "Contact our team today and we will help you find the products and services that suit you."],
  "page.galleryEyebrow": ["Picha Zetu", "Our Gallery"],
  "page.galleryTitle": ["Ndani ya Duka Letu", "Inside Our Store"],
  "page.galleryDescription": ["Angalia picha za bidhaa zetu na baadhi ya kazi za mapambo tulizofanya kwa wateja.", "Explore our products and some of the makeup looks we have created for customers."],
  "page.reviewsTitle": ["Maoni ya Wateja Wetu", "Customer Reviews"],
  "page.contactFormSuccess": ["Asante! Ujumbe wako umetumwa. Tutakujibu hivi karibuni.", "Thank you! Your message has been sent. We will be in touch soon."],
  "page.reviewFormSuccess": ["Asante kwa maoni yako! Yatatokea hapa baada ya kupitiwa na kukubaliwa.", "Thank you for your review! It will appear here after it has been approved."],
  "page.orderSuccess": ["Asante! Oda yako imepokelewa.", "Thank you! Your order has been received."],
  "page.orderReference": ["Namba ya Oda", "Order Reference"],
  "page.orderInvoiceHint": ["Tafadhali tumia maelezo ya ankara hii hapa chini kukamilisha malipo.", "Use the invoice details below to complete your payment."],
  "page.orderEmpty": ["Oda yako haina bidhaa kwa sasa.", "Your order is currently empty."],
  "page.orderContinue": ["Endelea Kununua", "Continue Shopping"],
  "page.orderContinueCheckout": ["Endelea na Oda", "Continue to Checkout"],
  "page.orderConfirm": ["Thibitisha Oda", "Confirm Order"],
  "page.orderSending": ["Inatuma...", "Sending..."],
  "page.orderSummary": ["Muhtasari", "Summary"],
  "page.orderItems": ["Jumla ya Bidhaa", "Items Subtotal"],
  "page.orderTotal": ["Jumla Kuu", "Total"],
  "page.orderDelivery": ["Uwasilishaji", "Delivery"],
  "page.orderFree": ["Bure", "Free"],
  "page.orderFreeDelivery": ["Nunua zaidi ya", "Spend over"],
  "page.orderFreeDeliveryEnd": ["upate uwasilishaji bure.", "to get free delivery."],
  "page.orderName": ["Jina Kamili", "Full Name"],
  "page.orderPhone": ["Namba ya Simu", "Phone Number"],
  "page.orderAddress": ["Anuani ya Kufikisha", "Delivery Address"],
  "page.orderAddressHint": ["Mtaa, Kata, Jiji", "Street, Ward, City"],
  "page.orderQuantity": ["Idadi", "Qty"],
  "page.orderRemove": ["Ondoa", "Remove"],
  "page.orderDownloadInvoice": ["Pakua Ankara (PDF)", "Download Invoice (PDF)"],
  "page.orderPayment": ["JINSI YA KULIPIA", "PAYMENT INSTRUCTIONS"],
  "page.orderCustomer": ["TAARIFA ZA MTEJA", "CUSTOMER DETAILS"],
  "page.orderProducts": ["BIDHAA ULIZONUNUA", "ITEMS ORDERED"],
  "page.orderUnpaid": ["Haijalipwa bado", "Unpaid"],
  "page.orderPaymentReminder": ["Tafadhali tumia namba yako ya simu kama kumbukumbu ya muamala.", "Please use your phone number as the payment reference."],
  "page.orderReferenceLabel": ["Namba ya Oda", "Order Reference"],
  "page.orderNameLabel": ["Jina", "Name"],
  "page.orderPhoneLabel": ["Simu", "Phone"],
  "page.orderAddressLabel": ["Anuani", "Address"],
  "page.orderDate": ["Tarehe", "Date"],
  "page.orderInvoice": ["Ankara Rasmi ya Mauzo", "Official Sales Invoice"],
  "product.all": ["Zote", "All"],
  "product.empty": ["Hakuna bidhaa katika kategoria hii kwa sasa.", "No products in this category yet."],
  "product.search": ["Tafuta bidhaa (mf. sabuni, mafuta...)", "Search products (e.g. soap, oils...)"],
  "product.loadError": ["Bidhaa hazijapakiwa kutoka dukani; zinaonyeshwa bidhaa za mfano.", "Products could not be loaded from the store; sample products are shown."],
  "whatsapp.chat": ["Tuandikie WhatsApp", "Chat with us on WhatsApp"],
  "whatsapp.order": ["Tuma oda WhatsApp", "Send order on WhatsApp"],
  "whatsapp.orderHint": ["Bonyeza kitufe kutuma maelezo ya oda yako kupitia WhatsApp.", "Tap the button to send your order details through WhatsApp."],
  "contact.store": ["Duka Letu", "Our Store"],
  "contact.phone": ["Simu na WhatsApp", "Phone and WhatsApp"],
  "contact.email": ["Barua Pepe", "Email"],
  "contact.hours": ["Muda wa Kufunguliwa", "Opening Hours"],
  "contact.whatsapp": ["Tuma WhatsApp", "Message us on WhatsApp"],
  "contact.monday": ["Jumatatu - Jumamosi: 9:00 - 20:00", "Monday - Saturday: 9:00 AM - 8:00 PM"],
  "contact.sunday": ["Jumapili: 11:00 - 17:00", "Sunday: 11:00 AM - 5:00 PM"],
  "form.name": ["Jina Kamili", "Full Name"],
  "form.email": ["Barua Pepe", "Email Address"],
  "form.phone": ["Namba ya Simu", "Phone Number"],
  "form.address": ["Anuani ya Kuwasilisha", "Delivery Address"],
  "form.message": ["Ujumbe", "Message"],
  "form.submit": ["Tuma Ujumbe", "Send Message"],
  "form.sending": ["Inatuma...", "Sending..."],
  "form.reviewSubmit": ["Tuma Maoni", "Submit Review"],
  "form.orderSubmit": ["Weka Oda", "Place Order"],
  "form.loading": ["Inapakia...", "Loading..."],
  "admin.products": ["Usimamizi wa Bidhaa", "Product Management"],
  "admin.add": ["Ongeza Bidhaa", "Add Product"],
  "admin.save": ["Hifadhi Bidhaa", "Save Product"],
  "admin.update": ["Hifadhi Mabadiliko", "Save Changes"],
  "admin.edit": ["Hariri", "Edit"],
  "admin.delete": ["Futa", "Delete"],
  "admin.cancel": ["Ghairi", "Cancel"],
  "admin.confirmDelete": ["Una uhakika unataka kufuta bidhaa hii kabisa?", "Are you sure you want to permanently delete this product?"],
  "admin.active": ["Inaonekana dukani", "Visible in store"],
  "admin.inactive": ["Imefichwa dukani", "Hidden from store"],
  "admin.toggleVisibility": ["Badili mwonekano", "Toggle visibility"],
  "admin.productDeleted": ["Bidhaa imefutwa.", "Product deleted."],
  "admin.productSaved": ["Bidhaa imehifadhiwa.", "Product saved."],
  "admin.productName": ["Jina la Bidhaa", "Product Name"],
  "admin.slug": ["Slug (kiungo)", "Slug (URL)"],
  "admin.category": ["Kategoria", "Category"],
  "admin.price": ["Bei (TZS)", "Price (TZS)"],
  "admin.description": ["Maelezo", "Description"],
  "admin.image": ["Pakia picha ya bidhaa", "Upload product image"],
  "footer.pages": ["Kurasa", "Pages"],
  "footer.contact": ["Mawasiliano", "Contact"],
  "footer.rights": ["Haki zote zimehifadhiwa.", "All rights reserved."]
} as const;

type TranslationKey = keyof typeof translations;

type PreferencesContextValue = {
  language: Language;
  theme: Theme;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
  t: (key: TranslationKey) => string;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === "sw" || value === "en";
}

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function SitePreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("sw");
  const [theme, setTheme] = useState<Theme>("light");
  const [preferencesReady, setPreferencesReady] = useState(false);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("mtundu-language");
    const storedTheme = window.localStorage.getItem("mtundu-theme");
    const nextLanguage = isLanguage(storedLanguage) ? storedLanguage : "sw";
    const nextTheme = isTheme(storedTheme) ? storedTheme : "light";

    setLanguage(nextLanguage);
    setTheme(nextTheme);
    document.documentElement.lang = nextLanguage;
    document.documentElement.dataset.theme = nextTheme;
    setPreferencesReady(true);
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    document.documentElement.lang = language;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("mtundu-language", language);
    window.localStorage.setItem("mtundu-theme", theme);
  }, [language, theme, preferencesReady]);

  function toggleTheme() {
    setTheme((current) => current === "light" ? "dark" : "light");
  }

  function t(key: TranslationKey) {
    return translations[key][language === "sw" ? 0 : 1];
  }

  return (
    <PreferencesContext.Provider value={{ language, theme, setLanguage, toggleTheme, t }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function useSitePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("useSitePreferences must be used within SitePreferencesProvider");
  }
  return context;
}
