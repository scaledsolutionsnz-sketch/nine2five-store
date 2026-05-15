import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_SEGMENTS = ["all", "subscribed", "high_value"] as const;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, body, segment = "all" } = await req.json();
  if (!subject || !body) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (!VALID_SEGMENTS.includes(segment)) return NextResponse.json({ error: "Invalid segment" }, { status: 400 });

  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({ subject, body_html: body, segment, status: "draft" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaign: data });
}
