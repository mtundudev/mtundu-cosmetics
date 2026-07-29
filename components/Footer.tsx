import Link from "next/link";
import { BRAND, NAV_LINKS } from "@/lib/nav";
import ShadeStrip from "./ShadeStrip";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-plum/10 bg-plum text-cream">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <p className="font-display text-xl font-semibold">{BRAND.name}</p>
          </div>
          <p className="mt-2 max-w-xs text-sm text-cream/70">{BRAND.tagline}</p>
          <ShadeStrip className="mt-5" />
        </div>

        <div>
          <p className="section-eyebrow text-gold">Kurasa</p>
          <ul className="mt-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-cream/80 hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="section-eyebrow text-gold">Mawasiliano</p>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
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
          &copy; {new Date().getFullYear()} {BRAND.name}. Haki zote zimehifadhiwa.
        </p>
      </div>
    </footer>
  );
}
