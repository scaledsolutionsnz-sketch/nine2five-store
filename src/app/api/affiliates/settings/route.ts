import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    payout_bank_name?: string;
    payout_bank_account?: string;
  };

  const update: Record<string, string> = {};

  if (typeof body.payout_bank_name === "string") {
    update.payout_bank_name = body.payout_bank_name.trim();
  }
  if (typeof body.payout_bank_account === "string") {
    // Normalise NZ bank account to XX-XXXX-XXXXXXX-XX format
    const raw = body.payout_bank_account.replace(/[^0-9]/g, "");
    if (raw.length < 15 || raw.length > 16) {
      return NextResponse.json({ error: "Invalid NZ bank account number" }, { status: 400 });
    }
    update.payout_bank_account = body.payout_bank_account.trim();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data, error } = await service
    .from("affiliates")
    .update(update)
    .eq("user_id", user.id)
    .select("id, payout_bank_name, payout_bank_account")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
