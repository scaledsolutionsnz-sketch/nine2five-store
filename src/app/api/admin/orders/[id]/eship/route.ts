import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createEShipShipment } from "@/lib/eship";
import type { ShippingAddress } from "@/types/database";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const addr = order.shipping_address as ShippingAddress | null;
  // Guard: without a real shipping address there's nothing to send. Return a clear
  // message instead of letting eShip crash deep in the payload build.
  if (!addr || !addr.line1 || !addr.city || !addr.postcode) {
    return NextResponse.json(
      { error: "This order has no shipping address — add one before sending to eShip." },
      { status: 400 }
    );
  }

  const orderItems = order.order_items as Array<{ quantity: number; variant_id: string; product_name: string; size: string; unit_price: number }>;
  const totalPairs = orderItems.reduce((s, i) => s + i.quantity, 0);

  try {
    const result = await createEShipShipment({
      orderNumber: order.order_number,
      shippingAddress: addr,
      totalPairs,
      items: orderItems.map((i) => ({
        sku: i.variant_id,
        description: `${i.product_name} – ${i.size}`,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "eShip error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
