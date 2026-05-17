import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(missing)";
  const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const projectRef = url.replace("https://", "").split(".")[0];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      projectRef,
      hasServiceKey,
      queryOk: !error,
      orderCount: count,
      error: error?.message ?? null,
    });
  } catch (err) {
    return NextResponse.json({
      projectRef,
      hasServiceKey,
      queryOk: false,
      error: String(err),
    });
  }
}
