import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export type AuditAction =
  | "admin.login"
  | "admin.logout"
  | "order.status_changed"
  | "order.tracking_updated"
  | "order.refunded"
  | "inventory.adjusted"
  | "inventory.bulk_adjusted"
  | "product.created"
  | "product.updated"
  | "product.deleted"
  | "discount.created"
  | "discount.updated"
  | "discount.deleted"
  | "affiliate.approved"
  | "affiliate.suspended"
  | "affiliate.commission_changed"
  | "affiliate.payout_created"
  | "campaign.sent"
  | "campaign.created"
  | "customer.tagged"
  | "customer.noted"
  | "supplier.created"
  | "purchase_order.created"
  | "purchase_order.received";

export interface AuditOptions {
  action: AuditAction;
  entity: string;
  entityId?: string;
  actor?: string;
  details?: Record<string, unknown>;
  request?: NextRequest;
}

export async function writeAuditLog(opts: AuditOptions): Promise<void> {
  try {
    const supabase = await createServiceClient();
    await supabase.from("audit_logs").insert({
      action: opts.action,
      entity: opts.entity,
      entity_id: opts.entityId ?? null,
      actor: opts.actor ?? null,
      details: opts.details ?? null,
      ip_address: opts.request
        ? opts.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
        : null,
      user_agent: opts.request
        ? opts.request.headers.get("user-agent") ?? null
        : null,
    });
  } catch (err) {
    // Never let audit log failure break the main flow
    console.error("[audit] Failed to write log:", err);
  }
}
