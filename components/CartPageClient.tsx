"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useCart, type CartItem } from "@/lib/cart-context";
import { CART_CONFIG, PAYMENT_INFO, formatTZS } from "@/lib/cart-config";
import { BRAND } from "@/lib/nav";
import { getInitials } from "@/lib/logo";

type Step = "cart" | "form" | "success";
type Status = "idle" | "loading" | "error";
type CustomerInfo = { name: string; phone: string; address: string };

export default function CartPageClient() {
  const { items, updateQuantity, removeItem, subtotal, deliveryFee, total, clearCart } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderRef, setOrderRef] = useState("");
  const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: ""
  });

  async function handleDownloadPDF() {
    const currentDate = new Date().toLocaleDateString("sw-TZ", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const initials = getInitials(BRAND.name);
    doc.setFillColor(59, 31, 43);
    doc.setDrawColor(176, 141, 87);
    doc.setLineWidth(0.6);
    doc.circle(20, 16, 8, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(251, 246, 241);
    doc.text(initials, 20, 18.5, { align: "center" });

    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(BRAND.name.toUpperCase(), 34, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Ankara Rasmi ya Mauzo (Invoice)", 34, 27);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(`Tarehe: ${currentDate}`, 196, 22, { align: "right" });
    doc.setTextColor(180, 83, 9);
    doc.text("Hali: Haijalipwa bado", 196, 28, { align: "right" });
    if (orderRef) {
      doc.setTextColor(100, 100, 100);
      doc.text(`Namba ya Order: ${orderRef}`, 196, 33, { align: "right" });
    }

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.8);
    doc.line(14, 38, 196, 38);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text("TAARIFA ZA MTEJA", 14, 46);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Jina: ${customerInfo.name}`, 14, 52);
    doc.text(`Simu: ${customerInfo.phone}`, 14, 58);
    doc.text(`Anuani: ${customerInfo.address}`, 14, 64);

    doc.setLineWidth(0.3);
    doc.line(14, 70, 196, 70);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text("MAELEZO YA BIDHAA", 14, 78);
    doc.text("BEI & JUMLA", 196, 78, { align: "right" });

    doc.setLineWidth(0.3);
    doc.line(14, 81, 196, 81);

    let startY = 89;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    orderedItems.forEach((item) => {
      const lineTotal = item.priceValue * item.quantity;
      doc.text(`${item.name}  (Idadi: ${item.quantity})`, 14, startY);
      doc.text(formatTZS(lineTotal), 196, startY, { align: "right" });
      startY += 10;
    });

    startY += 2;
    doc.line(14, startY, 196, startY);
    startY += 14;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(80, 40, 80);
    doc.text("JINSI YA KULIPIA (MENYU ZA MITANDAO)", 14, startY);
    startY += 3;
    doc.setDrawColor(215, 195, 205);
    doc.setLineWidth(0.3);
    doc.line(14, startY, 196, startY);
    startY += 10;

    const cardWidth = 182;
    const cardHeight = 30;
    const accentColor: [number, number, number] = [156, 79, 99];

    function drawPaymentCard(
      title: string,
      steps: string,
      account: string,
      y: number
    ) {
      doc.setFillColor(250, 245, 248);
      doc.roundedRect(14, y, cardWidth, cardHeight, 2, 2, "F");
      doc.setFillColor(...accentColor);
      doc.rect(14, y, 3, cardHeight, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(60, 30, 45);
      doc.text(title, 22, y + 9);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      doc.text(steps, 22, y + 17);
      doc.text(account, 22, y + 24);
    }

    drawPaymentCard(
      "1. M-PESA (VODACOM)",
      "Piga *150*00# -> Chagua 4: Lipa kwa M-Pesa",
      `Namba: ${PAYMENT_INFO.mpesaNumber}  (${PAYMENT_INFO.mpesaName})`,
      startY
    );
    startY += cardHeight + 8;

    drawPaymentCard(
      "2. TIGO PESA (TIGO)",
      "Piga *150*01# -> Chagua 4: Lipa na Tigo Pesa",
      `Namba: ${PAYMENT_INFO.tigopesaNumber}  (${PAYMENT_INFO.tigopesaName})`,
      startY
    );
    startY += cardHeight + 14;
    doc.setLineWidth(0.3);
    doc.line(14, startY, 196, startY);
    startY += 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(40, 40, 40);
    doc.text("Jumla Kuu ya Kulipa:", 14, startY);
    doc.text(formatTZS(orderTotal), 196, startY, { align: "right" });

    startY += 18;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Asante kwa kununua na ${BRAND.name}! Tafadhali tumia namba yako ya simu kama kumbukumbu ya muamala.`,
      105,
      startY,
      { align: "center" }
    );

    doc.save(`Invoice_MtunduCosmetics_${Date.now()}.pdf`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();

    if (name.length < 2 || phone.length < 7 || address.length < 5) {
      setStatus("error");
      setErrorMessage("Tafadhali jaza jina, namba ya simu, na anuani sahihi.");
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          items,
          subtotal,
          deliveryFee,
          total
        })
      });

      const result = (await response.json()) as { ok: boolean; error?: string; orderRef?: string };

      if (!response.ok || !result.ok) {
        setStatus("error");
        setErrorMessage(result.error ?? "Imeshindikana kutuma order yako. Jaribu tena baadaye.");
        return;
      }

      setOrderedItems(items);
      setOrderTotal(total);
      setOrderRef(result.orderRef ?? "");
      setCustomerInfo({ name, phone, address });
      clearCart();
      setStep("success");
    } catch {
      setStatus("error");
      setErrorMessage("Hitilafu ya mtandao. Hakikisha una internet kisha jaribu tena.");
    } finally {
      setStatus("idle");
    }
  }

  if (step === "success") {
    const currentDate = new Date().toLocaleDateString("sw-TZ", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-plum/10 bg-white p-8 text-center">
        <h3 className="font-display text-2xl font-semibold text-plum">
          Asante! Order yako imepokelewa.
        </h3>
        {orderRef && (
          <p className="mt-1 text-sm font-medium text-rose-dark">Namba ya Order: {orderRef}</p>
        )}
        <p className="mt-2 text-sm text-charcoal/70">
          Tafadhali tumia maelezo ya invoice hii hapa chini kukamilisha malipo.
        </p>

        <div className="mt-6 space-y-5 rounded-2xl border border-plum/20 bg-plum/5 p-6 text-left">
          <div className="flex items-start justify-between border-b border-plum/10 pb-4">
            <div>
              <h4 className="text-lg font-bold text-plum">{BRAND.name}</h4>
              <p className="text-xs text-charcoal/60">Ankara Rasmi ya Mauzo (Invoice)</p>
            </div>
            <div className="space-y-1 text-right text-xs text-charcoal/70">
              <p>
                <strong>Tarehe:</strong> {currentDate}
              </p>
              <p className="font-medium text-plum">Hali: Haijalipwa bado</p>
            </div>
          </div>

          <div className="space-y-2 border-b border-plum/10 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-plum">
              Taarifa za Mteja:
            </p>
            <p className="text-sm text-charcoal/80">
              <strong>Jina:</strong> {customerInfo.name}
            </p>
            <p className="text-sm text-charcoal/80">
              <strong>Simu:</strong> {customerInfo.phone}
            </p>
            <p className="text-sm text-charcoal/80">
              <strong>Anuani:</strong> {customerInfo.address}
            </p>
          </div>

          <div className="space-y-2 border-b border-plum/10 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-plum">
              Bidhaa Ulizonunua:
            </p>
            <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
              {orderedItems.map((item) => (
                <div key={item.slug} className="flex justify-between text-sm">
                  <span>
                    {item.name} (Idadi: {item.quantity})
                  </span>
                  <span>{formatTZS(item.priceValue * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-b border-plum/10 pb-4 text-xs text-charcoal/80">
            <p className="font-semibold uppercase tracking-wider text-plum">
              Jinsi ya Kulipia (Menyu za Mitandao):
            </p>

            <div className="space-y-1 rounded-xl border border-plum/10 bg-white p-3">
              <p className="font-semibold text-plum">1. M-Pesa (Vodacom):</p>
              <p>Piga: *150*00#</p>
              <p>
                Chagua 4 (Lipa kwa M-Pesa) -&gt; Weka Namba:{" "}
                <strong>{PAYMENT_INFO.mpesaNumber}</strong> ({PAYMENT_INFO.mpesaName})
              </p>
            </div>

            <div className="space-y-1 rounded-xl border border-plum/10 bg-white p-3">
              <p className="font-semibold text-plum">2. Tigo Pesa (Tigo):</p>
              <p>Piga: *150*01#</p>
              <p>
                Chagua 4 (Lipa na Tigo Pesa) -&gt; Weka Namba:{" "}
                <strong>{PAYMENT_INFO.tigopesaNumber}</strong> ({PAYMENT_INFO.tigopesaName})
              </p>
            </div>

            <p className="pt-1 text-[11px] italic text-charcoal/60">
              Tafadhali tumia namba yako ya simu kama kumbukumbu ya muamala.
            </p>
          </div>

          <div className="flex justify-between pt-1 text-sm font-bold text-plum">
            <span>Jumla Kuu ya Kulipa:</span>
            <span>{formatTZS(orderTotal)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadPDF}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-plum py-3 text-sm font-medium text-cream shadow-sm transition hover:bg-plum/90"
        >
          <span>Pakua Invoice (PDF)</span>
        </button>

        <div className="mt-6">
          <Link href="/bidhaa" className="text-sm font-medium text-plum hover:underline">
            Endelea Kununua
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-plum/10 p-8 text-center">
        <p className="text-charcoal/70">Kikapu chako ni tupu kwa sasa.</p>
        <Link href="/bidhaa" className="btn-primary mt-6 inline-flex">
          Angalia Bidhaa
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        {items.map((item) => (
          <div
            key={item.slug}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-plum/10 p-5"
          >
            <div>
              <p className="font-display font-semibold text-plum">{item.name}</p>
              <p className="text-sm text-charcoal/60">{formatTZS(item.priceValue)} kila moja</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-plum/20 text-plum"
                aria-label="Punguza idadi"
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-plum/20 text-plum"
                aria-label="Ongeza idadi"
              >
                +
              </button>
            </div>

            <p className="font-semibold text-plum">{formatTZS(item.priceValue * item.quantity)}</p>

            <button
              type="button"
              onClick={() => removeItem(item.slug)}
              className="text-xs font-medium text-rose-dark underline"
            >
              Ondoa
            </button>
          </div>
        ))}
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-3xl border border-plum/10 p-6 sm:p-8">
          <h3 className="font-display text-lg font-semibold text-plum">Muhtasari</h3>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-charcoal/70">
              <span>Jumla ya Bidhaa</span>
              <span>{formatTZS(subtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal/70">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? "Bure" : formatTZS(deliveryFee)}</span>
            </div>
            {deliveryFee > 0 && (
              <p className="text-xs text-rose-dark">
                Nunua zaidi ya {formatTZS(CART_CONFIG.freeDeliveryThreshold)} upate delivery bure.
              </p>
            )}
            <div className="flex justify-between border-t border-plum/10 pt-3 font-semibold text-plum">
              <span>Jumla Kuu</span>
              <span>{formatTZS(total)}</span>
            </div>
          </div>

          {step === "cart" && (
            <button type="button" onClick={() => setStep("form")} className="btn-primary mt-6 w-full">
              Endelea na Order
            </button>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-plum">
                  Jina Kamili
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  className="w-full rounded-xl border border-plum/20 bg-cream px-4 py-2.5 text-sm outline-none focus:border-plum"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-plum">
                  Namba ya Simu
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="w-full rounded-xl border border-plum/20 bg-cream px-4 py-2.5 text-sm outline-none focus:border-plum"
                  placeholder="07XX XXX XXX"
                />
              </div>

              <div>
                <label htmlFor="address" className="mb-1 block text-sm font-medium text-plum">
                  Anuani ya Kufikisha
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={3}
                  className="w-full rounded-xl border border-plum/20 bg-cream px-4 py-2.5 text-sm outline-none focus:border-plum"
                  placeholder="Mtaa, Kata, Jiji"
                />
              </div>

              <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
                {status === "loading" ? "Inatuma..." : "Thibitisha Order"}
              </button>

              {status === "error" && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
