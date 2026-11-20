"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useSitePreferences } from "@/lib/preferences";

export default function CartButton() {
  const { itemCount } = useCart();
  const { language } = useSitePreferences();

  return (
    <Link
      href="/kikapu"
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-rose/30 bg-rose-light/20 text-plum shadow-sm transition hover:-translate-y-0.5 hover:border-rose/60 hover:bg-rose-light/40"
      aria-label={language === "sw" ? `Oda yenye bidhaa ${itemCount}` : `Order with ${itemCount} items`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        className="h-[21px] w-[21px]"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.5 8.5h13l1 11h-15l1-11ZM9 8.5V6a3 3 0 016 0v2.5"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-dark text-[10px] font-semibold text-cream">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
