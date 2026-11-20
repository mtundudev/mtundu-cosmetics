"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BRAND, NAV_LINKS } from "@/lib/nav";
import CartButton from "./CartButton";
import Logo from "./Logo";
import { useSitePreferences } from "@/lib/preferences";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { language, setLanguage, theme, toggleTheme, t } = useSitePreferences();
  const desktopNavLinks = NAV_LINKS.filter((link) => link.href !== "/wasiliana");
  const themeName = theme === "light" ? t("theme.roseVelvet") : t("theme.classic");
  const themeAction = `${t("action.switchTheme")}: ${themeName}`;

  const navLabels: Record<string, string> = {
    "/": t("nav.home"),
    "/kuhusu": t("nav.about"),
    "/bidhaa": t("nav.products"),
    "/huduma": t("nav.services"),
    "/picha": t("nav.gallery"),
    "/maoni": t("nav.reviews"),
    "/wasiliana": t("nav.contact")
  };

  return (
    <header className="sticky top-0 z-50 border-b border-plum/10 bg-cream/95 shadow-sm shadow-plum/5 backdrop-blur-xl">
      <div className="bg-plum text-cream">
        <div className="container-page flex min-h-8 items-center justify-between gap-3 py-1 text-[10px] font-medium tracking-wide sm:text-xs">
          <p>
            {language === "sw"
              ? "Urembo wa kujiamini, umechaguliwa kwa ajili yako."
              : "Beauty, thoughtfully chosen for you."}
          </p>
          <p className="hidden text-cream/75 sm:block">
            {language === "sw" ? "Uwasilishaji Tanzania nzima" : "Delivery across Tanzania"}
          </p>
        </div>
      </div>
      <nav className="container-page flex min-h-[4.5rem] items-center justify-between gap-3 sm:min-h-[5rem]">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center"
          onClick={() => setOpen(false)}
        >
          <Logo size={42} />
        </Link>

        <ul className="hidden items-center gap-1 xl:flex">
          {desktopNavLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-rose-light/30 text-rose-dark"
                      : "text-plum/80 hover:bg-rose-light/25 hover:text-rose-dark"
                  }`}
                >
                  {navLabels[link.href] ?? link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 xl:flex">
            <button
              type="button"
              onClick={() => setLanguage(language === "sw" ? "en" : "sw")}
              className="h-10 rounded-full border border-plum/15 bg-white/60 px-3 text-xs font-bold tracking-wide text-plum transition hover:border-rose/50 hover:bg-rose-light/20"
              aria-label={t("action.switchLanguage")}
              title={t("action.switchLanguage")}
            >
              {language === "sw" ? "EN" : "SW"}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-plum/15 bg-white/60 text-plum transition hover:border-rose/50 hover:bg-rose-light/20"
              aria-label={themeAction}
              title={themeName}
            >
              {theme === "light" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.4 15.2A8.5 8.5 0 0 1 8.8 3.6 8.5 8.5 0 1 0 20.4 15.2Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                </svg>
              )}
            </button>
          </div>
          <CartButton />
          <Link href="/wasiliana" className="btn-primary hidden !px-5 !py-2.5 xl:inline-flex">
            {t("action.contact")}
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-plum/15 bg-white/60 text-plum transition hover:border-rose/50 hover:bg-rose-light/20 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open
              ? (language === "sw" ? "Funga menyu" : "Close menu")
              : (language === "sw" ? "Fungua menyu" : "Open menu")}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="sr-only">{language === "sw" ? "Menyu" : "Menu"}</span>
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-plum transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-plum transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-plum transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-navigation" className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-plum/10 bg-cream shadow-lg shadow-plum/10 xl:hidden">
          <ul className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    pathname === link.href
                      ? "bg-rose-light/35 text-rose-dark"
                      : "text-plum/90 hover:bg-rose-light/30"
                  }`}
                >
                  {navLabels[link.href] ?? link.label}
                </Link>
              </li>
            ))}
            <li className="flex flex-wrap gap-2 border-t border-plum/10 pt-4">
              <button
                type="button"
                onClick={() => setLanguage(language === "sw" ? "en" : "sw")}
                className="rounded-full border border-plum/15 bg-white/60 px-4 py-2.5 text-sm font-semibold text-plum transition hover:bg-rose-light/20"
                aria-label={t("action.switchLanguage")}
              >
                {language === "sw" ? "English" : "Kiswahili"}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-full border border-plum/15 bg-white/60 px-4 py-2.5 text-sm font-semibold text-plum transition hover:bg-rose-light/20"
                aria-label={themeAction}
              >
                {themeName}
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
