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
    pending:    "bg-gray-100 text-gray-500 border-gray-200",
    processing: "bg-blue-50 text-blue-600 border-blue-100",
    shipped:    "bg-green-50 text-green-600 border-green-100",
    delivered:  "bg-emerald-50 text-emerald-600 border-emerald-100",
    cancelled:  "bg-red-50 text-red-500 border-red-100",
    refunded:   "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Order #{o.order_number}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={cn(
              "text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
              STATUS_COLORS[o.status] ?? STATUS_COLORS.pending
            )}>
              {o.status}
            </span>
            <span className="text-sm text-gray-400">
              {new Date(o.created_at).toLocaleDateString("en-NZ", { dateStyle: "long" })}
            </span>
          </div>
        </div>
        <OrderActions orderId={o.id} currentStatus={o.status} trackingNumber={o.tracking_number} />
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          {/* Items */}
          <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
            <h2 className="font-display font-semibold text-sm text-gray-900 mb-4">Items</h2>
            <div className="space-y-3">
              {o.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Size {item.size} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-display font-semibold text-gray-900">
                    ${((item.unit_price * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>${(o.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span><span>{o.shipping_cost === 0 ? "Free" : `$${(o.shipping_cost / 100).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-base text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span><span>${(o.total / 100).toFixed(2)} NZD</span>
              </div>
            </div>
          </div>

          {/* NZ Post Label */}
          <NzPostLabel order={o} />
        </div>

        {/* Customer + Address */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Customer</h2>
            <p className="text-sm font-medium text-gray-900">{addr.first_name} {addr.last_name}</p>
            <p className="text-xs text-gray-500 mt-1">{o.guest_email}</p>
            {addr.phone && <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>}
          </div>

          <div className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>{addr.first_name} {addr.last_name}</p>
              <p>{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>{addr.city} {addr.postcode}</p>
              <p>{addr.region}</p>
              <p>{addr.country}</p>
            </div>
          </div>

          {o.tracking_number && (
            <div className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Tracking</h2>
              <p className="text-sm font-mono text-[#16a34a] font-semibold">{o.tracking_number}</p>
            </div>
          )}

          <EShipButton orderId={o.id} existingTracking={o.tracking_number ?? null} />
        </div>
      </div>
    </div>
  );
}
