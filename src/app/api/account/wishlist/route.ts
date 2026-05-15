import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product_id } = await req.json() as { product_id: string };
  if (!product_id) return NextResponse.json({ error: "Missing product_id" }, { status: 400 });

  const { data: customer } = await supabase
    .from("customers").select("id").eq("email", user.email!).single();
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("wishlists")
    .upsert({ customer_id: customer.id, product_id }, { onConflict: "customer_id,product_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const product_id = searchParams.get("product_id");
  if (!product_id) return NextResponse.json({ error: "Missing product_id" }, { status: 400 });

  const { data: customer } = await supabase
    .from("customers").select("id").eq("email", user.email!).single();
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("customer_id", customer.id)
    .eq("product_id", product_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: customer } = await supabase
    .from("customers").select("id").eq("email", user.email!).single();
  if (!customer) return NextResponse.json([]);

  const { data } = await supabase
    .from("wishlists")
    .select("product_id, products(id, name, slug, price, compare_at_price, image_urls)")
    .eq("customer_id", customer.id);

  return NextResponse.json(data ?? []);
}
