import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = await createServiceClient();
  const [{ data, error }, clicksRes, convRes] = await Promise.all([
    supabase.from("affiliates").select("*").order("created_at", { ascending: false }),
    service.from("affiliate_clicks").select("affiliate_id"),
    service.from("affiliate_conversions").select("affiliate_id, commission_cents, status"),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Single source of truth: derive the displayed totals from the actual rows
  // rather than the cached counters (which can drift).
  const clicksByAff = new Map<string, number>();
  for (const c of clicksRes.data ?? []) {
    clicksByAff.set(c.affiliate_id, (clicksByAff.get(c.affiliate_id) ?? 0) + 1);
  }
  const convByAff = new Map<string, number>();
  const commByAff = new Map<string, number>();
  for (const v of convRes.data ?? []) {
    if (v.status === "reversed") continue;
    convByAff.set(v.affiliate_id, (convByAff.get(v.affiliate_id) ?? 0) + 1);
    commByAff.set(v.affiliate_id, (commByAff.get(v.affiliate_id) ?? 0) + (v.commission_cents ?? 0));
  }
  const enriched = (data ?? []).map((a) => ({
    ...a,
    total_clicks: clicksByAff.get(a.id) ?? 0,
    total_conversions: convByAff.get(a.id) ?? 0,
    total_commission_cents: commByAff.get(a.id) ?? 0,
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    email: string;
    name: string;
    referral_code: string;
    commission_rate?: number;
  };

  if (!body.email || !body.name || !body.referral_code) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const code = body.referral_code.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (code.length < 3 || code.length > 30) {
    return NextResponse.json({ error: "Code must be 3–30 alphanumeric characters" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data, error } = await service
    .from("affiliates")
    .insert({
      email: body.email.toLowerCase().trim(),
      name: body.name.trim(),
      referral_code: code,
      commission_rate: Math.max(1, Math.min(100, body.commission_rate ?? 20)),
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Referral code or email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    action: "affiliate.approved",
    entity: "affiliates",
    entityId: data.id,
    actor: user.email!,
    details: { email: body.email, code },
    request: req,
  });

  return NextResponse.json(data, { status: 201 });
}
