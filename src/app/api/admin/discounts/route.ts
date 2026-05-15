import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";
import type { DiscountCode } from "@/types/database";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<DiscountCode>;

  if (!body.code || !body.type || body.value === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["percentage", "fixed"].includes(body.type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (body.type === "percentage" && (body.value < 1 || body.value > 100)) {
    return NextResponse.json({ error: "Percentage must be 1–100" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data, error } = await service
    .from("discount_codes")
    .insert({
      code: body.code.toUpperCase().trim(),
      type: body.type,
      value: body.value,
      min_order_cents: body.min_order_cents ?? 0,
      max_uses: body.max_uses ?? null,
      expires_at: body.expires_at ?? null,
      active: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    action: "discount.created",
    entity: "discount_codes",
    entityId: data.id,
    actor: user.email!,
    details: { code: body.code },
    request: req,
  });

  return NextResponse.json(data, { status: 201 });
}
