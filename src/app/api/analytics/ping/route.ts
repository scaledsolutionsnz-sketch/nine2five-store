import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { session_id, page } = await req.json() as { session_id?: string; page?: string };

    if (!session_id || typeof session_id !== "string" || session_id.length > 100) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    await supabase
      .from("site_sessions")
      .upsert(
        { session_id, page: page ?? "/", last_seen: new Date().toISOString() },
        { onConflict: "session_id" }
      );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
