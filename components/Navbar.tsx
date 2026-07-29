"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BRAND, NAV_LINKS } from "@/lib/nav";
import CartButton from "./CartButton";
import Logo from "./Logo";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-plum/10 bg-cream/90 backdrop-blur">
      <nav className="container-page flex h-20 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-xl font-semibold text-plum"
          onClick={() => setOpen(false)}
        >
          <Logo size={38} />
          {BRAND.name}
        </Link>

        <ul className="hidden gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    active ? "text-rose-dark" : "text-plum/80 hover:text-rose-dark"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <CartButton />
          <Link href="/wasiliana" className="btn-primary hidden md:inline-flex">
            Wasiliana Nasi
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-plum/20 md:hidden"
            aria-expanded={open}
            aria-label={open ? "Funga menyu" : "Fungua menyu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="sr-only">Menyu</span>
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-plum transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-plum transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-plum transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-plum/10 bg-cream md:hidden">
          <ul className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm font-medium text-plum/90 hover:bg-rose-light/40"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/kikapu"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-plum/90 hover:bg-rose-light/40"
              >
                Kikapu
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
