import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ShippingAddress } from "@/types/database";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    first_name?: string;
    last_name?: string;
    phone?: string;
    accepts_marketing?: boolean;
    default_shipping_address?: ShippingAddress;
  };

  const update: Record<string, unknown> = {};
  if (body.first_name !== undefined) update.first_name = body.first_name.trim();
  if (body.last_name !== undefined) update.last_name = body.last_name.trim();
  if (body.phone !== undefined) update.phone = body.phone || null;
  if (body.accepts_marketing !== undefined) update.accepts_marketing = body.accepts_marketing;
  if (body.default_shipping_address !== undefined) update.default_shipping_address = body.default_shipping_address;

  const { data, error } = await supabase
    .from("customers")
    .update(update)
    .eq("email", user.email!)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
