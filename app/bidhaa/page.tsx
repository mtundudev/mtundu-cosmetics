"use client";

import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import ProductGrid from "@/components/ProductGrid";
import { PRODUCTS } from "@/lib/data";
import { BRAND } from "@/lib/nav";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Chuja bidhaa kulingana na kile mteja anachoandika kwenye search bar
  const filteredProducts = PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow="Duka Letu"
        title="Bidhaa Zetu"
        description="Chagua kutoka kategoria mbalimbali za bidhaa za urembo zilizothibitishwa kuwa bora."
      />

      {/* Search Bar Input */}
      <div className="mt-8 max-w-md">
        <input
          type="text"
          placeholder="Tafuta bidhaa (mf. sabuni, mafuta...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-plum/20 focus:outline-none focus:border-plum text-sm bg-white"
        />
      </div>

      <div className="mt-8">
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
}
