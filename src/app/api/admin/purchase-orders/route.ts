import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = await createServiceClient();
  const { data } = await serviceClient
    .from("purchase_orders")
    .select("*, suppliers(name), purchase_order_items(id, variant_id, quantity_ordered, quantity_received, unit_cost_cents, product_variants(size, products(name)))")
    .order("created_at", { ascending: false });

  return NextResponse.json({ orders: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supplier_id, expected_at, notes, items } = await req.json();
  if (!Array.isArray(items) || !items.length) {
    return NextResponse.json({ error: "At least one line item required" }, { status: 400 });
  }

  const totalCost = items.reduce(
    (sum: number, i: { quantity_ordered: number; unit_cost_cents: number }) =>
      sum + i.quantity_ordered * (i.unit_cost_cents ?? 0),
    0
  );

  const serviceClient = await createServiceClient();

  const { data: po, error } = await serviceClient
    .from("purchase_orders")
    .insert({
      supplier_id: supplier_id ?? null,
      status: "draft",
      expected_at: expected_at ?? null,
      notes: notes ?? null,
      total_cost_cents: totalCost,
      created_by: user.email ?? user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const lineItems = items.map((i: { variant_id: string; quantity_ordered: number; unit_cost_cents: number }) => ({
    purchase_order_id: po.id,
    variant_id: i.variant_id,
    quantity_ordered: i.quantity_ordered,
    quantity_received: 0,
    unit_cost_cents: i.unit_cost_cents ?? null,
  }));

  await serviceClient.from("purchase_order_items").insert(lineItems);

  return NextResponse.json({ order: po });
}
