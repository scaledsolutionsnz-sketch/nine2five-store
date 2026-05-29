import { NextRequest, NextResponse } from "next/server";
import { createClient as createSSRClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const auth = await createSSRClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { prompt } = await req.json() as { prompt: string };
    if (!prompt?.trim()) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let response;
    try {
      response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "b64_json",
      });
    } catch (openaiErr: unknown) {
      const msg = openaiErr instanceof Error ? openaiErr.message : String(openaiErr);
      console.error("[social/generate] OpenAI error:", msg);
      return NextResponse.json({ error: `OpenAI: ${msg}` }, { status: 502 });
    }

    const imageData = response.data?.[0];
    if (!imageData?.b64_json) {
      return NextResponse.json({ error: "No image returned from OpenAI" }, { status: 500 });
    }

    const buffer = Buffer.from(imageData.b64_json, "base64");

    const supabase = getServiceClient();
    const filename = `n2f-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("social-images")
      .upload(filename, buffer, { contentType: "image/png", upsert: false });

    if (uploadError) {
      console.error("[social/generate] storage error:", uploadError.message);
      return NextResponse.json({ error: `Storage: ${uploadError.message}` }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("social-images")
      .getPublicUrl(filename);

    return NextResponse.json({
      url: publicUrl,
      revised_prompt: imageData.revised_prompt ?? prompt,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[social/generate] unhandled error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
