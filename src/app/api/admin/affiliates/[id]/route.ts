import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";
import { getResend, FROM_EMAIL, REPLY_TO } from "@/lib/email";
import { affiliateApprovedHtml, affiliateApprovedText } from "@/lib/emails/affiliate-approved";

const DASHBOARD_URL = "https://nine2five.nz/affiliate/dashboard";

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

  // Fetch current record before update so we can check previous status
  const { data: before } = await service
    .from("affiliates")
    .select("status, name, email, referral_code")
    .eq("id", id)
    .single();

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

  // Send approval email if transitioning from non-active → active
  if (body.status === "active" && before && before.status !== "active") {
    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        replyTo: REPLY_TO,
        to: before.email,
        subject: "You're approved — Nine2Five Ambassador Programme",
        html: affiliateApprovedHtml(before.name, before.referral_code, DASHBOARD_URL),
        text: affiliateApprovedText(before.name, before.referral_code, DASHBOARD_URL),
      });
    } catch (emailErr) {
      // Log but don't fail the request — status update already succeeded
      console.error("Approval email failed:", emailErr);
    }
  }

  return NextResponse.json(data);
}

// SOFT-DELETE (archive). We never hard-delete: affiliate_clicks is ON DELETE
// CASCADE (a hard delete would destroy the affiliate's tracked clicks) and
// affiliate_conversions / affiliate_payouts are ON DELETE RESTRICT. Archiving sets
// archived_at and hides the affiliate from the admin list while preserving all
// tracking data; it is reversible (clear archived_at to restore).
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = await createServiceClient();
  const { data, error } = await service
    .from("affiliates")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, name, email, referral_code")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog({
    action: "affiliate.archived",
    entity: "affiliates",
    entityId: id,
    actor: user.email!,
    details: { soft_delete: true, ...(data ?? {}) },
    request: req,
  });

  return NextResponse.json({ ok: true });
}
