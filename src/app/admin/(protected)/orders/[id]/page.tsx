export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { OrderActions } from "./order-actions";
import { NzPostLabel } from "./nz-post-label";
import { EShipButton } from "./eship-button";
import type { OrderWithItems, ShippingAddress } from "@/types/database";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const o = order as OrderWithItems;
  const addr = o.shipping_address as ShippingAddress;

  const STATUS_COLORS: Record<string, string> = {
    pending:    "bg-[#FFF4CC] text-[#9A5B00]",
    processing: "bg-[#DBEAFE] text-[#1E40AF]",
    shipped:    "bg-[#DBEAFE] text-[#1E40AF]",
    delivered:  "bg-[#D5F1E2] text-[#166B3B]",
    cancelled:  "bg-[#FEE2E2] text-[#991B1B]",
    refunded:   "bg-[#F3F4F6] text-[#6B7280]",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] font-mono">Order #{o.order_number}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium",
              STATUS_COLORS[o.status] ?? STATUS_COLORS.pending
            )}>
              {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
            </span>
            <span className="text-[14px] text-[#64748B]">
              {new Date(o.created_at).toLocaleDateString("en-NZ", { dateStyle: "long" })}
            </span>
          </div>
        </div>
        <OrderActions orderId={o.id} currentStatus={o.status} trackingNumber={o.tracking_number} />
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          {/* Items */}
          <div
            className="rounded-[14px] bg-white border border-[#E2E8F0] overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
          >
            <div className="px-6 py-4 border-b border-[#E2E8F0]">
              <h2 className="text-[14px] font-semibold text-[#1F2937]">Items</h2>
            </div>
            <div className="p-6 space-y-3">
              {o.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-[#E5EAF1] last:border-0">
                  <div>
                    <p className="text-[13px] font-medium text-[#1F2937]">{item.product_name}</p>
                    <p className="text-[12px] text-[#6B7280] mt-0.5">Size {item.size} × {item.quantity}</p>
                  </div>
                  <p className="text-[13px] font-semibold text-[#1F2937] font-mono">
                    ${((item.unit_price * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-[#E2E8F0] space-y-2 text-[13px]">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Subtotal</span><span className="font-mono">${(o.subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Shipping</span><span className="font-mono">{o.shipping_cost === 0 ? "Free" : `$${(o.shipping_cost / 100).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-[14px] text-[#1F2937] pt-2 border-t border-[#E2E8F0]">
                  <span>Total</span><span className="font-mono">${(o.total / 100).toFixed(2)} NZD</span>
                </div>
              </div>
            </div>
          </div>

          {/* NZ Post Label */}
          <NzPostLabel order={o} />
        </div>

        {/* Customer + Address */}
        <div className="space-y-4">
          <div
            className="rounded-[14px] bg-white border border-[#E2E8F0] overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
          >
            <div className="px-6 py-4 border-b border-[#E2E8F0]">
              <h2 className="text-[14px] font-semibold text-[#1F2937]">Customer</h2>
            </div>
            <div className="p-6 space-y-1">
              <p className="text-[13px] font-medium text-[#1F2937]">{addr.first_name} {addr.last_name}</p>
              <p className="text-[13px] text-[#64748B]">{o.guest_email}</p>
              {addr.phone && <p className="text-[13px] text-[#64748B]">{addr.phone}</p>}
            </div>
          </div>

          <div
            className="rounded-[14px] bg-white border border-[#E2E8F0] overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
          >
            <div className="px-6 py-4 border-b border-[#E2E8F0]">
              <h2 className="text-[14px] font-semibold text-[#1F2937]">Shipping Address</h2>
            </div>
            <div className="p-6">
              <div className="text-[13px] text-[#334155] space-y-0.5">
                <p>{addr.first_name} {addr.last_name}</p>
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city} {addr.postcode}</p>
                <p>{addr.region}</p>
                <p>{addr.country}</p>
              </div>
            </div>
          </div>

          {o.tracking_number && (
            <div
              className="rounded-[14px] bg-white border border-[#E2E8F0] overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
            >
              <div className="px-6 py-4 border-b border-[#E2E8F0]">
                <h2 className="text-[14px] font-semibold text-[#1F2937]">Tracking</h2>
              </div>
              <div className="p-6">
                <p className="text-[13px] font-mono text-[#116DFF] font-semibold">{o.tracking_number}</p>
              </div>
            </div>
          )}

          <EShipButton orderId={o.id} existingTracking={o.tracking_number ?? null} />
        </div>
      </div>
    </div>
  );
}
