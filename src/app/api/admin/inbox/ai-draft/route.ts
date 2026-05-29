import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const { threadId, extraInstructions } = await req.json();
  if (!threadId) return NextResponse.json({ error: "threadId required" }, { status: 400 });

  const supabase = await createServiceClient();

  // Load thread + messages + customer
  const [{ data: thread }, { data: messages }] = await Promise.all([
    supabase.from("inbox_threads").select("*").eq("id", threadId).single(),
    supabase
      .from("inbox_messages")
      .select("direction, from_name, from_email, body_text, body_html, sent_at")
      .eq("thread_id", threadId)
      .order("sent_at", { ascending: true })
      .limit(20),
  ]);

  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  let customerContext = "";
  if (thread.customer_id) {
    const { data: c } = await supabase
      .from("customers")
      .select("first_name, last_name, email, lifetime_value_cents")
      .eq("id", thread.customer_id)
      .single();
    if (c) {
      customerContext = `Customer: ${c.first_name} ${c.last_name} (${c.email}), total spent: $${((c.lifetime_value_cents ?? 0) / 100).toFixed(2)} NZD.`;
    }
  }

  // Build thread context
  const threadHistory = (messages ?? [])
    .map((m) => {
      const who = m.direction === "inbound" ? `${m.from_name || m.from_email}` : "Nine2Five (us)";
      const body = (m.body_text || m.body_html?.replace(/<[^>]+>/g, "") || "").trim().slice(0, 500);
      return `[${new Date(m.sent_at).toLocaleDateString("en-NZ")}] ${who}: ${body}`;
    })
    .join("\n\n");

  const systemPrompt = `You are writing a professional email reply on behalf of Nine2Five, a New Zealand Māori grip sock brand.
The email should sound natural, helpful, and true to the Nine2Five brand — friendly but professional, with a hint of Kiwi/Māori warmth (you can use "Kia ora" or "Ngā mihi" where appropriate but don't overdo it).
Never make up specific pricing, dates, or promises you don't know for certain.
Keep replies concise and direct. Sign off as "The Nine2Five Team".
Return ONLY the email body text — no subject line, no "Subject:", just the message content.`;

  const userPrompt = `${customerContext ? `Context: ${customerContext}\n\n` : ""}Email thread:\n\n${threadHistory}

${extraInstructions ? `\nExtra instructions from the team: ${extraInstructions}\n` : ""}
Write a reply to the latest inbound message in this thread.`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const draft = (response.content[0] as { type: string; text: string }).text.trim();
    return NextResponse.json({ draft });
  } catch (err) {
    console.error("AI draft error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
