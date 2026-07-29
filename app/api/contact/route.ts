import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

function isValidPayload(data: unknown): data is ContactPayload {
  if (typeof data !== "object" || data === null) return false;
  const value = data as Record<string, unknown>;
  return (
    typeof value.name === "string" &&
    value.name.trim().length > 1 &&
    typeof value.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email) &&
    typeof value.message === "string" &&
    value.message.trim().length > 5
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
      { ok: false, error: "Tafadhali jaza jina, barua pepe sahihi na ujumbe." },
      { status: 400 }
    );
  }

  const { name, email, phone, message } = body;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !toEmail) {
    console.error("SMTP haijasanidiwa: kagua environment variables.");
    return NextResponse.json(
      {
        ok: false,
        error:
          "Huduma ya barua pepe haijasanidiwa bado. Tafadhali wasiliana nasi kwa simu au WhatsApp."
      },
      { status: 500 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: `"Fomu ya Wavuti - Nia Cosmetics" <${smtpUser}>`,
      replyTo: email,
      to: toEmail,
      subject: `Ujumbe mpya kutoka kwa ${name}`,
      text: `Jina: ${name}\nBarua pepe: ${email}\nSimu: ${phone ?? "Haikutolewa"}\n\nUjumbe:\n${message}`,
      html: `
        <p><strong>Jina:</strong> ${escapeHtml(name)}</p>
        <p><strong>Barua pepe:</strong> ${escapeHtml(email)}</p>
        <p><strong>Simu:</strong> ${escapeHtml(phone ?? "Haikutolewa")}</p>
        <p><strong>Ujumbe:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      `
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Imeshindikana kutuma barua pepe:", error);
    return NextResponse.json(
      { ok: false, error: "Imeshindikana kutuma ujumbe. Jaribu tena baadaye." },
      { status: 500 }
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
