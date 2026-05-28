import { NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createAdminSessionCookieValue,
} from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = await verifyAdminCredentials(email, password);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Invalid admin credentials." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: "calenzo_admin_session",
    value: createAdminSessionCookieValue(user.id),
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
