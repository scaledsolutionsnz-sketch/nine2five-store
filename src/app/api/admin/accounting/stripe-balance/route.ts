import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripe = getStripe();

  const [balance, payouts] = await Promise.all([
    stripe.balance.retrieve(),
    stripe.payouts.list({ limit: 5 }),
  ]);

  const available = balance.available.find((b) => b.currency === "nzd") ?? balance.available[0];
  const pending   = balance.pending.find((b) => b.currency === "nzd")   ?? balance.pending[0];

  return NextResponse.json({
    available_cents: available?.amount ?? 0,
    pending_cents:   pending?.amount   ?? 0,
    currency:        (available?.currency ?? "nzd").toUpperCase(),
    payouts: payouts.data.map((p) => ({
      id:           p.id,
      amount:       p.amount,
      currency:     p.currency.toUpperCase(),
      arrival_date: p.arrival_date,
      status:       p.status,
      description:  p.description,
    })),
  });
}
