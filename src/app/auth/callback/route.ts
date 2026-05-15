import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // If this is a customer auth flow (not admin), link the customer record
    if (next.startsWith("/account") || !next.startsWith("/admin")) {
      await supabase.rpc("link_customer_account");
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
