import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/lib/data";
import { getImageUrl } from "@/lib/api";
import { useSitePreferences } from "@/lib/preferences";
import { formatTZS } from "@/lib/cart-config";

type FeaturedProductsProps = {
  products: Product[];
  loading: boolean;
  error: boolean;
};

export default function FeaturedProducts({ products, loading, error }: FeaturedProductsProps) {
  const { t, language } = useSitePreferences();

  return (
    <>
      {loading && (
        <p role="status" className="mt-8 text-center text-sm text-charcoal/65">
          {language === "sw" ? "Inapakia bidhaa..." : "Loading products..."}
        </p>
      )}
      {!loading && error && (
        <p role="status" className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("product.loadError")}
        </p>
      )}
      {!loading && products.length > 0 && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.slug} className="group overflow-hidden rounded-3xl border border-plum/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/10">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-rose-light/15">
                <Image
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  fill
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
                      <span className="font-semibold text-rose-dark">{formatTZS(product.priceValue ?? 0)}</span>
                      <span className="text-sm text-charcoal/55 line-through">{formatTZS(product.originalPriceValue ?? 0)}</span>
                      <span className="rounded-full bg-rose-dark px-2.5 py-1 text-xs font-bold text-white">-{product.discountPercent}%</span>
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
      )}
      {!loading && products.length === 0 && (
        <p className="mt-8 text-center text-sm text-charcoal/60">{t("product.empty")}</p>
      )}
    </>
  );
}
