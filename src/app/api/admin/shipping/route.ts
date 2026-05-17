import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipping_settings")
    .select("*")
    .eq("id", "default")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { nz_rate_cents, nz_free_threshold_cents, au_rate_cents, au_free_threshold_cents } = body;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipping_settings")
    .update({
      nz_rate_cents,
      nz_free_threshold_cents: nz_free_threshold_cents ?? null,
      au_rate_cents,
      au_free_threshold_cents: au_free_threshold_cents ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default")
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
