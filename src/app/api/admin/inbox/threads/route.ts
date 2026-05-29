import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? "all";
  const search = searchParams.get("search") ?? "";

  const supabase = await createServiceClient();

  let query = supabase
    .from("inbox_threads")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  // Filter out follow_up_later threads that haven't reached their date
  if (status === "all" || status === "needs_reply") {
    // Include follow_up threads only if their date has passed
  }

  if (search) {
    query = query.or(
      `participant_email.ilike.%${search}%,participant_name.ilike.%${search}%,subject.ilike.%${search}%,snippet.ilike.%${search}%`
    );
  }

  // Hide follow_up_later that haven't matured unless explicitly requesting that filter
  if (status !== "follow_up_later") {
    const now = new Date().toISOString();
    // Show follow_up_later only if date passed (bring back to inbox)
    query = query.or(
      `status.neq.follow_up_later,and(status.eq.follow_up_later,follow_up_date.lte.${now})`
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Count needs_reply for badge
  const { count } = await supabase
    .from("inbox_threads")
    .select("*", { count: "exact", head: true })
    .eq("status", "needs_reply");

  return NextResponse.json({ threads: data ?? [], needsReplyCount: count ?? 0 });
}
