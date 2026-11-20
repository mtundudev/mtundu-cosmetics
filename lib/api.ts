import type { Product } from "./data";
import { getDiscountedPrice } from "./pricing";

const defaultApiHost =
  typeof window === "undefined" ? "localhost" : window.location.hostname;

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? `http://${defaultApiHost}:8000/api/v1`
).replace(/\/+$/, "");
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, "");

export type ApiProduct = Omit<Product, "priceValue" | "originalPriceValue" | "discountPercent"> & {
  price_value: number;
  discount_percent?: number;
};

export function toCatalogProduct(product: ApiProduct): Product {
  const { price_value, discount_percent, ...details } = product;
  const discountPercent = discount_percent ?? 0;
  return {
    ...details,
    priceValue: getDiscountedPrice(price_value, discountPercent),
    originalPriceValue: price_value,
    discountPercent
  };
}

export function getImageUrl(path: string): string {
  return path.startsWith("/uploads/") ? `${API_ORIGIN}${path}` : path;
}

export function getApiError(payload: unknown, fallback: string): string {
  if (typeof payload !== "object" || payload === null) return fallback;

  const result = payload as { detail?: unknown; error?: unknown };
  if (typeof result.detail === "string") return result.detail;
  if (typeof result.error === "string") return result.error;
  if (Array.isArray(result.detail) && result.detail.length > 0) {
    const firstError = result.detail[0];
    if (
      typeof firstError === "object" &&
      firstError !== null &&
      "msg" in firstError &&
      typeof firstError.msg === "string"
    ) {
      return firstError.msg;
    }
  }

  return fallback;
}

export type OrderRow = {
  id: number;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_email: string | null;
  items: { slug: string; name: string; priceValue: number; quantity: number }[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_provider_ref: string | null;
  created_at: string;
};

export type AdminOverview = {
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  paid_orders: number;
  unpaid_orders: number;
  total_revenue: number;
  paid_revenue: number;
  total_contacts: number;
  unanswered_contacts: number;
  total_reviews: number;
  pending_reviews: number;
  orders_by_status: { status: string; count: number }[];
};

export type SalesMetrics = {
  total_orders: number;
  total_revenue: number;
  avg_order: number;
  revenue_by_day: { day: string; total: number }[];
  top_products: { name: string; quantity: number }[];
};
