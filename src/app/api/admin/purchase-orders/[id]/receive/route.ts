import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = await createServiceClient();

  const { data: po } = await serviceClient
    .from("purchase_orders")
    .select("status")
    .eq("id", id)
    .single();

  if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (po.status === "received") return NextResponse.json({ error: "Already received" }, { status: 400 });

  const { error } = await serviceClient.rpc("receive_purchase_order", { p_order_id: id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
