import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const { data: customers } = await serviceClient.from("customers").select("email, first_name");
  if (!customers?.length) return NextResponse.json({ error: "No customers" }, { status: 400 });

  const emails = customers.map((c) => c.email);

  try {
    const resend = getResend();
    await resend.emails.send({
      from: "Nine2Five <noreply@nine2five.nz>",
      to: emails,
      subject: campaign.subject,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#0a0a0a;color:#fafafa;padding:32px;border-radius:12px;">
          <div style="font-weight:900;font-size:22px;letter-spacing:-0.5px;margin-bottom:24px;">NINE2FIVE</div>
          <div style="white-space:pre-wrap;line-height:1.7;color:#d4d4d4;">${campaign.body_html}</div>
          <div style="margin-top:32px;padding-top:24px;border-top:1px solid #262626;font-size:12px;color:#525252;">
            <a href="https://nine2five.nz" style="color:#16a34a;">nine2five.nz</a> · Christchurch, New Zealand
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  await serviceClient
    .from("email_campaigns")
    .update({ status: "sent", sent_at: new Date().toISOString(), recipient_count: emails.length })
    .eq("id", id);

  return NextResponse.json({ ok: true, count: emails.length });
}
