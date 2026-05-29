import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, follow_up_date } = await req.json();

  const VALID = ["needs_reply", "replied", "waiting_on_client", "follow_up_later", "closed"];
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "follow_up_later" && follow_up_date) {
    update.follow_up_date = follow_up_date;
  } else {
    update.follow_up_date = null;
  }

  const { error } = await supabase.from("inbox_threads").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
