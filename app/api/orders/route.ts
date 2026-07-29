import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type OrderItem = {
  slug: string;
  name: string;
  priceValue: number;
  quantity: number;
};

type OrderPayload = {
  name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

function isValidPayload(data: unknown): data is OrderPayload {
  if (typeof data !== "object" || data === null) return false;
  const value = data as Record<string, unknown>;
  return (
    typeof value.name === "string" &&
    value.name.trim().length > 1 &&
    typeof value.phone === "string" &&
    value.phone.trim().length > 6 &&
    typeof value.address === "string" &&
    value.address.trim().length > 4 &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    typeof value.total === "number"
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ombi halikusomeka. Jaribu tena." },
      { status: 400 }
    );
  }

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { ok: false, error: "Tafadhali jaza jina, simu, na anuani sahihi." },
      { status: 400 }
    );
  }

  const { name, phone, address, items, subtotal, deliveryFee, total } = body;

  const orderRef = generateOrderRef();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      await supabase.from("orders").insert({
        order_ref: orderRef,
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        items,
        subtotal,
        delivery_fee: deliveryFee,
        total
      });
    } catch (dbError) {
      // Order bado inaendelea hata kama kuhifadhi kwenye database kumeshindikana;
      // email bado itatumwa chini
      console.error("Imeshindikana kuhifadhi order kwenye database:", dbError);
    }
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !toEmail) {
    // Bila SMTP, bado tunakubali order (mteja ataona taarifa za malipo),
    // lakini hakuna arifa itakayotumwa kwako
    return NextResponse.json({ ok: true, orderRef }, { status: 200 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });

    const itemsList = items
      .map((item) => `${item.name} x${item.quantity} = TZS ${(item.priceValue * item.quantity).toLocaleString("en-US")}`)
      .join("\n");

    const itemsHtml = items
      .map(
        (item) =>
          `<li>${escapeHtml(item.name)} x${item.quantity} = TZS ${(item.priceValue * item.quantity).toLocaleString("en-US")}</li>`
      )
      .join("");

    await transporter.sendMail({
      from: `"Order Mpya - Nia Cosmetics" <${smtpUser}>`,
      to: toEmail,
      subject: `Order ${orderRef} kutoka kwa ${name} - TZS ${total.toLocaleString("en-US")}`,
      text: `Namba ya Order: ${orderRef}\nJina: ${name}\nSimu: ${phone}\nAnuani: ${address}\n\nBidhaa:\n${itemsList}\n\nJumla ya Bidhaa: TZS ${subtotal.toLocaleString("en-US")}\nDelivery: TZS ${deliveryFee.toLocaleString("en-US")}\nJumla Kuu: TZS ${total.toLocaleString("en-US")}`,
      html: `
        <p><strong>Namba ya Order:</strong> ${orderRef}</p>
        <p><strong>Jina:</strong> ${escapeHtml(name)}</p>
        <p><strong>Simu:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Anuani:</strong> ${escapeHtml(address)}</p>
        <p><strong>Bidhaa:</strong></p>
        <ul>${itemsHtml}</ul>
        <p><strong>Jumla ya Bidhaa:</strong> TZS ${subtotal.toLocaleString("en-US")}</p>
        <p><strong>Delivery:</strong> TZS ${deliveryFee.toLocaleString("en-US")}</p>
        <p><strong>Jumla Kuu:</strong> TZS ${total.toLocaleString("en-US")}</p>
      `
    });
  } catch (emailError) {
    console.error("Imeshindikana kutuma email ya order:", emailError);
  }

  return NextResponse.json({ ok: true, orderRef }, { status: 200 });
}

function generateOrderRef(): string {
  const datePart = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `NC-${datePart}-${randomPart}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
