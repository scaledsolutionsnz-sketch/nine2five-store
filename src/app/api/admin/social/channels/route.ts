import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const BUFFER_API = "https://api.buffer.com/graphql";

async function bufferQuery(query: string, token: string) {
  const res = await fetch(BUFFER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
  const text = await res.text();
  try {
    return { ok: res.ok, data: JSON.parse(text) };
  } catch {
    console.error("[social/channels] non-JSON response:", res.status, text.slice(0, 300));
    return { ok: false, data: null };
  }
}

export async function GET() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "Buffer not configured" }, { status: 500 });

  try {
    // Step 1: get org IDs
    const { data: orgData } = await bufferQuery(
      `query { account { organizations { id name } } }`,
      token
    );

    if (orgData?.errors?.length) {
      const msg = orgData.errors[0]?.message ?? "Buffer API error";
      console.error("[social/channels] org query error:", msg);
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const orgs: { id: string }[] = orgData?.data?.account?.organizations ?? [];
    if (!orgs.length) return NextResponse.json([]);

    // Step 2: get channels for all orgs
    const allChannels: unknown[] = [];
    for (const org of orgs) {
      const { data: chData } = await bufferQuery(
        `query {
          channels(input: { organizationId: "${org.id}" }) {
            id
            name
            displayName
            service
            avatar
          }
        }`,
        token
      );
      if (!chData?.errors) {
        allChannels.push(...(chData?.data?.channels ?? []));
      }
    }

    return NextResponse.json(allChannels);
  } catch (err) {
    console.error("[social/channels] error:", err);
    return NextResponse.json({ error: "Could not reach Buffer" }, { status: 502 });
  }
}
