import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceClient();
  const now = new Date();
  const twoMinsAgo = new Date(now.getTime() - 2 * 60_000).toISOString();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [liveRes, todayRes, monthRes] = await Promise.all([
    supabase.from("site_sessions").select("*", { count: "exact", head: true }).gte("last_seen", twoMinsAgo),
    supabase.from("site_sessions").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    supabase.from("site_sessions").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
  ]);

  const hasError = !!(liveRes.error || todayRes.error || monthRes.error);

  return NextResponse.json({
    live_now:       liveRes.count  ?? 0,
    sessions_today: todayRes.count ?? 0,
    sessions_month: monthRes.count ?? 0,
    tracking_error: hasError,
  });
}
