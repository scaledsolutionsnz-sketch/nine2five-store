import type { Affiliate } from "@/types/database";

export type SubmissionRow = { affiliate: Affiliate; discountCode: string | null };

export function fmtMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// A list of [label, value] payout fields for the ambassador's chosen method.
export function payoutFields(a: Affiliate): { method: string; fields: [string, string][] } {
  switch (a.payout_method) {
    case "bank_nz":
      return {
        method: "NZ bank transfer",
        fields: [
          ["Account name", a.payout_bank_name ?? "—"],
          ["Account number", a.payout_bank_account ?? "—"],
        ],
      };
    case "paypal":
      return { method: "PayPal", fields: [["PayPal email", a.paypal_email ?? "—"]] };
    case "wise":
      return {
        method: "Wise",
        fields: [
          ["Wise email", a.wise_email ?? "—"],
          ["Wise account ref", a.wise_account_ref ?? "—"],
        ],
      };
    default:
      return { method: "Not set yet", fields: [] };
  }
}
