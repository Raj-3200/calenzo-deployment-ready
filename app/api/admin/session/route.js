import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json(
      { ok: false, user: null, expires_at: null },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      clinicId: session.user.clinicId,
      status: session.user.status,
    },
  });
}
