import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ReviewPayload = {
  name: string;
  rating: number;
  message: string;
};

function isValidPayload(data: unknown): data is ReviewPayload {
  if (typeof data !== "object" || data === null) return false;
  const value = data as Record<string, unknown>;
  return (
    typeof value.name === "string" &&
    value.name.trim().length > 1 &&
    typeof value.rating === "number" &&
    value.rating >= 1 &&
    value.rating <= 5 &&
    typeof value.message === "string" &&
    value.message.trim().length > 4
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
      { ok: false, error: "Tafadhali jaza jina, nyota, na ujumbe wenye maana." },
      { status: 400 }
    );
  }

  const { name, rating, message } = body;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Sehemu ya maoni bado haijasanidiwa kikamilifu. Tafadhali jaribu tena baadaye."
      },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { error: insertError } = await supabase
    .from("reviews")
    .insert({ name, rating, message, approved: false });

  if (insertError) {
    return NextResponse.json(
      { ok: false, error: "Imeshindikana kutuma maoni yako. Jaribu tena baadaye." },
      { status: 500 }
    );
  }

  // Jaribu kutuma arifa ya email - kama email haijasanidiwa, hii haitazuia
  // kutuma maoni yenyewe (yameshahifadhiwa juu kabla ya hapa)
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const projectRef = supabaseUrl.replace("https://", "").split(".")[0];

  if (smtpHost && smtpPort && smtpUser && smtpPass && toEmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465,
        auth: { user: smtpUser, pass: smtpPass }
      });

      const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
      const approveLink = `https://supabase.com/dashboard/project/${projectRef}/editor/reviews`;

      await transporter.sendMail({
        from: `"Maoni Mapya - Nia Cosmetics" <${smtpUser}>`,
        to: toEmail,
        subject: `Maoni mapya kutoka kwa ${name} (${stars})`,
        text: `Jina: ${name}\nNyota: ${stars}\n\nUjumbe:\n${message}\n\nBonyeza hapa kuidhinisha: ${approveLink}`,
        html: `
          <p><strong>Jina:</strong> ${escapeHtml(name)}</p>
          <p><strong>Nyota:</strong> ${stars}</p>
          <p><strong>Ujumbe:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
          <p><a href="${approveLink}">Bonyeza hapa kuidhinisha maoni haya</a></p>
        `
      });
    } catch (emailError) {
      // Maoni tayari yamehifadhiwa; email kutofanikiwa hakuzuii mchakato
      console.error("Imeshindikana kutuma email ya arifa:", emailError);
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
