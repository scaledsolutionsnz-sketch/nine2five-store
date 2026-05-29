import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServiceClient();
  const { data } = await supabase.from("inbox_drafts").select("*").eq("thread_id", id).maybeSingle();
  return NextResponse.json({ draft: data });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { to_email, cc_emails, bcc_emails, subject, body_text } = await req.json();
  const supabase = await createServiceClient();

  const { error } = await supabase.from("inbox_drafts").upsert(
    { thread_id: id, to_email, cc_emails, bcc_emails, subject, body_text, updated_at: new Date().toISOString() },
    { onConflict: "thread_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServiceClient();
  await supabase.from("inbox_drafts").delete().eq("thread_id", id);
  return NextResponse.json({ ok: true });
}
