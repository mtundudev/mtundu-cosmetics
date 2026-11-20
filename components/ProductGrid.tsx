"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/data";
import AddToCartButton from "./AddToCartButton";
import { useSitePreferences } from "@/lib/preferences";
import { getImageUrl } from "@/lib/api";
import { formatTZS } from "@/lib/cart-config";

type ProductGridProps = {
  products: Product[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  const { t } = useSitePreferences();
  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)));
    return [t("product.all"), ...unique];
  }, [products, t]);

  const [active, setActive] = useState("");

  const selectedCategory = active || t("product.all");
  const filtered = selectedCategory === t("product.all")
    ? products
    : products.filter((product) => product.category === selectedCategory);

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
        {filtered.map((product, index) => (
          <div key={`${product.slug}-${index}`} className="group overflow-hidden rounded-3xl border border-plum/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/10">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-rose-light/15">
              <Image
                src={getImageUrl(product.image)}
                alt={product.name}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                unoptimized={product.image.startsWith("/uploads/")}
              />
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-xs uppercase tracking-wide text-rose-dark">{product.category}</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-plum">{product.name}</h3>
              <p className="mt-2 text-sm text-charcoal/70">{product.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {product.discountPercent ? (
                  <>
                    <span className="font-semibold text-rose-dark">
                      {formatTZS(product.priceValue ?? 0)}
                    </span>
                    <span className="text-sm text-charcoal/55 line-through">
                      {formatTZS(product.originalPriceValue ?? 0)}
                    </span>
                    <span className="rounded-full bg-rose-dark px-2.5 py-1 text-xs font-bold text-white">
                      -{product.discountPercent}%
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-plum">
                    {product.priceValue === undefined ? product.price : formatTZS(product.priceValue)}
                  </span>
                )}
              </div>
              <AddToCartButton product={product} className="mt-4" />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-charcoal/60">
          {t("product.empty")}
        </p>
      )}
    </div>
  );
}
