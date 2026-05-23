import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createServiceClient();
  const now = new Date();
  const twoMinsAgo   = new Date(now.getTime() - 2 * 60_000).toISOString();
  const todayStart   = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart   = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [liveRes, todayRes, monthRes] = await Promise.all([
    supabase.from("site_sessions").select("*", { count: "exact", head: true }).gte("last_seen", twoMinsAgo),
    supabase.from("site_sessions").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    supabase.from("site_sessions").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
  ]);

  return NextResponse.json({
    live_now:         liveRes.count  ?? 0,
    sessions_today:   todayRes.count ?? 0,
    sessions_month:   monthRes.count ?? 0,
  });
}
