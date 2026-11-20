"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, type ApiProduct, toCatalogProduct } from "@/lib/api";
import type { Product } from "@/lib/data";

let inFlightProducts: Promise<Product[]> | null = null;

function requestStoreProducts(): Promise<Product[]> {
  if (!inFlightProducts) {
    inFlightProducts = fetch(`${API_BASE_URL}/products?limit=100`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !Array.isArray(result)) {
          throw new Error("Unable to load products.");
        }
        return (result as ApiProduct[]).map(toCatalogProduct);
      })
      .finally(() => {
        inFlightProducts = null;
      });
  }
  return inFlightProducts;
}

export function useStoreProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const result = await requestStoreProducts();
        if (active) setProducts(result);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProducts();
    return () => {
      active = false;
    };
  }, []);

  return { products, loading, error };
}
