import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseTrackingToken } from "@/lib/email-tracking";

// 1×1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const parsed = parseTrackingToken(token);

  if (parsed) {
    const supabase = await createServiceClient();
    await supabase.rpc("record_email_event", {
      p_campaign_id: parsed.campaignId,
      p_email: parsed.email,
      p_event_type: "open",
      p_ip: req.headers.get("x-forwarded-for") ?? null,
      p_ua: req.headers.get("user-agent") ?? null,
    });
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
