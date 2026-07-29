"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/data";
import AddToCartButton from "./AddToCartButton";

type ProductGridProps = {
  products: Product[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)));
    return ["Zote", ...unique];
  }, [products]);

  const [active, setActive] = useState("Zote");

  const filtered = active === "Zote" ? products : products.filter((p) => p.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === category
                ? "bg-plum text-cream"
                : "border border-plum/20 text-plum/80 hover:border-plum"
            }`}
            aria-pressed={active === category}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product,index) => (
          <div key={`${product.slug}-${index}`} className="group overflow-hidden rounded-2xl border border-plum/10">
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority //
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide text-rose-dark">{product.category}</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-plum">{product.name}</h3>
              <p className="mt-2 text-sm text-charcoal/70">{product.description}</p>
              <p className="mt-3 font-semibold text-plum">{product.price}</p>
              <AddToCartButton product={product} className="mt-4" />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-charcoal/60">
          Hakuna bidhaa katika kategoria hii kwa sasa.
        </p>
      )}
    </div>
  );
}
