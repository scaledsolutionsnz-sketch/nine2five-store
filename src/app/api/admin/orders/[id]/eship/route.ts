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

  const addr = order.shipping_address as ShippingAddress;
  const totalPairs = (order.order_items as Array<{ quantity: number }>)
    .reduce((s, i) => s + i.quantity, 0);

  try {
    const result = await createEShipShipment({
      orderNumber: order.order_number,
      shippingAddress: addr,
      totalPairs,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "eShip error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
