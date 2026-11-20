"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import ProductGrid from "@/components/ProductGrid";
import type { Product } from "@/lib/data";
import { BRAND } from "@/lib/nav";
import { API_BASE_URL, getApiError, toCatalogProduct } from "@/lib/api";
import { useSitePreferences } from "@/lib/preferences";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const { t, language } = useSitePreferences();

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await fetch(`${API_BASE_URL}/products?limit=100`);
        const result = (await response.json()) as Parameters<typeof toCatalogProduct>[0][] | { detail?: unknown };
        if (!response.ok || !Array.isArray(result)) {
          throw new Error(getApiError(result, "Imeshindikana kupakia bidhaa."));
        }
        if (active) {
          setProducts(result.map(toCatalogProduct));
          setApiError("");
        }
      } catch (loadError) {
        if (active) {
          setApiError(
            loadError instanceof Error ? loadError.message : "Imeshindikana kupakia bidhaa."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProducts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search).get("search");
    if (search) setSearchTerm(search);
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = products.filter((product) =>
    [product.name, product.category, product.description]
      .some((value) => value.toLowerCase().includes(normalizedSearch))
  );

  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow={t("page.shopEyebrow")}
        title={t("page.shopTitle")}
        description={t("page.shopDescription")}
      />

      {/* Search Bar Input */}
      <div className="mt-8 max-w-md">
        <input
          type="text"
          placeholder={t("product.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-plum/20 bg-white px-4 py-3 text-sm focus:border-plum focus:outline-none"
        />
      </div>

      {apiError && (
        <p role="status" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("product.loadError")} ({apiError})
        </p>
      )}
      {loading ? (
        <p role="status" className="mt-8 text-center text-sm text-charcoal/65">
          {language === "sw" ? "Inapakia bidhaa..." : "Loading products..."}
        </p>
      ) : (
        <div className="mt-8">
          <ProductGrid products={filteredProducts} />
        </div>
      )}
    </div>
  );
}
