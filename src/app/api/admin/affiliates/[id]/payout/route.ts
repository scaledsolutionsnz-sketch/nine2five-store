import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    amount_cents: number;
    notes?: string;
    period_start?: string;
    period_end?: string;
  };

  if (!body.amount_cents || body.amount_cents <= 0) {
    return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
  }

  const service = await createServiceClient();

  const { data: affiliate } = await service
    .from("affiliates")
    .select("id, total_commission_cents, total_paid_cents, name, email")
    .eq("id", id)
    .single();

  if (!affiliate) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });

  const pending = affiliate.total_commission_cents - affiliate.total_paid_cents;
  if (body.amount_cents > pending) {
    return NextResponse.json({ error: `Amount exceeds pending commission ($${(pending / 100).toFixed(2)})` }, { status: 400 });
  }

  // Create payout record
  const { data: payout, error: payoutErr } = await service
    .from("affiliate_payouts")
    .insert({
      affiliate_id: id,
      amount_cents: body.amount_cents,
      status: "completed",
      notes: body.notes ?? null,
      period_start: body.period_start ?? null,
      period_end: body.period_end ?? null,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (payoutErr) return NextResponse.json({ error: payoutErr.message }, { status: 500 });

  // Update affiliate total_paid_cents
  const { data: updated, error: updateErr } = await service
    .from("affiliates")
    .update({ total_paid_cents: affiliate.total_paid_cents + body.amount_cents })
    .eq("id", id)
    .select()
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Mark pending + approved conversions as paid (oldest first, up to the payout amount)
  const { data: conversions } = await service
    .from("affiliate_conversions")
    .select("id, commission_cents")
    .eq("affiliate_id", id)
    .in("status", ["pending", "approved"])
    .order("created_at", { ascending: true });

  if (conversions && conversions.length > 0) {
    let remaining = body.amount_cents;
    const toMark: string[] = [];
    for (const c of conversions) {
      if (remaining <= 0) break;
      toMark.push(c.id);
      remaining -= c.commission_cents;
    }
    if (toMark.length > 0) {
      await service
        .from("affiliate_conversions")
        .update({ status: "paid" })
        .in("id", toMark);
    }
  }

  await writeAuditLog({
    action: "affiliate.payout_created",
    entity: "affiliates",
    entityId: id,
    actor: user.email!,
    details: { amount_cents: body.amount_cents, payout_id: payout.id, affiliate_email: affiliate.email },
    request: req,
  });

  return NextResponse.json({ payout, affiliate: updated });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = await createServiceClient();
  const { data, error } = await service
    .from("affiliate_payouts")
    .select("*")
    .eq("affiliate_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
