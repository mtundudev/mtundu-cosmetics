"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/data";
import { useSitePreferences } from "@/lib/preferences";

type AddToCartButtonProps = {
  product: Product;
  className?: string;
};

export default function AddToCartButton({ product, className = "" }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { t } = useSitePreferences();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({
      slug: product.slug,
      name: product.name,
      priceValue: product.priceValue ?? Number(product.price.replace(/[^0-9]/g, "")),
      originalPriceValue: product.originalPriceValue,
      discountPercent: product.discountPercent
    });
    setAdded(true);
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-live="polite"
        className="btn-secondary w-full"
      >
        {added ? t("action.addedToCart") : t("action.addToCart")}
      </button>
      {added && (
        <Link href="/kikapu" className="btn-primary w-full !py-2.5">
          {t("action.proceedToOrder")}
        </Link>
      )}
    </div>
  );
}
