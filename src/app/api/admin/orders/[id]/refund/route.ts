import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { writeAuditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { amount_cents?: number; reason?: string };

  const service = await createServiceClient();
  const { data: order } = await service
    .from("orders")
    .select("id, order_number, total, status, stripe_payment_intent_id")
    .eq("id", id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status === "refunded") return NextResponse.json({ error: "Already refunded" }, { status: 400 });
  if (!order.stripe_payment_intent_id) return NextResponse.json({ error: "No payment found for this order" }, { status: 400 });

  const stripe = getStripe();
  const amountCents = body.amount_cents ?? order.total;

  let refund;
  try {
    refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
      amount: amountCents,
      reason: (body.reason as "duplicate" | "fraudulent" | "requested_by_customer") ?? "requested_by_customer",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Stripe refund failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Update order status
  const newStatus = amountCents >= order.total ? "refunded" : order.status;
  await service
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  await writeAuditLog({
    action: "order.refunded",
    entity: "orders",
    entityId: id,
    actor: user.email!,
    details: { order_number: order.order_number, amount_cents: amountCents, refund_id: refund.id, reason: body.reason },
    request: req,
  });

  return NextResponse.json({ ok: true, refund_id: refund.id, status: newStatus });
}
