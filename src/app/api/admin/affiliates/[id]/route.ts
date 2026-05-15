import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    status?: "pending" | "active" | "suspended";
    commission_rate?: number;
    notes?: string;
  };

  const update: Record<string, unknown> = {};

  if (body.status !== undefined) {
    update.status = body.status;
    if (body.status === "active") update.approved_at = new Date().toISOString();
  }
  if (body.commission_rate !== undefined) {
    update.commission_rate = Math.max(1, Math.min(100, body.commission_rate));
  }
  if (body.notes !== undefined) {
    update.notes = body.notes;
  }

  const service = await createServiceClient();
  const { data, error } = await service
    .from("affiliates")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const action = body.status === "active"
    ? "affiliate.approved"
    : body.status === "suspended"
    ? "affiliate.suspended"
    : "affiliate.commission_changed";

  await writeAuditLog({
    action,
    entity: "affiliates",
    entityId: id,
    actor: user.email!,
    details: update as Record<string, unknown>,
    request: req,
  });

  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = await createServiceClient();
  const { error } = await service.from("affiliates").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
