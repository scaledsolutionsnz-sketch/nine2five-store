import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { campaignHtml, campaignText } from "@/lib/emails/campaign";

const FROM = "Nine2Five <hello@nine2five.co.nz>";
const BATCH_SIZE = 100;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Auth check — must be signed-in admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = await createServiceClient();

  const { data: campaign } = await serviceClient
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (campaign.status === "sent") return NextResponse.json({ error: "Already sent" }, { status: 400 });

  // Build customer query based on segment
  let query = serviceClient.from("customers").select("email, first_name");
  const segment: string = campaign.segment ?? "all";

  if (segment === "subscribed") {
    query = query.eq("accepts_marketing", true);
  } else if (segment === "high_value") {
    query = query.gte("lifetime_value_cents", 10000);
  }
  // 'all' — no filter

  const { data: customers } = await query;
  if (!customers?.length) return NextResponse.json({ error: "No customers in segment" }, { status: 400 });

  const resend = new Resend(process.env.RESEND_API_KEY!);
  let totalSent = 0;

  // Send in batches of BATCH_SIZE
  for (let i = 0; i < customers.length; i += BATCH_SIZE) {
    const batch = customers.slice(i, i + BATCH_SIZE);

    const emails = batch.map((c) => ({
      from: FROM,
      to: c.email,
      subject: campaign.subject,
      html: campaignHtml({
        campaignId: id,
        email: c.email,
        firstName: c.first_name,
        subject: campaign.subject,
        body: campaign.body_html,
      }),
      text: campaignText({
        firstName: c.first_name,
        body: campaign.body_html,
      }),
    }));

    try {
      await resend.batch.send(emails);
      totalSent += batch.length;
    } catch (err) {
      console.error("Resend batch error:", err);
    }
  }

  await serviceClient
    .from("email_campaigns")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      recipient_count: totalSent,
    })
    .eq("id", id);

  return NextResponse.json({ ok: true, count: totalSent });
}
