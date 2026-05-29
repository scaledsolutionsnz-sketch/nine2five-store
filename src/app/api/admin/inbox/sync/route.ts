import { NextResponse } from "next/server";
import { getAuthedClient, parseGmailMessage } from "@/lib/gmail";
import { google } from "googleapis";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST() {
  const authed = await getAuthedClient();
  if (!authed) return NextResponse.json({ error: "Gmail not connected" }, { status: 401 });

  const { oauth2, credentials } = authed;
  const supabase = await createServiceClient();
  const ourEmail = credentials.email;

  const gmail = google.gmail({ version: "v1", auth: oauth2 });

  // Fetch threads modified since last sync (or last 7 days)
  const since = credentials.last_sync_at
    ? new Date(credentials.last_sync_at)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const afterEpoch = Math.floor(since.getTime() / 1000);

  const listRes = await gmail.users.threads.list({
    userId: "me",
    q: `after:${afterEpoch} -category:promotions -category:social`,
    maxResults: 50,
  });

  const threads = listRes.data.threads ?? [];
  let synced = 0;

  for (const t of threads) {
    if (!t.id) continue;

    // Get full thread
    const threadRes = await gmail.users.threads.get({
      userId: "me",
      id: t.id,
      format: "full",
    });

    const messages = threadRes.data.messages ?? [];
    if (!messages.length) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = messages.map((m) => parseGmailMessage(m as any, ourEmail));

    // Determine participant (the non-us email)
    const inbound = parsed.find((p) => p.direction === "inbound");
    const participantEmail = inbound?.fromEmail ?? parsed[0].toEmails[0] ?? "";
    const participantName = inbound?.fromName ?? "";
    if (!participantEmail || participantEmail === ourEmail) continue;

    const subject = parsed[0].subject;
    const snippet = parsed[parsed.length - 1].snippet;
    const lastInbound = parsed.filter((p) => p.direction === "inbound").at(-1);
    const lastOutbound = parsed.filter((p) => p.direction === "outbound").at(-1);

    // Match to customer
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .ilike("email", participantEmail)
      .limit(1)
      .maybeSingle();

    // Upsert thread
    const { data: thread, error: threadErr } = await supabase
      .from("inbox_threads")
      .upsert(
        {
          gmail_thread_id: t.id,
          customer_id: customer?.id ?? null,
          participant_email: participantEmail,
          participant_name: participantName,
          subject,
          snippet,
          message_count: parsed.length,
          last_inbound_at: lastInbound?.sentAt ?? null,
          last_outbound_at: lastOutbound?.sentAt ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "gmail_thread_id", ignoreDuplicates: false }
      )
      .select("id, status")
      .single();

    if (threadErr || !thread) continue;

    // Insert new messages (ignore duplicates)
    for (const msg of parsed) {
      if (!msg.gmailMessageId) continue;
      const { error } = await supabase.from("inbox_messages").upsert(
        {
          thread_id: thread.id,
          gmail_message_id: msg.gmailMessageId,
          direction: msg.direction,
          from_email: msg.fromEmail,
          from_name: msg.fromName,
          to_emails: msg.toEmails,
          cc_emails: msg.ccEmails,
          subject: msg.subject,
          body_html: msg.bodyHtml,
          body_text: msg.bodyText,
          snippet: msg.snippet,
          sent_at: msg.sentAt,
        },
        { onConflict: "gmail_message_id", ignoreDuplicates: true }
      );
      if (error) console.error("Message upsert error:", error.message);
    }

    // If latest message is inbound and thread is not closed/waiting, mark needs_reply
    const latestMsg = parsed.at(-1);
    if (
      latestMsg?.direction === "inbound" &&
      thread.status !== "closed" &&
      thread.status !== "waiting_on_client"
    ) {
      await supabase
        .from("inbox_threads")
        .update({ status: "needs_reply" })
        .eq("id", thread.id);
    }

    synced++;
  }

  // Update last_sync_at
  await supabase
    .from("gmail_credentials")
    .update({ last_sync_at: new Date().toISOString() })
    .eq("id", credentials.id);

  return NextResponse.json({ synced });
}
