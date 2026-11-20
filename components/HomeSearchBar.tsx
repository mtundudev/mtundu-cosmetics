"use client";

import { useState, type FormEvent } from "react";
import { useSitePreferences } from "@/lib/preferences";

export default function HomeSearchBar() {
  const { language } = useSitePreferences();
  const [search, setSearch] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    window.location.assign(query ? `/bidhaa?search=${encodeURIComponent(query)}` : "/bidhaa");
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="mt-6 flex max-w-lg gap-2 rounded-2xl border border-plum/15 bg-white p-2 shadow-sm">
      <label htmlFor="home-product-search" className="sr-only">
        {language === "sw" ? "Tafuta bidhaa" : "Search products"}
      </label>
      <input
        id="home-product-search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={language === "sw" ? "Tafuta bidhaa, ngozi au makeup..." : "Search products, skincare or makeup..."}
        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-plum outline-none placeholder:text-charcoal/45"
      />
      <button type="submit" className="btn-primary !px-4 !py-2.5">
        {language === "sw" ? "Tafuta" : "Search"}
      </button>
    </form>
  );
}
