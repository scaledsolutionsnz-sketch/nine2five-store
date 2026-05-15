import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { abandonedCartHtml, abandonedCartText } from "@/lib/emails/abandoned-cart";
import type { CartItem } from "@/types/database";

const FROM = "Nine2Five <orders@nine2five.co.nz>";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Vercel cron passes Authorization: Bearer CRON_SECRET
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const { data: carts, error } = await supabase.rpc("get_abandoned_carts");
  if (error) {
    console.error("Abandoned cart query failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!carts?.length) {
    return NextResponse.json({ sent: 0 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  let sent = 0;

  for (const cart of carts) {
    // Look up customer name
    const { data: customer } = await supabase
      .from("customers")
      .select("first_name")
      .eq("email", cart.email)
      .maybeSingle();

    let items: CartItem[] = [];
    try {
      items = typeof cart.items === "string" ? JSON.parse(cart.items) : cart.items;
    } catch {}

    if (!items.length) continue;

    const recoveryUrl = `https://nine2five.co.nz/cart`;

    try {
      await resend.emails.send({
        from: FROM,
        to: cart.email,
        subject: "You left something behind — Nine2Five",
        html: abandonedCartHtml({
          firstName: customer?.first_name ?? null,
          items,
          recoveryUrl,
        }),
        text: abandonedCartText({
          firstName: customer?.first_name ?? null,
          items,
          recoveryUrl,
        }),
      });

      await supabase.rpc("mark_cart_recovery_sent", { p_session_id: cart.session_id });
      sent++;
    } catch (err) {
      console.error(`Failed to send recovery to ${cart.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: carts.length });
}
