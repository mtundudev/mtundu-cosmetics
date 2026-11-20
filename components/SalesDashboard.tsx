"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";
import { type AdminOverview, type OrderRow, type SalesMetrics } from "@/lib/api";
import { formatTZS } from "@/lib/cart-config";
import { useSitePreferences } from "@/lib/preferences";

type SalesDashboardProps = {
  orders: OrderRow[];
  overview: AdminOverview;
  metrics: SalesMetrics;
};

const ORDER_STATUSES = [
  { status: "pending", color: "#D6A74B" },
  { status: "processing", color: "#7A5AA6" },
  { status: "shipped", color: "#4A90A4" },
  { status: "completed", color: "#568B68" },
  { status: "cancelled", color: "#B45B68" }
];

export default function SalesDashboard({ orders, overview, metrics }: SalesDashboardProps) {
  const { language } = useSitePreferences();
  const isEnglish = language === "en";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="section-eyebrow">{isEnglish ? "Store overview" : "Muhtasari wa duka"}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-plum">
            {isEnglish ? "Business dashboard" : "Dashibodi ya Biashara"}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-plum/10 p-6">
          <p className="section-eyebrow">{isEnglish ? "Orders" : "Oda zote"}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-plum">{overview.total_orders}</p>
          <p className="mt-1 text-xs text-charcoal/60">{overview.pending_orders} {isEnglish ? "awaiting processing" : "zinasubiri kushughulikiwa"}</p>
        </div>
        <div className="rounded-2xl border border-plum/10 p-6">
          <p className="section-eyebrow">{isEnglish ? "Order value" : "Thamani ya oda"}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-plum">
            {formatTZS(overview.total_revenue)}
          </p>
          <p className="mt-1 text-xs text-charcoal/60">{isEnglish ? "Across all orders" : "Kwa oda zote"}</p>
        </div>
        <div className="rounded-2xl border border-plum/10 p-6">
          <p className="section-eyebrow">{isEnglish ? "Paid revenue" : "Mapato yaliyolipwa"}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-plum">
            {formatTZS(overview.paid_revenue)}
          </p>
          <p className="mt-1 text-xs text-charcoal/60">{overview.paid_orders} {isEnglish ? "paid orders" : "oda zimelipwa"}</p>
        </div>
        <div className="rounded-2xl border border-plum/10 p-6">
          <p className="section-eyebrow">{isEnglish ? "Products in store" : "Bidhaa dukani"}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-plum">{overview.active_products}</p>
          <p className="mt-1 text-xs text-charcoal/60">{overview.total_products} {isEnglish ? "total products" : "bidhaa kwa jumla"}</p>
        </div>
        <div className="rounded-2xl border border-plum/10 p-6">
          <p className="section-eyebrow">{isEnglish ? "Average order" : "Wastani wa oda"}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-plum">{formatTZS(metrics.avg_order)}</p>
          <p className="mt-1 text-xs text-charcoal/60">{overview.unpaid_orders} {isEnglish ? "unpaid orders" : "oda hazijalipwa"}</p>
        </div>
        <div className="rounded-2xl border border-plum/10 p-6">
          <p className="section-eyebrow">{isEnglish ? "Messages to reply" : "Ujumbe wa kujibu"}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-plum">{overview.unanswered_contacts}</p>
          <p className="mt-1 text-xs text-charcoal/60">{overview.total_contacts} {isEnglish ? "messages received" : "jumbe zimepokelewa"}</p>
        </div>
        <div className="rounded-2xl border border-plum/10 p-6">
          <p className="section-eyebrow">{isEnglish ? "Reviews to approve" : "Maoni ya kuidhinisha"}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-plum">{overview.pending_reviews}</p>
          <p className="mt-1 text-xs text-charcoal/60">{overview.total_reviews} {isEnglish ? "reviews total" : "maoni kwa jumla"}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-plum/10 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-plum">{isEnglish ? "Revenue by day" : "Mapato kwa siku"}</h2>
            <div className="mt-4 h-64 w-full">
              {metrics.revenue_by_day.length ? <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.revenue_by_day}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eadfcf" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatTZS(value)} />
                  <Bar dataKey="total" fill="#3B1F2B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer> : <div className="grid h-full place-items-center text-sm text-charcoal/60">{isEnglish ? "No sales yet" : "Bado hakuna mauzo"}</div>}
            </div>
          </div>

          <div className="rounded-2xl border border-plum/10 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-plum">{isEnglish ? "Orders by status" : "Oda kwa hali"}</h2>
            <div className="mt-4 h-64 w-full">
              {overview.orders_by_status.length ? <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.orders_by_status}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eadfcf" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {overview.orders_by_status.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={ORDER_STATUSES.find((status) => status.status === entry.status)?.color ?? "#8A6477"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer> : <div className="grid h-full place-items-center text-sm text-charcoal/60">{isEnglish ? "No orders yet" : "Bado hakuna oda"}</div>}
            </div>
          </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-plum/10 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-plum">{isEnglish ? "Best-selling products" : "Bidhaa zinazouzwa zaidi"}</h2>
            <div className="mt-4 h-64 w-full">
              {metrics.top_products.length ? <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.top_products} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#eadfcf" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#B08D57" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer> : <div className="grid h-full place-items-center text-sm text-charcoal/60">{isEnglish ? "No sales yet" : "Bado hakuna mauzo"}</div>}
            </div>
          </div>

          <div className="rounded-2xl border border-plum/10 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-plum">{isEnglish ? "Recent orders" : "Oda za hivi karibuni"}</h2>
            <div className="mt-4 space-y-3">
              {orders.slice(0, 10).map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-plum/10 pb-3 text-sm"
                >
                  <span className="font-medium text-plum">{order.order_ref}</span>
                  <span className="text-charcoal/70">{order.customer_name}</span>
                  <span className="text-charcoal/70">{order.payment_status === "paid" ? (isEnglish ? "Paid" : "Imelipwa") : (isEnglish ? "Unpaid" : "Haijalipwa")}</span>
                  <span className="font-semibold text-plum">{formatTZS(order.total)}</span>
                </div>
              ))}
              {orders.length === 0 && <p className="text-sm text-charcoal/60">{isEnglish ? "No orders received yet." : "Bado hakuna oda zilizopokelewa."}</p>}
            </div>
          </div>
      </div>
    </div>
  );
}
