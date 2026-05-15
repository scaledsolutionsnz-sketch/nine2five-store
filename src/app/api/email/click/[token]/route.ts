import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseTrackingToken } from "@/lib/email-tracking";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const url = req.nextUrl.searchParams.get("url") ?? "https://nine2five.co.nz";
  const parsed = parseTrackingToken(token);

  if (parsed) {
    const supabase = await createServiceClient();
    await supabase.rpc("record_email_event", {
      p_campaign_id: parsed.campaignId,
      p_email: parsed.email,
      p_event_type: "click",
      p_url: url,
      p_ip: req.headers.get("x-forwarded-for") ?? null,
      p_ua: req.headers.get("user-agent") ?? null,
    });
  }

  // Validate destination is our domain or allow any https URL
  let destination = "https://nine2five.co.nz";
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:") destination = parsed.href;
  } catch {}

  return NextResponse.redirect(destination, { status: 302 });
}
