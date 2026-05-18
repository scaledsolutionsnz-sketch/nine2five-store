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
    pending:    "bg-white/[0.06] text-white/50 border border-white/[0.08]",
    processing: "bg-blue-400/10 text-blue-400 border border-blue-400/20",
    shipped:    "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20",
    delivered:  "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20",
    cancelled:  "bg-red-400/10 text-red-400 border border-red-400/20",
    refunded:   "bg-amber-400/10 text-amber-400 border border-amber-400/20",
  };

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-bold text-2xl text-white font-mono">Order #{o.order_number}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
              STATUS_COLORS[o.status] ?? STATUS_COLORS.pending
            )}>
              {o.status}
            </span>
            <span className="text-sm text-white/40">
              {new Date(o.created_at).toLocaleDateString("en-NZ", { dateStyle: "long" })}
            </span>
          </div>
        </div>
        <OrderActions orderId={o.id} currentStatus={o.status} trackingNumber={o.tracking_number} />
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          {/* Items */}
          <div className="p-6 bg-[#111113] border border-white/[0.06] rounded-xl">
            <h2 className="font-semibold text-sm text-white mb-4">Items</h2>
            <div className="space-y-3">
              {o.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{item.product_name}</p>
                    <p className="text-xs text-white/30 mt-0.5">Size {item.size} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-white font-mono">
                    ${((item.unit_price * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2 text-sm">
              <div className="flex justify-between text-white/40">
                <span>Subtotal</span><span className="font-mono">${(o.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/40">
                <span>Shipping</span><span className="font-mono">{o.shipping_cost === 0 ? "Free" : `$${(o.shipping_cost / 100).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-white pt-1 border-t border-white/[0.06]">
                <span>Total</span><span className="font-mono">${(o.total / 100).toFixed(2)} NZD</span>
              </div>
            </div>
          </div>

          {/* NZ Post Label */}
          <NzPostLabel order={o} />
        </div>

        {/* Customer + Address */}
        <div className="space-y-4">
          <div className="p-5 bg-[#111113] border border-white/[0.06] rounded-xl">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">Customer</h2>
            <p className="text-sm font-medium text-white">{addr.first_name} {addr.last_name}</p>
            <p className="text-xs text-white/40 mt-1">{o.guest_email}</p>
            {addr.phone && <p className="text-xs text-white/40 mt-0.5">{addr.phone}</p>}
          </div>

          <div className="p-5 bg-[#111113] border border-white/[0.06] rounded-xl">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">Shipping Address</h2>
            <div className="text-sm text-white/60 space-y-0.5">
              <p>{addr.first_name} {addr.last_name}</p>
              <p>{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>{addr.city} {addr.postcode}</p>
              <p>{addr.region}</p>
              <p>{addr.country}</p>
            </div>
          </div>

          {o.tracking_number && (
            <div className="p-5 bg-[#111113] border border-white/[0.06] rounded-xl">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">Tracking</h2>
              <p className="text-sm font-mono text-[#4ade80] font-semibold">{o.tracking_number}</p>
            </div>
          )}

          <EShipButton orderId={o.id} existingTracking={o.tracking_number ?? null} />
        </div>
      </div>
    </div>
  );
}
