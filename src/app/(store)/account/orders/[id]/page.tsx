import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShippingAddress } from "@/types/database";

const STATUS_STYLES: Record<string, string> = {
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-white/[0.05] text-white/40 border-white/[0.08]",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const STATUS_STEPS = ["processing", "shipped", "delivered"];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: customer } = await supabase
    .from("customers").select("id").eq("email", user!.email!).single();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, image_urls))")
    .eq("id", id)
    .eq("customer_id", customer?.id ?? "")
    .single();

  if (!order) notFound();

  const addr = order.shipping_address as ShippingAddress;
  const items = order.order_items as Array<{
    id: string; product_name: string; size: string; quantity: number; unit_price: number;
    products?: { name: string; image_urls: string[] } | null;
  }>;

  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" /> All Orders
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-black text-2xl text-white mb-8">Order #{order.order_number}</h1>
            <p className="text-white/40 text-sm -mt-6">
              Placed {new Date(order.created_at).toLocaleDateString("en-NZ", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>
          <span className={cn(
            "text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border",
            STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
          )}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Tracking progress */}
      {!["cancelled", "refunded"].includes(order.status) && (
        <div className="bg-[#192d1e] border border-white/[0.08] rounded-2xl p-5">
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => {
              const done = stepIndex >= i;
              const current = stepIndex === i;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                      done
                        ? "bg-[#3a7722] border-[#3a7722] text-black"
                        : "bg-[#192d1e] border-white/[0.08] text-white/30"
                    )}>
                      {done ? "✓" : i + 1}
                    </div>
                    <p className={cn("text-[10px] mt-1 capitalize font-medium", done ? "text-[#3a7722]" : "text-white/30")}>
                      {step}
                    </p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-2 mb-4", done && stepIndex > i ? "bg-[#3a7722]" : "bg-white/[0.08]")} />
                  )}
                </div>
              );
            })}
          </div>
          {order.tracking_number && (
            <p className="text-xs text-[#3a7722] mt-3 pt-3 border-t border-white/[0.06]">
              Tracking: <span className="font-mono">{order.tracking_number}</span>
            </p>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-[#192d1e] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-semibold text-sm text-white">Items</h2>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {items.map((item) => {
            const img = item.products?.image_urls?.[0];
            return (
              <div key={item.id} className="flex gap-4 px-5 py-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#1a1a1a] shrink-0">
                  {img && <Image src={img} alt={item.product_name} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{item.product_name}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Size {item.size} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-display font-semibold text-white shrink-0">
                  ${((item.unit_price * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-4 border-t border-white/[0.06] space-y-2 text-sm">
          <div className="flex justify-between text-white/40">
            <span>Subtotal</span>
            <span>${(order.subtotal / 100).toFixed(2)}</span>
          </div>
          {order.discount_amount_cents > 0 && (
            <div className="flex justify-between text-[#3a7722]">
              <span>Discount ({order.discount_code})</span>
              <span>−${(order.discount_amount_cents / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-white/40">
            <span>Shipping</span>
            <span>{order.shipping_cost === 0 ? "Free" : `$${(order.shipping_cost / 100).toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-display font-bold text-white pt-2 border-t border-white/[0.06]">
            <span>Total</span>
            <span>${(order.total / 100).toFixed(2)} NZD</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="bg-[#192d1e] border border-white/[0.08] rounded-2xl p-5">
        <h2 className="font-display font-semibold text-sm text-white mb-3">Shipping Address</h2>
        <div className="text-sm text-white/40 space-y-0.5">
          <p className="text-white font-medium">{addr.first_name} {addr.last_name}</p>
          <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
          <p>{addr.city}, {addr.region} {addr.postcode}</p>
          <p>{addr.country === "NZ" ? "New Zealand" : "Australia"}</p>
          {addr.phone && <p>{addr.phone}</p>}
        </div>
      </div>
    </div>
  );
}
