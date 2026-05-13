export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderActions } from "./order-actions";
import { NzPostLabel } from "./nz-post-label";
import type { OrderWithItems, ShippingAddress } from "@/types/database";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const o = order as OrderWithItems;
  const addr = o.shipping_address as ShippingAddress;

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-[#737373]/15 text-[#a3a3a3]",
    processing: "bg-blue-500/15 text-blue-400",
    shipped: "bg-[#16a34a]/15 text-[#16a34a]",
    delivered: "bg-emerald-500/15 text-emerald-400",
    cancelled: "bg-rose-500/15 text-rose-400",
    refunded: "bg-amber-500/15 text-amber-400",
  };

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Order #{o.order_number}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[o.status] ?? ""}`}>
              {o.status}
            </span>
            <span className="text-sm text-[#737373]">
              {new Date(o.created_at).toLocaleDateString("en-NZ", { dateStyle: "long" })}
            </span>
          </div>
        </div>
        <OrderActions orderId={o.id} currentStatus={o.status} trackingNumber={o.tracking_number} />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Items */}
          <div className="p-6 rounded-xl bg-[#141414] border border-[#1e1e1e]">
            <h2 className="font-display font-bold text-base mb-4">Items</h2>
            <div className="space-y-3">
              {o.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs text-[#737373]">Size {item.size} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-display font-bold">${((item.unit_price * item.quantity) / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#262626] space-y-2 text-sm">
              <div className="flex justify-between text-[#737373]">
                <span>Subtotal</span><span>${(o.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#737373]">
                <span>Shipping</span><span>{o.shipping_cost === 0 ? "Free" : `$${(o.shipping_cost / 100).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-base">
                <span>Total</span><span>${(o.total / 100).toFixed(2)} NZD</span>
              </div>
            </div>
          </div>

          {/* NZ Post Label */}
          <NzPostLabel order={o} />
        </div>

        {/* Customer + Address */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-[#141414] border border-[#1e1e1e]">
            <h2 className="font-display font-bold text-sm mb-4 uppercase tracking-widest text-[#525252]">Customer</h2>
            <p className="text-sm font-medium">{addr.first_name} {addr.last_name}</p>
            <p className="text-xs text-[#737373] mt-0.5">{o.guest_email}</p>
            {addr.phone && <p className="text-xs text-[#737373]">{addr.phone}</p>}
          </div>

          <div className="p-5 rounded-xl bg-[#141414] border border-[#1e1e1e]">
            <h2 className="font-display font-bold text-sm mb-4 uppercase tracking-widest text-[#525252]">Shipping Address</h2>
            <div className="text-sm text-[#a3a3a3] space-y-0.5">
              <p>{addr.first_name} {addr.last_name}</p>
              <p>{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>{addr.city} {addr.postcode}</p>
              <p>{addr.region}</p>
              <p>{addr.country}</p>
            </div>
          </div>

          {o.tracking_number && (
            <div className="p-5 rounded-xl bg-[#141414] border border-[#1e1e1e]">
              <h2 className="font-display font-bold text-sm mb-2 uppercase tracking-widest text-[#525252]">Tracking</h2>
              <p className="text-sm font-mono text-[#16a34a]">{o.tracking_number}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
