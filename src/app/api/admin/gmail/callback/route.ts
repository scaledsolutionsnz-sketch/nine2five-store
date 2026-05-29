import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/gmail";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/admin/inbox?error=no_code", req.url));

  try {
    const oauth2 = getOAuth2Client();
    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);

    const gmail = (await import("googleapis")).google.gmail({ version: "v1", auth: oauth2 });
    const profile = await gmail.users.getProfile({ userId: "me" });
    const email = profile.data.emailAddress ?? "unknown";

    const supabase = await createServiceClient();
    const { data: existing } = await supabase.from("gmail_credentials").select("id").limit(1).single();

    const record = {
      email,
      access_token: tokens.access_token ?? null,
      refresh_token: tokens.refresh_token!,
      token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    };

    if (existing) {
      await supabase.from("gmail_credentials").update(record).eq("id", existing.id);
    } else {
      await supabase.from("gmail_credentials").insert(record);
    }

    return NextResponse.redirect(new URL("/admin/inbox?connected=1", req.url));
  } catch (err) {
    console.error("Gmail OAuth error:", err);
    return NextResponse.redirect(new URL("/admin/inbox?error=oauth_failed", req.url));
  }
}
