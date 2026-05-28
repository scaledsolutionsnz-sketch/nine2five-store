import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json() as { ids: string[] };
    if (!ids?.length) return NextResponse.json({ error: "No IDs" }, { status: 400 });

    const supabase = await createServiceClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: "shipped", updated_at: new Date().toISOString() })
      .in("id", ids)
      .in("status", ["pending", "processing"]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
