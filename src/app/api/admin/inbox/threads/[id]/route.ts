import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const [{ data: thread }, { data: messages }, { data: draft }] = await Promise.all([
    supabase.from("inbox_threads").select("*").eq("id", id).single(),
    supabase
      .from("inbox_messages")
      .select("*")
      .eq("thread_id", id)
      .order("sent_at", { ascending: true }),
    supabase.from("inbox_drafts").select("*").eq("thread_id", id).maybeSingle(),
  ]);

  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fetch customer if linked
  let customer = null;
  if (thread.customer_id) {
    const { data } = await supabase
      .from("customers")
      .select("id, first_name, last_name, email, phone, default_shipping_address, lifetime_value_cents, created_at")
      .eq("id", thread.customer_id)
      .single();
    customer = data;
  }

  return NextResponse.json({ thread, messages: messages ?? [], draft, customer });
}
