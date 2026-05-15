import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import type { CartItem } from "@/types/database";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = checkRateLimit(`cart-sync:${ip}`, 20, 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: { session_id: string; email: string; items: CartItem[]; country?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { session_id, email, items, country = "NZ" } = body;
  if (!session_id || !email || !Array.isArray(items)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await supabase.from("cart_sessions").upsert(
    {
      session_id,
      email,
      items: JSON.stringify(items),
      country,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id" }
  );

  return NextResponse.json({ ok: true });
}
