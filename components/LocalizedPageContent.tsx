"use client";

import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import ReviewForm from "@/components/ReviewForm";
import ApprovedReviews from "@/components/ApprovedReviews";
import { useStoreServices } from "@/lib/use-store-services";
import { GALLERY_IMAGES } from "@/lib/gallery";
import { BRAND } from "@/lib/nav";
import { useSitePreferences } from "@/lib/preferences";

export function AboutPageContent() {
  const { t } = useSitePreferences();
  const values = [
    { title: t("page.valueQuality"), text: t("page.valueQualityText") },
    { title: t("page.valueTrust"), text: t("page.valueTrustText") },
    { title: t("page.valueCommunity"), text: t("page.valueCommunityText") }
  ];

  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading eyebrow={t("nav.about")} title={t("page.aboutTitle")} description={t("page.aboutDescription")} />
      <div className="mt-12 grid gap-12 md:grid-cols-2 md:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="/products/Aesthetic_Makeup_Collection_Flatlay.jpg"
            alt={`Duka la vipodozi la ${BRAND.name}`}
            fill
            sizes="(min-width: 768px) 500px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-4 text-charcoal/80">
          <p>{t("page.aboutStory1")}</p>
          <p>{t("page.aboutStory2")}</p>
        </div>
      </div>
      <div className="mt-20">
        <SectionHeading eyebrow={t("page.values")} title={t("page.values")} />
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="rounded-2xl border border-plum/10 p-6">
              <h3 className="font-display text-lg font-semibold text-plum">{value.title}</h3>
              <p className="mt-2 text-sm text-charcoal/70">{value.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ServicesPageContent() {
  const { t, language } = useSitePreferences();
  const { services, loading, error } = useStoreServices();

  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading eyebrow={t("page.servicesEyebrow")} title={t("page.servicesTitle")} description={t("page.servicesDescription")} />
      {error && <p role="status" className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{language === "sw" ? "Orodha ya huduma haikupatikana kikamilifu." : "The service list could not be fully loaded."}</p>}
      {loading && <p role="status" className="mt-6 text-sm text-charcoal/65">{language === "sw" ? "Inapakia huduma..." : "Loading services..."}</p>}
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {services.map((service, index) => (
          <div key={service.title} className="flex gap-5 rounded-2xl border border-plum/10 p-6">
            <span className="font-display text-3xl font-semibold text-rose-light">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="font-display text-lg font-semibold text-plum">
                {language === "sw" ? service.title : service.title_en || service.title}
              </h3>
              <p className="mt-2 text-sm text-charcoal/70">
                {language === "sw" ? service.description : service.description_en || service.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-16 rounded-3xl bg-rose-light/30 p-6 text-center sm:p-10">
        <h2 className="text-2xl font-semibold text-plum sm:text-3xl">{t("page.servicesCtaTitle")}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-charcoal/70">{t("page.servicesCtaText")}</p>
        <Link href="/wasiliana" className="btn-primary mt-6 inline-flex">{t("action.contact")}</Link>
      </div>
    </div>
  );
}

export function GalleryPageContent() {
  const { t } = useSitePreferences();

  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading eyebrow={t("page.galleryEyebrow")} title={t("page.galleryTitle")} description={t("page.galleryDescription")} />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
        {GALLERY_IMAGES.map((image, index) => (
          <div
            key={image.src}
            className={`relative overflow-hidden rounded-2xl ${
              index === 0 ? "col-span-2 aspect-[16/9] md:col-span-1 md:aspect-square" : "aspect-square"
            }`}
          >
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition-transform duration-500 hover:scale-105" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactPageContent() {
  const { t, language } = useSitePreferences();

  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading eyebrow={t("page.storeEyebrow")} title={t("page.contactTitle")} description={t("page.contactDescription")} />
      <div className="mt-12 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-plum/10 p-6 sm:p-8"><ContactForm /></div>
        </div>
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-rose-light/25 p-6">
            <h3 className="font-display text-lg font-semibold text-plum">{t("contact.store")}</h3>
            <p className="mt-2 text-sm text-charcoal/70">{BRAND.address}</p>
          </div>
          <div className="rounded-2xl bg-rose-light/25 p-6">
            <h3 className="font-display text-lg font-semibold text-plum">{t("contact.phone")}</h3>
            <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="mt-2 block text-sm text-charcoal/70 hover:text-rose-dark">{BRAND.phone}</a>
            <a
              href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(language === "sw" ? "Habari, naomba maelezo kuhusu bidhaa zenu." : "Hello, I would like to know more about your products.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-sm text-charcoal/70 hover:text-rose-dark"
            >
              {t("contact.whatsapp")}
            </a>
          </div>
          <div className="rounded-2xl bg-rose-light/25 p-6">
            <h3 className="font-display text-lg font-semibold text-plum">{t("contact.email")}</h3>
            <a href={`mailto:${BRAND.email}`} className="mt-2 block break-all text-sm text-charcoal/70 hover:text-rose-dark">{BRAND.email}</a>
          </div>
          <div className="rounded-2xl bg-rose-light/25 p-6">
            <h3 className="font-display text-lg font-semibold text-plum">{t("contact.hours")}</h3>
            <p className="mt-2 text-sm text-charcoal/70">{t("contact.monday")}</p>
            <p className="text-sm text-charcoal/70">{t("contact.sunday")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewsPageContent() {
  const { t } = useSitePreferences();

  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading eyebrow={t("page.customerVoices")} title={t("page.reviewsTitle")} description={t("page.reviewDescription")} />
      <div className="mt-12 grid gap-12 lg:grid-cols-5">
        <ApprovedReviews />
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-plum/10 p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold text-plum">{t("page.leaveReview")}</h3>
            <p className="mt-1 text-sm text-charcoal/60">{t("page.reviewModeration")}</p>
            <div className="mt-6"><ReviewForm /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
