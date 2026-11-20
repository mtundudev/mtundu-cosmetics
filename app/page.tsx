"use client";

import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import FeaturedProducts from "@/components/FeaturedProducts";
import HomeSearchBar from "@/components/HomeSearchBar";
import SpecialOffers from "@/components/SpecialOffers";
import { TESTIMONIALS } from "@/lib/data";
import { BRAND } from "@/lib/nav";
import { useSitePreferences } from "@/lib/preferences";
import { useStoreProducts } from "@/lib/use-store-products";
import { useStoreServices } from "@/lib/use-store-services";

export default function HomePage() {
  const { t, language } = useSitePreferences();
  const { products, loading: productsLoading, error: productsError } = useStoreProducts();
  const { services, error: serviceError } = useStoreServices();
  const whatsappUrl = `https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    language === "sw"
      ? "Habari, naomba ushauri wa kuchagua bidhaa za urembo."
      : "Hello, I would like help choosing beauty products."
  )}`;

  return (
    <>
      <section className="container-page py-5 sm:py-8">
        <div className="editorial-hero overflow-hidden rounded-[2rem] bg-plum text-cream shadow-2xl shadow-plum/15">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/50 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-light">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {language === "sw" ? "Urembo wa Tanzania · Tangu Mbeya" : "Tanzanian beauty · From Mbeya"}
              </span>
              <p className="section-eyebrow mt-7 text-gold">{t("page.homeEyebrow")}</p>
              <h1 className="mt-4 max-w-2xl text-4xl font-medium leading-[1.08] text-cream sm:text-5xl lg:text-6xl">
                {t("page.homeTitle")}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-cream/75 sm:text-base">
                {BRAND.name} {t("page.homeDescription")}
              </p>

              <HomeSearchBar />

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/bidhaa" className="btn-primary !bg-gold !text-plum hover:!bg-gold-light">
                  {language === "sw" ? "Gundua mkusanyiko" : "Explore the collection"}
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-5 py-3 text-sm font-semibold text-cream transition hover:bg-white/10"
                >
                  {language === "sw" ? "Pata ushauri ↗" : "Get personal advice ↗"}
                </a>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/15 pt-5 text-xs font-medium text-cream/75">
                <span>✓ {language === "sw" ? "Bidhaa zilizochaguliwa kwa ubora" : "Quality-curated products"}</span>
                <span>✓ {language === "sw" ? "Uwasilishaji Tanzania nzima" : "Nationwide delivery"}</span>
              </div>
            </div>

            <div className="group relative min-h-[360px] overflow-hidden sm:min-h-[480px] lg:min-h-[600px]">
              <Image
                src="/products/makeup_artist_model.jpg"
                alt={language === "sw"
                  ? "Muonekano wa vipodozi na urembo kutoka Omega Cosmetics"
                  : "Beauty and cosmetics inspiration from Omega Cosmetics"}
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/75 via-plum/10 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-plum/5 lg:to-plum/30" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/30 bg-cream/95 p-4 text-plum shadow-xl backdrop-blur sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-xs sm:p-5">
                <p className="section-eyebrow">
                  {language === "sw" ? "Urembo unaokufaa" : "Beauty that feels like you"}
                </p>
                <p className="mt-2 font-display text-lg font-semibold">
                  {language === "sw" ? "Chagua kwa kujiamini." : "Choose with confidence."}
                </p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-semibold text-rose-dark hover:underline">
                  {language === "sw" ? "Ongea na mtaalamu wetu" : "Talk to our beauty team"} ↗
                </a>
              </div>
              <span className="absolute right-6 top-6 hidden rounded-full border border-white/40 bg-plum/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur sm:inline-flex">
                {BRAND.name}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-8 sm:py-12">
        <div className="grid gap-5 border-y border-plum/10 py-6 sm:grid-cols-3 sm:divide-x sm:divide-plum/10 sm:py-8">
          {(language === "sw" ? [
            { number: "01", title: "Ubora uliochaguliwa", text: "Bidhaa za urembo zilizochaguliwa kwa uangalifu." },
            { number: "02", title: "Ushauri binafsi", text: "Msaada wa kuchagua bidhaa zinazokufaa." },
            { number: "03", title: "Tanzania nzima", text: "Uwasilishaji kutoka Mbeya hadi ulipo." }
          ] : [
            { number: "01", title: "Quality curated", text: "Beauty essentials selected with care." },
            { number: "02", title: "Personal guidance", text: "Find the products that feel right for you." },
            { number: "03", title: "Across Tanzania", text: "Thoughtful service, delivered to your door." }
          ]).map((item) => (
            <div key={item.title} className="flex gap-4 px-2 sm:px-6">
              <span className="font-display text-sm text-gold">{item.number}</span>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-plum">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-charcoal/65">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SpecialOffers products={products} loading={productsLoading} error={productsError} />

      {/* FEATURED PRODUCTS */}
      <section className="container-page py-16 md:py-24">
        <SectionHeading
          eyebrow={t("page.featuredEyebrow")}
          title={t("page.featuredTitle")}
          description={t("page.featuredDescription")}
        />

        <FeaturedProducts
          products={products.slice(0, 3)}
          loading={productsLoading}
          error={productsError}
        />

        <div className="mt-10 text-center">
          <Link href="/bidhaa" className="btn-secondary">
            {language === "sw" ? "Ona Bidhaa Zote" : "Browse All Products"}
          </Link>
        </div>
      </section>

      {/* SERVICES TEASER */}
      <section className="bg-plum py-16 text-cream md:py-24">
        <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="section-eyebrow text-gold">{t("page.servicesTitle")}</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              {language === "sw"
                ? "Zaidi ya Ununuzi — Tunakusindikiza Kwenye Safari ya Urembo"
                : "More Than Shopping — We Are With You on Your Beauty Journey"}
            </h2>
            <p className="mt-4 max-w-md text-cream/70">
              {language === "sw"
                ? "Kutoka ushauri wa kibinafsi hadi mapambo ya siku kuu, timu yetu ipo tayari kukusaidia."
                : "From personal advice to special-event makeup, our team is ready to help."}
            </p>
            <Link href="/huduma" className="btn-secondary mt-6 inline-flex border-cream/40 text-cream hover:bg-cream hover:text-plum">
              {language === "sw" ? "Angalia Huduma Zote" : "Explore All Services"}
            </Link>
          </div>

          <ul className="space-y-4">
            {services.slice(0, 3).map((service) => (
              <li key={service.title} className="rounded-2xl border border-cream/15 p-5">
                <p className="font-display text-lg font-semibold">
                  {language === "sw" ? service.title : service.title_en || service.title}
                </p>
                <p className="mt-1 text-sm text-cream/70">
                  {language === "sw" ? service.description : service.description_en || service.description}
                </p>
              </li>
            ))}
            {serviceError && (
              <li role="status" className="rounded-xl bg-white/10 p-4 text-sm text-cream/80">
                {language === "sw" ? "Baadhi ya huduma haziwezi kupakiwa kwa sasa." : "Some services are temporarily unavailable."}
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-page py-16 md:py-24">
        <SectionHeading
          eyebrow={language === "sw" ? "Wateja Wetu Wanasema Nini" : "What Our Customers Say"}
          title={t("page.reviewsTitle")}
          align="center"
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <blockquote key={testimonial.name} className="rounded-3xl border border-plum/10 bg-white/70 p-6 shadow-sm sm:p-7">
                <span aria-hidden="true" className="font-display text-4xl leading-none text-gold">“</span>
                <p className="mt-2 text-sm leading-7 text-charcoal/80">{testimonial.quote}</p>
                <footer className="mt-5 border-t border-plum/10 pt-4">
                <p className="font-semibold text-plum">{testimonial.name}</p>
                <p className="text-xs text-charcoal/60">{testimonial.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/maoni" className="btn-secondary">
            {language === "sw" ? "Ona Maoni Yote" : "Read All Reviews"}
          </Link>
        </div>
      </section>
    </>
  );
}
