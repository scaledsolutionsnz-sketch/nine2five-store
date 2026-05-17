import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createServiceClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { total } = await req.json() as { total: number };
  if (!total || total <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const pi = await stripe.paymentIntents.create({
    amount: total,
    currency: "nzd",
    metadata: { pos_sale: "true", operator: user.email ?? "" },
  });

  return NextResponse.json({ clientSecret: pi.client_secret });
}
