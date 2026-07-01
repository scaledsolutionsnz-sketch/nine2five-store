import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

type PayoutMethod = "bank_nz" | "paypal" | "wise";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

// Ambassador updates their OWN payout details. Auth is checked via the cookie
// client (getUser); the write uses a true service-role client scoped to
// .eq("user_id", user.id) so it only ever touches the caller's own row and is
// not blocked by RLS (affiliates has no self-UPDATE policy by design).
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    country?: string;
    payout_method?: PayoutMethod;
    payout_bank_name?: string;
    payout_bank_account?: string;
    paypal_email?: string;
    wise_email?: string;
    wise_account_ref?: string;
  };

  const method = body.payout_method;
  if (!method || !["bank_nz", "paypal", "wise"].includes(method)) {
    return NextResponse.json({ error: "Choose a payout method" }, { status: 400 });
  }

  const update: Record<string, string | null> = {
    payout_method: method,
    country: (body.country ?? "NZ").trim() || "NZ",
  };

  // Only validate + store the fields for the chosen method; clear the others so
  // stale details from a previously-selected method don't linger.
  if (method === "bank_nz") {
    const name = (body.payout_bank_name ?? "").trim();
    const acct = (body.payout_bank_account ?? "").trim();
    if (!name) return NextResponse.json({ error: "Enter the account name" }, { status: 400 });
    const digits = acct.replace(/[^0-9]/g, "");
    if (digits.length < 15 || digits.length > 16) {
      return NextResponse.json({ error: "Enter a valid NZ bank account number" }, { status: 400 });
    }
    update.payout_bank_name = name;
    update.payout_bank_account = acct;
    update.paypal_email = null;
    update.wise_email = null;
    update.wise_account_ref = null;
  } else if (method === "paypal") {
    const email = (body.paypal_email ?? "").trim();
    if (!isEmail(email)) return NextResponse.json({ error: "Enter a valid PayPal email" }, { status: 400 });
    update.paypal_email = email;
    update.payout_bank_name = null;
    update.payout_bank_account = null;
    update.wise_email = null;
    update.wise_account_ref = null;
  } else {
    // wise
    const email = (body.wise_email ?? "").trim();
    if (!isEmail(email)) return NextResponse.json({ error: "Enter a valid Wise email" }, { status: 400 });
    update.wise_email = email;
    update.wise_account_ref = (body.wise_account_ref ?? "").trim() || null;
    update.payout_bank_name = null;
    update.payout_bank_account = null;
    update.paypal_email = null;
  }

  const service = createServiceRoleClient();
  const { error } = await service
    .from("affiliates")
    .update(update)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (error) {
    // Never echo payout values. Surface a generic message (plus a hint if the
    // schema migration hasn't been applied yet).
    const missingCol = error.code === "42703";
    return NextResponse.json(
      { error: missingCol ? "Payout fields not available yet — migration pending" : "Failed to save" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, payout_method: method });
}
