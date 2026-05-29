import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const BUFFER_API = "https://api.buffer.com/graphql";

export async function POST(req: NextRequest) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "Buffer not configured" }, { status: 500 });

  const { channel_ids, text, image_url, scheduled_at } = await req.json() as {
    channel_ids: string[];
    text: string;
    image_url: string;
    scheduled_at?: string;
  };

  if (!channel_ids?.length) return NextResponse.json({ error: "Select at least one channel" }, { status: 400 });
  if (!text?.trim()) return NextResponse.json({ error: "Caption required" }, { status: 400 });
  if (!image_url) return NextResponse.json({ error: "Image required" }, { status: 400 });

  const successes: string[] = [];
  const errors: string[] = [];

  for (const channelId of channel_ids) {
    const mode = scheduled_at ? "customScheduled" : "addToQueue";
    const dueLine = scheduled_at ? `dueAt: ${JSON.stringify(scheduled_at)}` : "";

    const mutation = `
      mutation {
        createPost(input: {
          text: ${JSON.stringify(text)}
          channelId: "${channelId}"
          schedulingType: automatic
          mode: ${mode}
          ${dueLine}
          assets: [{ image: { url: ${JSON.stringify(image_url)} } }]
        }) {
          ... on PostActionSuccess {
            post { id }
          }
          ... on MutationError {
            message
          }
        }
      }
    `;

    try {
      const res = await fetch(BUFFER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ query: mutation }),
      });

      const data = await res.json();

      if (data.errors?.length) {
        errors.push(data.errors[0]?.message ?? "Unknown error");
      } else if (data.data?.createPost?.message) {
        errors.push(data.data.createPost.message);
      } else if (data.data?.createPost?.post?.id) {
        successes.push(data.data.createPost.post.id);
      } else {
        errors.push("Unexpected response from Buffer");
      }
    } catch (err) {
      errors.push(String(err));
    }
  }

  if (errors.length && !successes.length) {
    console.error("[social/post] Buffer errors:", errors);
    return NextResponse.json({ error: errors[0] }, { status: 502 });
  }

  if (errors.length) {
    return NextResponse.json({ ok: true, posted: successes.length, partial_errors: errors });
  }

  return NextResponse.json({ ok: true, posted: successes.length });
}
