"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, getApiError, type OrderRow } from "@/lib/api";
import { formatTZS } from "@/lib/cart-config";
import { useSitePreferences } from "@/lib/preferences";

type ContactRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  replied: boolean;
  created_at: string;
};

type ReviewRow = {
  id: number;
  name: string;
  rating: number;
  message: string;
  approved: boolean;
  created_at: string;
};

type AdminOperationsProps = { view: "orders" | "messages" | "reviews" };

async function readJson<T>(response: Response, fallback: string): Promise<T> {
  const result = await response.json();
  if (!response.ok) throw new Error(getApiError(result, fallback));
  return result as T;
}

export default function AdminOperations({ view }: AdminOperationsProps) {
  const { language } = useSitePreferences();
  const isEnglish = language === "en";
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = view === "orders"
        ? `${API_BASE_URL}/orders?limit=100`
        : view === "messages"
          ? `${API_BASE_URL}/contact?limit=100`
          : `${API_BASE_URL}/reviews?all_reviews=true&limit=100`;
      const response = await fetch(endpoint, { credentials: "include" });
      if (view === "orders") {
        setOrders(await readJson<OrderRow[]>(response, "Imeshindikana kupakia oda."));
      } else if (view === "messages") {
        setContacts(await readJson<ContactRow[]>(response, "Imeshindikana kupakia ujumbe."));
      } else {
        setReviews(await readJson<ReviewRow[]>(response, "Imeshindikana kupakia maoni."));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Imeshindikana kupakia taarifa.");
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateOrder(order: OrderRow, nextStatus: string) {
    setBusyId(order.order_ref);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(order.order_ref)}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      await readJson<OrderRow>(response, "Imeshindikana kusasisha oda.");
      setOrders((current) => current.map((item) => item.order_ref === order.order_ref ? { ...item, status: nextStatus } : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Imeshindikana kusasisha oda.");
    } finally {
      setBusyId(null);
    }
  }

  async function updateContact(contact: ContactRow) {
    setBusyId(contact.id);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/contact/${contact.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replied: !contact.replied })
      });
      await readJson<ContactRow>(response, "Imeshindikana kubadili hali ya ujumbe.");
      setContacts((current) => current.map((item) => item.id === contact.id ? { ...item, replied: !item.replied } : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Imeshindikana kubadili hali ya ujumbe.");
    } finally {
      setBusyId(null);
    }
  }

  async function updateReview(review: ReviewRow, approved: boolean) {
    setBusyId(review.id);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${review.id}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved })
      });
      await readJson<ReviewRow>(response, "Imeshindikana kubadili hali ya maoni.");
      setReviews((current) => current.map((item) => item.id === review.id ? { ...item, approved } : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Imeshindikana kubadili hali ya maoni.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteReview(review: ReviewRow) {
    if (!window.confirm(isEnglish ? "Delete this review permanently?" : "Futa maoni haya kabisa?")) return;
    setBusyId(review.id);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${review.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      await readJson<{ ok: boolean }>(response, "Imeshindikana kufuta maoni.");
      setReviews((current) => current.filter((item) => item.id !== review.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Imeshindikana kufuta maoni.");
    } finally {
      setBusyId(null);
    }
  }

  const title = view === "orders"
    ? (isEnglish ? "Order management" : "Usimamizi wa oda")
    : view === "messages"
      ? (isEnglish ? "Customer messages" : "Ujumbe wa wateja")
      : (isEnglish ? "Review moderation" : "Usimamizi wa maoni");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-eyebrow">{isEnglish ? "Store operations" : "Shughuli za duka"}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-plum">{title}</h2>
        </div>
        <button type="button" onClick={() => void load()} className="btn-secondary px-4 py-2">
          {isEnglish ? "Refresh" : "Onyesha upya"}
        </button>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p role="status" className="mt-6 text-sm text-charcoal/70">{isEnglish ? "Loading..." : "Inapakia..."}</p>
      ) : view === "orders" ? (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <article key={order.order_ref} className="rounded-2xl border border-plum/10 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-plum">{order.order_ref}</h3>
                  <p className="mt-1 text-sm text-charcoal/75">{order.customer_name} · {order.customer_phone}</p>
                  <p className="mt-1 text-xs text-charcoal/60">{new Date(order.created_at).toLocaleString(isEnglish ? "en-TZ" : "sw-TZ")} · {order.items.length} {isEnglish ? "items" : "bidhaa"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-plum">{formatTZS(order.total)}</p>
                  <p className="mt-1 text-xs text-charcoal/60">
                    {isEnglish ? "Payment" : "Malipo"}: {order.payment_status === "paid" ? (isEnglish ? "Paid" : "Yamelipwa") : (isEnglish ? "Unpaid" : "Hayajalipwa")}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-plum/10 pt-3">
                <p className="text-sm text-charcoal/70">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
                <label className="flex items-center gap-2 text-sm font-medium text-plum">
                  {isEnglish ? "Order status" : "Hali ya oda"}
                  <select
                    value={order.status}
                    disabled={busyId === order.order_ref}
                    onChange={(event) => void updateOrder(order, event.target.value)}
                    className="rounded-lg border border-plum/20 bg-white px-2 py-1.5"
                  >
                    {[
                      ["pending", isEnglish ? "Pending" : "Inasubiri"],
                      ["processing", isEnglish ? "Processing" : "Inashughulikiwa"],
                      ["shipped", isEnglish ? "Shipped" : "Imetumwa"],
                      ["completed", isEnglish ? "Completed" : "Imekamilika"],
                      ["cancelled", isEnglish ? "Cancelled" : "Imeghairiwa"]
                    ].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </div>
            </article>
          ))}
          {orders.length === 0 && <p className="rounded-xl bg-rose-light/20 p-5 text-sm text-charcoal/70">{isEnglish ? "No orders yet." : "Bado hakuna oda."}</p>}
        </div>
      ) : view === "messages" ? (
        <div className="mt-6 space-y-3">
          {contacts.map((contact) => (
            <article key={contact.id} className="rounded-2xl border border-plum/10 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-plum">{contact.name}</h3>
                  <p className="text-sm text-charcoal/70">{contact.email}{contact.phone ? ` · ${contact.phone}` : ""}</p>
                </div>
                <button
                  type="button"
                  disabled={busyId === contact.id}
                  onClick={() => void updateContact(contact)}
                  className={contact.replied ? "btn-secondary px-4 py-2" : "btn-primary px-4 py-2"}
                >
                  {contact.replied ? (isEnglish ? "Reopen" : "Fungua tena") : (isEnglish ? "Mark replied" : "Weka kuwa umejibu")}
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-charcoal/80">{contact.message}</p>
              <p className="mt-3 text-xs text-charcoal/50">{new Date(contact.created_at).toLocaleString(isEnglish ? "en-TZ" : "sw-TZ")} · {contact.replied ? (isEnglish ? "Replied" : "Umejibiwa") : (isEnglish ? "Needs reply" : "Inahitaji jibu")}</p>
            </article>
          ))}
          {contacts.length === 0 && <p className="rounded-xl bg-rose-light/20 p-5 text-sm text-charcoal/70">{isEnglish ? "No customer messages." : "Hakuna ujumbe wa wateja."}</p>}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-plum/10 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-plum">{review.name} <span className="text-gold">{"★".repeat(review.rating)}</span></h3>
                  <p className="mt-1 text-sm text-charcoal/80">{review.message}</p>
                  <p className="mt-2 text-xs text-charcoal/50">{new Date(review.created_at).toLocaleString(isEnglish ? "en-TZ" : "sw-TZ")} · {review.approved ? (isEnglish ? "Published" : "Limechapishwa") : (isEnglish ? "Awaiting review" : "Linasubiri kupitiwa")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => void updateReview(review, !review.approved)}
                    className={review.approved ? "btn-secondary px-4 py-2" : "btn-primary px-4 py-2"}
                  >
                    {review.approved ? (isEnglish ? "Hide from website" : "Ficha kwenye tovuti") : (isEnglish ? "Show on website" : "Onyesha kwenye tovuti")}
                  </button>
                  <button type="button" disabled={busyId === review.id} onClick={() => void deleteReview(review)} className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                    {isEnglish ? "Delete" : "Futa"}
                  </button>
                </div>
              </div>
            </article>
          ))}
          {reviews.length === 0 && <p className="rounded-xl bg-rose-light/20 p-5 text-sm text-charcoal/70">{isEnglish ? "No reviews." : "Hakuna maoni."}</p>}
        </div>
      )}
    </div>
  );
}
