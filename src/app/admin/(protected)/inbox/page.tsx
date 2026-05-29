import { createServiceClient } from "@/lib/supabase/server";
import { InboxClient } from "./inbox-client";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const supabase = await createServiceClient();

  const { data: creds } = await supabase
    .from("gmail_credentials")
    .select("email, last_sync_at")
    .limit(1)
    .maybeSingle();

  const { data: threads } = await supabase
    .from("inbox_threads")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100);

  const { count: needsReplyCount } = await supabase
    .from("inbox_threads")
    .select("*", { count: "exact", head: true })
    .eq("status", "needs_reply");

  return (
    <InboxClient
      gmailConnected={!!creds}
      gmailEmail={creds?.email ?? null}
      lastSyncAt={creds?.last_sync_at ?? null}
      initialThreads={threads ?? []}
      needsReplyCount={needsReplyCount ?? 0}
    />
  );
}
