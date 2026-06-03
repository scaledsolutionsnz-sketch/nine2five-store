import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getResend } from "@/lib/email";
import { lowStockHtml, lowStockText } from "@/lib/emails/low-stock";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "nine2five.co.nz@gmail.com";
const FROM = "Nine2Five <orders@mail.nine2five.nz>";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const { data: items, error } = await supabase
    .from("low_stock_view")
    .select("variant_id, product_name, size, stock_quantity")
    .order("stock_quantity", { ascending: true });

  if (error) {
    console.error("Low stock query failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!items?.length) {
    return NextResponse.json({ sent: false, message: "All stock levels OK" });
  }

  const resend = getResend();

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `⚠️ Low Stock Alert — ${items.length} variant${items.length !== 1 ? "s" : ""} need restocking`,
    html: lowStockHtml(items),
    text: lowStockText(items),
  });

  return NextResponse.json({ sent: true, count: items.length });
}
