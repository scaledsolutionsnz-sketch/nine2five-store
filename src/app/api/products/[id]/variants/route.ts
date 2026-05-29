import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  if (UUID_RE.test(id)) {
    const { data } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .order("size");
    return NextResponse.json(data ?? []);
  }

  // Slug-based lookup
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("slug", id)
    .single();

  if (!product) return NextResponse.json([]);

  const { data } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id)
    .order("size");

  return NextResponse.json(data ?? []);
}
