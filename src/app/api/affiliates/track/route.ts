import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Called by the storefront when a ?ref= link is visited
// Saves the click and returns the affiliate details for cookie setting
export async function POST(req: NextRequest) {
  try {
    const { code, landing_page } = await req.json() as {
      code: string;
      landing_page?: string;
    };

    if (!code || typeof code !== "string" || code.length > 50) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id, referral_code, commission_rate, status")
      .eq("referral_code", code.toLowerCase())
      .eq("status", "active")
      .single();

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = req.headers.get("user-agent") ?? null;
    const referrer = req.headers.get("referer") ?? null;

    // Record the click (fire and forget, don't block the response)
    supabase
      .from("affiliate_clicks")
      .insert({
        affiliate_id: affiliate.id,
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer,
        landing_page: landing_page ?? null,
      })
      .then(() => {
        // Increment total_clicks counter
        supabase.rpc("increment_affiliate_clicks", { p_affiliate_id: affiliate.id });
      });

    return NextResponse.json({
      ok: true,
      affiliate_id: affiliate.id,
      code: affiliate.referral_code,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
