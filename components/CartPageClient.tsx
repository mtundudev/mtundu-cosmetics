"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { API_BASE_URL, getApiError } from "@/lib/api";
import { useCart, type CartItem } from "@/lib/cart-context";
import { CART_CONFIG, PAYMENT_INFO, formatTZS } from "@/lib/cart-config";
import { BRAND } from "@/lib/nav";
import { getInitials } from "@/lib/logo";
import { useSitePreferences } from "@/lib/preferences";

type Step = "cart" | "form" | "success";
type Status = "idle" | "loading" | "error";
type PaymentStatus = "unpaid" | "pending" | "paid" | "cancelled" | "failed";
type CustomerInfo = { name: string; phone: string; address: string; email: string };
type OrderItem = Pick<CartItem, "slug" | "name" | "priceValue" | "originalPriceValue" | "discountPercent" | "quantity">;

export default function CartPageClient() {
  const { t, language } = useSitePreferences();
  const { items, updateQuantity, removeItem, subtotal, deliveryFee, total, clearCart } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [orderSubtotal, setOrderSubtotal] = useState(0);
  const [orderDeliveryFee, setOrderDeliveryFee] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderRef, setOrderRef] = useState("");
  const [orderedItems, setOrderedItems] = useState<OrderItem[]>([]);
  const [onlineEnabled, setOnlineEnabled] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"manual" | "online">("manual");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [paymentToken, setPaymentToken] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [restoringOrder, setRestoringOrder] = useState(false);
  const [paymentConfigError, setPaymentConfigError] = useState("");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    email: ""
  });

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/orders/payment-config`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(getApiError(result, "Imeshindikana kupata njia za malipo."));
        if (!active) return;
        setOnlineEnabled(result.online_enabled === true);
        setTestMode(result.test_mode === true);
      })
      .catch((error: unknown) => {
        if (active) {
          setPaymentConfigError(
            error instanceof Error ? error.message : "Imeshindikana kupata njia za malipo."
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("order");
    if (!ref) return;
    let storedOrder: string | null;
    try {
      storedOrder = window.sessionStorage.getItem(`mtundu-order:${ref}`);
    } catch {
      setPaymentError("Hifadhi ya kivinjari imezimwa; ankara haiwezi kurejeshwa baada ya checkout.");
      return;
    }
    if (!storedOrder) return;

    setRestoringOrder(true);
    try {
      const saved = JSON.parse(storedOrder) as {
        orderRef?: string;
        accessToken?: string;
        subtotal?: number;
        deliveryFee?: number;
        total?: number;
        items?: OrderItem[];
        customerInfo?: CustomerInfo;
        paymentMethod?: "manual" | "online";
      };
      const savedToken = saved.accessToken;
      if (
        saved.orderRef !== ref ||
        typeof savedToken !== "string" ||
        !Array.isArray(saved.items) ||
        !saved.customerInfo ||
        typeof saved.total !== "number"
      ) {
        throw new Error("Taarifa za ankara hazijakamilika. Tafadhali wasiliana nasi.");
      }
      const restoredSubtotal = typeof saved.subtotal === "number"
        ? saved.subtotal
        : saved.items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
      const restoredDeliveryFee = typeof saved.deliveryFee === "number"
        ? saved.deliveryFee
        : Math.max(saved.total - restoredSubtotal, 0);
      setOrderRef(ref);
      setPaymentToken(savedToken);
      setOrderSubtotal(restoredSubtotal);
      setOrderDeliveryFee(restoredDeliveryFee);
      setOrderTotal(saved.total);
      setOrderedItems(saved.items);
      setCustomerInfo(saved.customerInfo);
      setPaymentMethod(saved.paymentMethod === "online" ? "online" : "manual");
      setStep("success");
      if (params.get("payment") === "cancelled") setPaymentStatus("cancelled");
      void (async () => {
        setPaymentBusy(true);
        try {
          const query = new URLSearchParams({ access_token: savedToken });
          const response = await fetch(
            `${API_BASE_URL}/orders/${encodeURIComponent(ref)}/payment-status?${query.toString()}`
          );
          const result = await response.json();
          if (!response.ok) {
            throw new Error(getApiError(result, "Imeshindikana kuthibitisha malipo."));
          }
          setPaymentStatus(result.payment_status as PaymentStatus);
          setTestMode(result.test_mode === true);
        } catch (error) {
          setPaymentError(
            error instanceof Error ? error.message : "Imeshindikana kuthibitisha malipo."
          );
        } finally {
          setPaymentBusy(false);
        }
      })();
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "Imeshindikana kufungua ankara ya oda."
      );
    } finally {
      setRestoringOrder(false);
    }
  }, []);

  async function refreshPaymentStatus(ref = orderRef, token = paymentToken) {
    if (!ref || !token) return;
    setPaymentBusy(true);
    setPaymentError("");
    try {
      const query = new URLSearchParams({ access_token: token });
      const response = await fetch(
        `${API_BASE_URL}/orders/${encodeURIComponent(ref)}/payment-status?${query.toString()}`
      );
      const result = await response.json();
      if (!response.ok) throw new Error(getApiError(result, "Imeshindikana kuthibitisha malipo."));
      setPaymentStatus(result.payment_status as PaymentStatus);
      setTestMode(result.test_mode === true);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Imeshindikana kuthibitisha malipo.");
    } finally {
      setPaymentBusy(false);
    }
  }

  async function completeTestPayment() {
    setPaymentBusy(true);
    setPaymentError("");
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderRef)}/test-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: paymentToken })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(getApiError(result, "Imeshindikana kukamilisha malipo ya majaribio."));
      setPaymentStatus("paid");
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "Imeshindikana kukamilisha malipo ya majaribio."
      );
    } finally {
      setPaymentBusy(false);
    }
  }

  const whatsappOrderMessage = [
    `🌸 *${BRAND.name.toUpperCase()}*`,
    language === "sw" ? "*TAARIFA ZA ODA MPYA*" : "*NEW ORDER DETAILS*",
    "━━━━━━━━━━━━━━━━━━━━",
    `🧾 *${language === "sw" ? "Namba ya oda" : "Order reference"}:* ${orderRef}`,
    `👤 *${language === "sw" ? "Jina" : "Name"}:* ${customerInfo.name}`,
    `📞 *${language === "sw" ? "Simu" : "Phone"}:* ${customerInfo.phone}`,
    `📍 *${language === "sw" ? "Anuani" : "Address"}:* ${customerInfo.address}`,
    ...(customerInfo.email ? [`📧 *Email:* ${customerInfo.email}`] : []),
    "",
    `🛍️ *${language === "sw" ? "BIDHAA | IDADI | JUMLA" : "ITEMS | QTY | TOTAL"}*`,
    "────────────────────",
    ...orderedItems.map((item, index) =>
      `${index + 1}. *${item.name}*\n   ${item.quantity} × ${formatTZS(item.priceValue)}${item.discountPercent ? ` (-${item.discountPercent}%)` : ""} = *${formatTZS(item.priceValue * item.quantity)}*`
    ),
    "━━━━━━━━━━━━━━━━━━━━",
    `🧮 ${language === "sw" ? "Bidhaa" : "Subtotal"}: ${formatTZS(orderSubtotal)}`,
    `🚚 ${language === "sw" ? "Uwasilishaji" : "Delivery"}: ${orderDeliveryFee === 0 ? (language === "sw" ? "Bure" : "Free") : formatTZS(orderDeliveryFee)}`,
    `💰 *${language === "sw" ? "JUMLA KUU" : "GRAND TOTAL"}: ${formatTZS(orderTotal)}*`,
    `💳 ${language === "sw" ? "Malipo" : "Payment"}: ${paymentMethod === "online" ? (testMode ? "Selcom TEST" : "Selcom") : (language === "sw" ? "Maelekezo ya ankara" : "Invoice instructions")}`,
    "",
    language === "sw" ? "Asante kwa kuagiza kwetu!" : "Thank you for your order!"
  ].join("\n");
  const whatsappOrderUrl = `https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappOrderMessage)}`;

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
    const invoiceStatus = {
      unpaid: "Haijalipwa",
      pending: "Inasubiri malipo",
      paid: "Imelipwa",
      cancelled: "Malipo yameghairiwa",
      failed: "Malipo yameshindwa"
    }[paymentStatus];
    doc.setTextColor(paymentStatus === "paid" ? 22 : 180, paymentStatus === "paid" ? 101 : 83, 9);
    doc.text(`Hali: ${invoiceStatus}`, 196, 28, { align: "right" });
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
    if (customerInfo.email) doc.text(`Barua pepe: ${customerInfo.email}`, 14, 69);

    doc.setLineWidth(0.3);
    doc.line(14, 74, 196, 74);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text("MAELEZO YA BIDHAA", 14, 82);
    doc.text("BEI & JUMLA", 196, 82, { align: "right" });

    doc.setLineWidth(0.3);
    doc.line(14, 85, 196, 85);

    let startY = 93;
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
    doc.text(paymentMethod === "online" ? "MALIPO YA MTANDAONI" : "JINSI YA KULIPIA (MENYU ZA MITANDAO)", 14, startY);
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

    if (paymentMethod === "manual") {
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
    } else {
      drawPaymentCard(
        testMode ? "SELCOM TEST (HAKUNA FEDHA HALISI)" : "SELCOM",
        `Hali ya malipo: ${invoiceStatus}`,
        paymentStatus === "paid" ? `Rejea: ${orderRef}` : "Tumia ukurasa wa checkout wa Selcom kukamilisha malipo.",
        startY
      );
      startY += cardHeight + 14;
    }
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

    doc.save(`Invoice_OmegaCosmetics_${Date.now()}.pdf`);
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
    const email = String(formData.get("email") ?? "").trim();

    if (name.length < 2 || phone.length < 7 || address.length < 5) {
      setStatus("error");
      setErrorMessage("Tafadhali jaza jina, namba ya simu, na anuani sahihi.");
      return;
    }
    if (paymentMethod === "online" && !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Weka barua pepe sahihi kwa malipo ya mtandaoni.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          email: email || null,
          items,
          subtotal,
          deliveryFee,
          total
        })
      });

      const result = (await response.json()) as {
        ok: boolean;
        orderRef?: string;
        accessToken?: string;
        subtotal?: number;
        deliveryFee?: number;
        total?: number;
        items?: OrderItem[];
      };

      if (!response.ok || !result.ok) {
        setStatus("error");
        setErrorMessage(
          getApiError(result, "Imeshindikana kutuma order yako. Jaribu tena baadaye.")
        );
        return;
      }

      const createdRef = result.orderRef ?? "";
      const accessToken = result.accessToken ?? "";
      const serverItems = Array.isArray(result.items) ? result.items : items;
      const serverSubtotal = typeof result.subtotal === "number"
        ? result.subtotal
        : serverItems.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
      const serverDeliveryFee = typeof result.deliveryFee === "number"
        ? result.deliveryFee
        : Math.max(total - serverSubtotal, 0);
      const serverTotal = typeof result.total === "number" ? result.total : total;
      const customer = { name, phone, address, email };
      setOrderedItems(serverItems);
      setOrderSubtotal(serverSubtotal);
      setOrderDeliveryFee(serverDeliveryFee);
      setOrderTotal(serverTotal);
      setOrderRef(createdRef);
      setPaymentToken(accessToken);
      setPaymentStatus(paymentMethod === "online" ? "pending" : "unpaid");
      setCustomerInfo(customer);
      clearCart();
      setStep("success");
      let savedForReturn = false;
      if (createdRef && accessToken) {
        try {
          window.sessionStorage.setItem(
            `mtundu-order:${createdRef}`,
            JSON.stringify({
              orderRef: createdRef,
              accessToken,
              subtotal: serverSubtotal,
              deliveryFee: serverDeliveryFee,
              total: serverTotal,
              items: serverItems,
              customerInfo: customer,
              paymentMethod
            })
          );
          savedForReturn = true;
        } catch {
          if (paymentMethod === "online") {
            setPaymentError(
              "Oda imehifadhiwa, lakini kivinjari hakiruhusu kurejesha ankara baada ya malipo."
            );
          }
        }
      }

      if (paymentMethod === "online") {
        if (!testMode && !savedForReturn) return;
        try {
          const checkoutResponse = await fetch(
            `${API_BASE_URL}/orders/${encodeURIComponent(createdRef)}/checkout`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ access_token: accessToken, email })
            }
          );
          const checkout = await checkoutResponse.json();
          if (!checkoutResponse.ok) {
            throw new Error(getApiError(checkout, "Imeshindikana kuanzisha malipo ya mtandaoni."));
          }
          if (checkout.test_mode === true) {
            setTestMode(true);
            setPaymentStatus("pending");
          } else if (typeof checkout.checkout_url === "string") {
            window.location.assign(checkout.checkout_url);
          }
        } catch (checkoutError) {
          setPaymentError(
            checkoutError instanceof Error
              ? checkoutError.message
              : "Oda imehifadhiwa, lakini checkout ya malipo haikuanza."
          );
        }
      }
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
    const paymentStatusLabel = {
      unpaid: language === "sw" ? "Haijalipwa" : "Unpaid",
      pending: language === "sw" ? "Inasubiri malipo" : "Payment pending",
      paid: language === "sw" ? "Imelipwa" : "Paid",
      cancelled: language === "sw" ? "Malipo yameghairiwa" : "Payment cancelled",
      failed: language === "sw" ? "Malipo yameshindwa" : "Payment failed"
    }[paymentStatus];

    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-plum/10 bg-white p-8 text-center">
        <h3 className="font-display text-2xl font-semibold text-plum">
          {t("page.orderSuccess")}
        </h3>
        {orderRef && (
          <p className="mt-1 text-sm font-medium text-rose-dark">{t("page.orderReference")}: {orderRef}</p>
        )}
        <p className="mt-2 text-sm text-charcoal/70">
          {t("page.orderInvoiceHint")}
        </p>

        <div className="mt-6 space-y-5 rounded-2xl border border-plum/20 bg-plum/5 p-6 text-left">
          <div className="flex items-start justify-between border-b border-plum/10 pb-4">
            <div>
              <h4 className="text-lg font-bold text-plum">{BRAND.name}</h4>
              <p className="text-xs text-charcoal/60">{t("page.orderInvoice")}</p>
            </div>
            <div className="space-y-1 text-right text-xs text-charcoal/70">
              <p>
                <strong>{t("page.orderDate")}:</strong> {currentDate}
              </p>
              <p className={`font-medium ${paymentStatus === "paid" ? "text-green-700" : "text-plum"}`}>
                {paymentStatusLabel}
              </p>
            </div>
          </div>

          <div className="space-y-2 border-b border-plum/10 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-plum">
              {t("page.orderCustomer")}:
            </p>
            <p className="text-sm text-charcoal/80">
              <strong>{t("page.orderNameLabel")}:</strong> {customerInfo.name}
            </p>
            <p className="text-sm text-charcoal/80">
              <strong>{t("page.orderPhoneLabel")}:</strong> {customerInfo.phone}
            </p>
            <p className="text-sm text-charcoal/80">
              <strong>{t("page.orderAddressLabel")}:</strong> {customerInfo.address}
            </p>
            {customerInfo.email && (
              <p className="text-sm text-charcoal/80">
                <strong>{language === "sw" ? "Barua pepe" : "Email"}:</strong> {customerInfo.email}
              </p>
            )}
          </div>

          <div className="space-y-2 border-b border-plum/10 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-plum">
              {t("page.orderProducts")}:
            </p>
            <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
              {orderedItems.map((item) => (
                <div key={item.slug} className="flex justify-between text-sm">
                  <span>
                    {item.name} ({t("page.orderQuantity")}: {item.quantity})
                  </span>
                  <span className="text-right">
                    {item.discountPercent ? (
                      <span className="mr-2 text-xs text-rose-dark">-{item.discountPercent}%</span>
                    ) : null}
                    {formatTZS(item.priceValue * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-b border-plum/10 pb-4 text-xs text-charcoal/80">
            <p className="font-semibold uppercase tracking-wider text-plum">
              {t("page.orderPayment")}:
            </p>

            {paymentMethod === "manual" ? (
              <>
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
                  {t("page.orderPaymentReminder")}
                </p>
              </>
            ) : (
              <div className="space-y-3 rounded-xl border border-plum/10 bg-white p-4">
                <p className="font-semibold text-plum">
                  {testMode ? "Selcom TEST" : "Selcom"} · {paymentStatusLabel}
                </p>
                {testMode && (
                  <p role="status" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                    {language === "sw"
                      ? "Hali ya majaribio tu: hakuna fedha halisi zitakazohamishwa."
                      : "Test mode only: no real money will be transferred."}
                  </p>
                )}
                {testMode && paymentStatus === "pending" && (
                  <button
                    type="button"
                    onClick={() => void completeTestPayment()}
                    disabled={paymentBusy}
                    className="w-full rounded-xl bg-plum px-4 py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
                  >
                    {paymentBusy
                      ? (language === "sw" ? "Inachakata..." : "Processing...")
                      : (language === "sw"
                        ? "Kamilisha malipo ya majaribio"
                        : "Complete test payment")}
                  </button>
                )}
                {(!testMode || paymentStatus !== "paid") && (
                  <button
                    type="button"
                    onClick={() => void refreshPaymentStatus()}
                    disabled={paymentBusy}
                    className="w-full rounded-xl border border-plum/20 px-4 py-2.5 text-sm font-semibold text-plum disabled:opacity-60"
                  >
                    {language === "sw" ? "Angalia hali ya malipo" : "Refresh payment status"}
                  </button>
                )}
              </div>
            )}
            {paymentError && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {paymentError}
              </p>
            )}
          </div>

          <div className="flex justify-between pt-1 text-sm font-bold text-plum">
            <span>{t("page.orderTotal")}:</span>
            <span>{formatTZS(orderTotal)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadPDF}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-plum py-3 text-sm font-medium text-cream shadow-sm transition hover:bg-plum/90"
        >
          <span>{t("page.orderDownloadInvoice")}</span>
        </button>

        <p className="mt-5 text-sm text-charcoal/70">{t("whatsapp.orderHint")}</p>
        <a
          href={whatsappOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1fb95a]"
        >
          {t("whatsapp.order")}
        </a>

        <div className="mt-6">
          <Link href="/bidhaa" className="text-sm font-medium text-plum hover:underline">
            {t("page.orderContinue")}
          </Link>
        </div>
      </div>
    );
  }

  if (restoringOrder) {
    return (
      <div role="status" className="rounded-3xl border border-plum/10 p-8 text-center text-charcoal/70">
        {language === "sw" ? "Inafungua ankara yako..." : "Restoring your invoice..."}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-plum/10 p-8 text-center">
        <p className="text-charcoal/70">{t("page.orderEmpty")}</p>
        {paymentError && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {paymentError}
          </p>
        )}
        <Link href="/bidhaa" className="btn-primary mt-6 inline-flex">
          {t("nav.products")}
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
              <p className="text-sm text-charcoal/60">
                {formatTZS(item.priceValue)} {language === "sw" ? "kila moja" : "each"}
                {item.discountPercent ? (
                  <>
                    {" "}
                    <span className="font-semibold text-rose-dark">-{item.discountPercent}%</span>
                    {" "}
                    <span className="text-xs line-through">{formatTZS(item.originalPriceValue ?? item.priceValue)}</span>
                  </>
                ) : null}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-plum/20 text-plum"
                aria-label={language === "sw" ? "Punguza idadi" : "Decrease quantity"}
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-plum/20 text-plum"
                aria-label={language === "sw" ? "Ongeza idadi" : "Increase quantity"}
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
              {t("page.orderRemove")}
            </button>
          </div>
        ))}
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-3xl border border-plum/10 p-6 sm:p-8">
          <h3 className="font-display text-lg font-semibold text-plum">{t("page.orderSummary")}</h3>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-charcoal/70">
              <span>{t("page.orderItems")}</span>
              <span>{formatTZS(subtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal/70">
              <span>{t("page.orderDelivery")}</span>
              <span>{deliveryFee === 0 ? t("page.orderFree") : formatTZS(deliveryFee)}</span>
            </div>
            {deliveryFee > 0 && (
              <p className="text-xs text-rose-dark">
                {t("page.orderFreeDelivery")} {formatTZS(CART_CONFIG.freeDeliveryThreshold)} {t("page.orderFreeDeliveryEnd")}
              </p>
            )}
            <div className="flex justify-between border-t border-plum/10 pt-3 font-semibold text-plum">
              <span>{t("page.orderTotal")}</span>
              <span>{formatTZS(total)}</span>
            </div>
          </div>

          {step === "cart" && (
            <button type="button" onClick={() => setStep("form")} className="btn-primary mt-6 w-full">
              {t("page.orderContinueCheckout")}
            </button>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {onlineEnabled && (
                <fieldset className="space-y-2 rounded-xl border border-plum/15 p-4">
                  <legend className="px-1 text-sm font-semibold text-plum">
                    {language === "sw" ? "Chagua njia ya malipo" : "Choose a payment method"}
                  </legend>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-charcoal/80">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === "manual"}
                      onChange={() => setPaymentMethod("manual")}
                    />
                    <span>
                      {language === "sw" ? "Lipa kwa maelekezo ya ankara" : "Pay using invoice instructions"}
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-charcoal/80">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                    />
                    <span>
                      {testMode ? "Selcom TEST" : "Pay online with Selcom"}
                      {testMode && (
                        <span className="mt-1 block text-xs text-amber-800">
                          {language === "sw"
                            ? "Majaribio pekee; hakuna fedha halisi zitakazohamishwa."
                            : "Test only; no real money will be transferred."}
                        </span>
                      )}
                    </span>
                  </label>
                </fieldset>
              )}
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-plum">
                  {t("page.orderName")}
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
                  {t("page.orderPhone")}
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
                  {t("page.orderAddress")}
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={3}
                  className="w-full rounded-xl border border-plum/20 bg-cream px-4 py-2.5 text-sm outline-none focus:border-plum"
                  placeholder={t("page.orderAddressHint")}
                />
              </div>

              {paymentMethod === "online" && (
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-plum">
                    {language === "sw" ? "Barua pepe" : "Email"}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-plum/20 bg-cream px-4 py-2.5 text-sm outline-none focus:border-plum"
                  />
                </div>
              )}

              <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
                {status === "loading"
                  ? t("page.orderSending")
                  : (paymentMethod === "online"
                    ? (language === "sw" ? "Endelea kulipia" : "Continue to payment")
                    : t("page.orderConfirm"))}
              </button>

              {paymentConfigError && (
                <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {paymentConfigError}
                </p>
              )}

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
