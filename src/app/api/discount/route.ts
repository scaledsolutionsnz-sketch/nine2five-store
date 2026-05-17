import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Public endpoint — validate a discount code at checkout
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = checkRateLimit(`discount_${ip}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const { code, subtotal_cents } = await req.json() as {
    code: string;
    subtotal_cents: number;
  };

  if (!code || typeof subtotal_cents !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: row, error } = await supabase
    .from("discount_codes")
    .select("id, type, value, min_order_cents, expires_at, max_uses, uses")
    .eq("active", true)
    .ilike("code", code.trim())
    .maybeSingle();

  if (error) {
    console.error("Discount lookup error:", JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!row) {
    return NextResponse.json({ error: "Invalid or expired discount code" }, { status: 400 });
  }

  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invalid or expired discount code" }, { status: 400 });
  }

  if (row.max_uses !== null && row.uses >= row.max_uses) {
    return NextResponse.json({ error: "Invalid or expired discount code" }, { status: 400 });
  }

  if (subtotal_cents < (row.min_order_cents ?? 0)) {
    const min = ((row.min_order_cents ?? 0) / 100).toFixed(2);
    return NextResponse.json({ error: `Minimum order of $${min} required` }, { status: 400 });
  }

  const isFreeShipping = row.type === "fixed" && row.value === 0;
  const discount_cents = isFreeShipping
    ? 0
    : row.type === "percentage"
      ? Math.floor(subtotal_cents * row.value / 100)
      : Math.min(row.value, subtotal_cents);

  return NextResponse.json({
    discount_cents,
    free_shipping: isFreeShipping,
    code_id: row.id,
  });
}
