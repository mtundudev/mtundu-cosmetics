"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/data";

type AddToCartButtonProps = {
  product: Product;
  className?: string;
};

export default function AddToCartButton({ product, className = "" }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({ slug: product.slug, name: product.name, priceValue: Number(product.price.replace(/[^0-9]/g, "")) });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn-secondary w-full ${className}`}
    >
      {added ? "Imeongezwa ✓" : "Ongeza Kikapuni"}
    </button>
  );
}
