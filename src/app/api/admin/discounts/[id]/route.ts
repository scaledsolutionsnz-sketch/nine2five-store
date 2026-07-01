import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";
import type { DiscountCode } from "@/types/database";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<DiscountCode> & { type?: string };

  // Build a partial update from only the fields provided.
  const update: Record<string, unknown> = {};

  if (body.code !== undefined) update.code = String(body.code).toUpperCase().trim();

  if (body.type !== undefined) {
    if (!["percentage", "fixed", "free_shipping"].includes(body.type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (body.type === "free_shipping") {
      // Stored as fixed/$0 — PostgREST rejects the "free_shipping" enum (stale schema cache)
      update.type = "fixed";
      update.value = 0;
    } else {
      update.type = body.type;
      if (body.value !== undefined) {
        if (body.type === "percentage" && ((body.value ?? 0) < 1 || (body.value ?? 0) > 100)) {
          return NextResponse.json({ error: "Percentage must be 1–100" }, { status: 400 });
        }
        update.value = body.value;
      }
    }
  } else if (body.value !== undefined) {
    update.value = body.value;
  }

  if (body.min_order_cents !== undefined) update.min_order_cents = body.min_order_cents ?? 0;
  if (body.max_uses !== undefined) update.max_uses = body.max_uses ?? null;
  if (body.expires_at !== undefined) update.expires_at = body.expires_at ?? null;
  if (body.active !== undefined) update.active = body.active;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // True service-role client (no auth cookie) so the write isn't blocked by RLS.
  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("discount_codes")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    action: "discount.updated",
    entity: "discount_codes",
    entityId: id,
    actor: user.email!,
    details: update,
    request: req,
  });

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceRoleClient();
  const { error } = await service
    .from("discount_codes")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog({
    action: "discount.deleted",
    entity: "discount_codes",
    entityId: id,
    actor: user.email!,
    details: { id },
    request: req,
  });

  return NextResponse.json({ ok: true });
}
