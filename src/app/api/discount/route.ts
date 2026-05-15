import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
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

  const supabase = await createServiceClient();
  const { data, error } = await supabase.rpc("apply_discount_code", {
    p_code: code.trim(),
    p_subtotal_cents: subtotal_cents,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = data?.[0];
  if (!result) {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    discount_cents: result.discount_cents,
    code_id: result.code_id,
  });
}
