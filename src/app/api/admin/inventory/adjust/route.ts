import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const VALID_TYPES = ["restock", "damaged", "returned", "adjustment"] as const;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { variantId, delta, type, note } = await req.json();
  if (!variantId || delta === undefined || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();
  const { data, error } = await serviceClient.rpc("adjust_stock", {
    p_variant_id: variantId,
    p_delta: delta,
    p_type: type,
    p_note: note ?? null,
    p_created_by: user.email ?? user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ newQuantity: data });
}
