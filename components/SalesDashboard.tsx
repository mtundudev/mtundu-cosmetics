"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import type { OrderRow } from "@/lib/supabase-admin";
import { formatTZS } from "@/lib/cart-config";

type SalesDashboardProps = {
  orders: OrderRow[];
};

export default function SalesDashboard({ orders }: SalesDashboardProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
  const totalOrders = orders.length;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((order) => {
      const day = new Date(order.created_at).toLocaleDateString("sw-TZ", {
        day: "2-digit",
        month: "2-digit"
      });
      map.set(day, (map.get(day) ?? 0) + order.total);
    });
    return Array.from(map.entries()).map(([day, total]) => ({ day, total }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        map.set(item.name, (map.get(item.name) ?? 0) + item.quantity);
      });
    });
    return Array.from(map.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);
  }, [orders]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-plum">Takwimu za Mauzo</h1>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-sm font-medium text-rose-dark underline"
        >
          {loggingOut ? "Inatoka..." : "Logout"}
        </button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-plum/10 p-6">
          <p className="section-eyebrow">Jumla ya Order</p>
          <p className="mt-2 font-display text-3xl font-semibold text-plum">{totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-plum/10 p-6">
          <p className="section-eyebrow">Mapato Yote</p>
          <p className="mt-2 font-display text-3xl font-semibold text-plum">
            {formatTZS(totalRevenue)}
          </p>
        </div>
        <div className="rounded-2xl border border-plum/10 p-6">
          <p className="section-eyebrow">Wastani wa Order</p>
          <p className="mt-2 font-display text-3xl font-semibold text-plum">
            {formatTZS(avgOrder)}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-rose-light/25 p-6 text-sm text-charcoal/70">
          Hakuna order bado. Takwimu zitaonekana hapa mara wateja watakapoanza kuagiza.
        </p>
      ) : (
        <>
          <div className="mt-10 rounded-2xl border border-plum/10 p-6">
            <h2 className="font-display text-lg font-semibold text-plum">Mapato kwa Siku</h2>
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eadfcf" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatTZS(value)} />
                  <Bar dataKey="total" fill="#3B1F2B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-plum/10 p-6">
            <h2 className="font-display text-lg font-semibold text-plum">
              Bidhaa Zinazouzwa Zaidi
            </h2>
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#eadfcf" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#B08D57" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-plum/10 p-6">
            <h2 className="font-display text-lg font-semibold text-plum">Order za Hivi Karibuni</h2>
            <div className="mt-4 space-y-3">
              {orders
                .slice()
                .reverse()
                .slice(0, 10)
                .map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-plum/10 pb-3 text-sm"
                  >
                    <span className="font-medium text-plum">{order.order_ref}</span>
                    <span className="text-charcoal/70">{order.customer_name}</span>
                    <span className="text-charcoal/70">{order.customer_phone}</span>
                    <span className="font-semibold text-plum">{formatTZS(order.total)}</span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
