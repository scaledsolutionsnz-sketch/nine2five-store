import { NextRequest, NextResponse } from "next/server";
import { getAuthedClient, sendGmailReply } from "@/lib/gmail";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { to, cc = [], bcc = [], subject, body } = await req.json();

  if (!to || !body) return NextResponse.json({ error: "Missing to or body" }, { status: 400 });

  const authed = await getAuthedClient();
  if (!authed) return NextResponse.json({ error: "Gmail not connected" }, { status: 401 });

  const supabase = await createServiceClient();

  // Get thread for gmail thread ID
  const { data: thread } = await supabase
    .from("inbox_threads")
    .select("gmail_thread_id")
    .eq("id", id)
    .single();

  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  // Get last inbound message for In-Reply-To header
  const { data: lastMsg } = await supabase
    .from("inbox_messages")
    .select("gmail_message_id, direction")
    .eq("thread_id", id)
    .order("sent_at", { ascending: false })
    .limit(1)
    .single();

  try {
    const sent = await sendGmailReply({
      oauth2: authed.oauth2,
      to,
      cc,
      bcc,
      subject,
      bodyText: body,
      inReplyTo: lastMsg?.gmail_message_id,
      threadId: thread.gmail_thread_id,
      fromEmail: authed.credentials.email,
    });

    // Store outbound message
    await supabase.from("inbox_messages").insert({
      thread_id: id,
      gmail_message_id: sent.id ?? `sent-${Date.now()}`,
      direction: "outbound",
      from_email: authed.credentials.email,
      from_name: "Nine2Five",
      to_emails: [to],
      cc_emails: cc,
      subject,
      body_text: body,
      snippet: body.slice(0, 200),
      sent_at: new Date().toISOString(),
    });

    // Update thread status + timestamps
    await supabase.from("inbox_threads").update({
      status: "replied",
      last_outbound_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    // Clear draft
    await supabase.from("inbox_drafts").delete().eq("thread_id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Send reply error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
