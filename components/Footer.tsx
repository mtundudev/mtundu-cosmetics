"use client";

import Link from "next/link";
import { BRAND, NAV_LINKS } from "@/lib/nav";
import ShadeStrip from "./ShadeStrip";
import Logo from "./Logo";
import { useSitePreferences } from "@/lib/preferences";

export default function Footer() {
  const { language, t } = useSitePreferences();
  const labels: Record<string, string> = {
    "/": t("nav.home"),
    "/kuhusu": t("nav.about"),
    "/bidhaa": t("nav.products"),
    "/huduma": t("nav.services"),
    "/picha": t("nav.gallery"),
    "/maoni": t("nav.reviews"),
    "/wasiliana": t("nav.contact")
  };

  return (
    <footer className="border-t border-plum/10 bg-plum text-cream">
      <div className="h-1 bg-gradient-to-r from-rose-dark via-gold to-rose-dark" />
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={42} tone="light" />
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-cream/70">
            {language === "sw" ? BRAND.tagline : "Natural beauty, confidence every day"}
          </p>
          <ShadeStrip className="mt-5" />
        </div>

        <div>
          <p className="section-eyebrow text-gold">{t("footer.pages")}</p>
          <ul className="mt-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-cream/75 transition-colors hover:text-gold">
                  {labels[link.href] ?? link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="section-eyebrow text-gold">{t("footer.contact")}</p>
          <ul className="mt-4 space-y-3 text-sm text-cream/75">
            <li>{BRAND.address}</li>
            <li>
              <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="hover:text-gold">
                {BRAND.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${BRAND.email}`} className="hover:text-gold">
                {BRAND.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 py-5">
        <p className="container-page text-center text-xs text-cream/50">
          &copy; {new Date().getFullYear()} {BRAND.name}. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
