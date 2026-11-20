import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import SectionHeading from "@/components/SectionHeading";
import { getImageUrl } from "@/lib/api";
import { formatTZS } from "@/lib/cart-config";
import type { Product } from "@/lib/data";
import { useSitePreferences } from "@/lib/preferences";

type SpecialOffersProps = {
  products: Product[];
  loading: boolean;
  error: boolean;
};

export default function SpecialOffers({ products, loading, error }: SpecialOffersProps) {
  const { language } = useSitePreferences();
  const offers = products.filter((product) => (product.discountPercent ?? 0) > 0);

  return (
    <section className="bg-gradient-to-br from-rose-light/35 via-cream to-gold/10 py-16 md:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow={language === "sw" ? "Bei maalum za muda huu" : "Limited-time prices"}
          title={language === "sw" ? "Ofa Maalum" : "Special Offers"}
          description={language === "sw"
            ? "Furahia punguzo kwenye bidhaa zilizochaguliwa."
            : "Enjoy savings on selected products."}
        />
        {error && (
          <p role="status" className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {language === "sw" ? "Imeshindikana kupakia ofa." : "Offers could not be loaded."}
          </p>
        )}
        {loading ? (
          <p role="status" className="mt-8 text-center text-sm text-charcoal/65">
            {language === "sw" ? "Inatafuta ofa..." : "Loading offers..."}
          </p>
        ) : offers.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((product) => (
              <article key={product.slug} className="overflow-hidden rounded-3xl border border-rose-dark/15 bg-white shadow-sm">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized={product.image.startsWith("/uploads/")}
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-rose-dark px-4 py-2 text-sm font-bold text-white shadow">
                    {language === "sw" ? `PUNGUZO LA ${product.discountPercent}%` : `${product.discountPercent}% OFF`}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-rose-dark">{product.category}</p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-plum">{product.name}</h3>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-lg font-bold text-rose-dark">{formatTZS(product.priceValue ?? 0)}</span>
                    <span className="text-sm text-charcoal/55 line-through">{formatTZS(product.originalPriceValue ?? 0)}</span>
                  </div>
                  <AddToCartButton product={product} className="mt-4" />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-rose-dark/10 bg-white/80 px-6 py-8 text-center">
            <p className="font-display text-lg font-semibold text-plum">
              {language === "sw" ? "Ofa mpya zinakuja hivi karibuni" : "New offers are coming soon"}
            </p>
            <p className="mt-2 text-sm text-charcoal/65">
              {language === "sw" ? "Tembelea bidhaa zetu ili kuona mkusanyiko wote." : "Browse our products to explore the full collection."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
