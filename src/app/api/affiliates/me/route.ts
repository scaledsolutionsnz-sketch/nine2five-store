import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { AffiliateConversion } from "@/types/database";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = await createServiceClient();

  const { data: affiliate } = await service
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!affiliate) return NextResponse.json({ error: "Not an affiliate" }, { status: 403 });

  const { data: conversions } = await service
    .from("affiliate_conversions")
    .select("*, orders(order_number)")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    affiliate,
    conversions: (conversions ?? []) as (AffiliateConversion & { orders: { order_number: number } | null })[],
  });
}
