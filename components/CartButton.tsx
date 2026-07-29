"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/kikapu"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-plum/20 text-plum hover:border-plum"
      aria-label={`Kikapu chenye bidhaa ${itemCount}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.907-4.72 2.302-7.219a1.125 1.125 0 00-1.11-1.31H5.106M7.5 14.25L5.106 5.653M7.5 14.25l-1.293 5.169a.75.75 0 00.727.931h9.212a.75.75 0 00.727-.931L15.75 14.25M9 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm7.5 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
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
