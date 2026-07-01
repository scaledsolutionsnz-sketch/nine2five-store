import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

// Create a matching % discount code for one ambassador, or all active ambassadors.
// The code is named the SAME as the affiliate's referral_code, so the webhook's
// code-based attribution credits them when a customer types it at checkout.
// Idempotent: ambassadors that already have a code with that name are skipped.
export async function POST(req: NextRequest) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as { affiliate_id?: string; percentage?: number };
  const pct = body.percentage ?? 10;
  if (pct < 1 || pct > 100) {
    return NextResponse.json({ error: "Percentage must be 1–100" }, { status: 400 });
  }

  const service = createServiceRoleClient();

  // Target: one affiliate, or every active (non-archived) ambassador.
  let query = service.from("affiliates").select("id, referral_code, status").is("archived_at", null);
  query = body.affiliate_id ? query.eq("id", body.affiliate_id) : query.eq("status", "active");
  const { data: affiliates, error: affErr } = await query;
  if (affErr) return NextResponse.json({ error: affErr.message }, { status: 500 });
  if (!affiliates?.length) return NextResponse.json({ created: [], skipped: [], error: "No matching ambassadors" });

  const created: string[] = [];
  const skipped: string[] = [];

  for (const aff of affiliates) {
    const code = aff.referral_code.toUpperCase().trim();

    // Skip if a code with this name already exists (case-insensitive).
    const { data: existing } = await service
      .from("discount_codes").select("id").ilike("code", aff.referral_code).maybeSingle();
    if (existing) { skipped.push(code); continue; }

    const { error: insErr } = await service.from("discount_codes").insert({
      code,
      type: "percentage",
      value: pct,
      min_order_cents: 0,
      max_uses: null,
      expires_at: null,
      active: true,
    });
    if (insErr) { skipped.push(code); continue; } // 23505 dup or other → treat as skip
    created.push(code);
  }

  await writeAuditLog({
    action: "affiliate.discount_codes_generated",
    entity: "discount_codes",
    entityId: body.affiliate_id ?? "bulk",
    actor: user.email!,
    details: { percentage: pct, created, skipped },
    request: req,
  });

  return NextResponse.json({ created, skipped, percentage: pct });
}
