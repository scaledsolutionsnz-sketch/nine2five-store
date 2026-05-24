import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    let body: { session_id?: string; page?: string };
    try {
      const text = await req.text();
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { session_id, page } = body;

    if (!session_id || typeof session_id !== "string" || session_id.length > 100) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { error } = await supabase
      .from("site_sessions")
      .upsert(
        { session_id, page: page ?? "/", last_seen: new Date().toISOString() },
        { onConflict: "session_id" }
      );

    if (error) {
      console.error("[analytics/ping] upsert error:", error.message, error.code);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[analytics/ping] unexpected error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
