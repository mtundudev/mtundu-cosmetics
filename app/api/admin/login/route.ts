import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ombi halikusomeka." }, { status: 400 });
  }

  const password =
    typeof body === "object" && body !== null && "password" in body
      ? String((body as Record<string, unknown>).password ?? "")
      : "";

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { ok: false, error: "Admin password bado haijasanidiwa. Tazama .env.local" },
      { status: 500 }
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json({ ok: false, error: "Password sio sahihi." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set("admin_session", "authenticated", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
