import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });
  return NextResponse.json(data ?? []);
}
