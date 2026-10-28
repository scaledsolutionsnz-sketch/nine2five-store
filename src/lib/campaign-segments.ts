import type { SupabaseClient } from "@supabase/supabase-js";

const PAID = ["processing", "shipped", "delivered"];

/** Lowercased emails of everyone with at least one paid order (guest or signed-in). */
export async function pastCustomerEmails(supabase: SupabaseClient): Promise<Set<string>> {
  const emails = new Set<string>();
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await supabase
      .from("orders")
      .select("guest_email, customers(email)")
      .in("status", PAID)
      .range(from, from + page - 1);
    if (error) throw error;
    for (const o of data ?? []) {
      const c = o.customers as { email: string | null } | { email: string | null }[] | null;
      const email = o.guest_email ?? (Array.isArray(c) ? c[0]?.email : c?.email);
      if (email) emails.add(email.toLowerCase());
    }
    if (!data || data.length < page) break;
  }
  return emails;
}

/** Subscribed customers who have ordered before. */
export async function pastCustomerRecipients(supabase: SupabaseClient): Promise<{ email: string; first_name: string | null }[]> {
  const buyers = await pastCustomerEmails(supabase);
  const out: { email: string; first_name: string | null }[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await supabase
      .from("customers")
      .select("email, first_name")
      .eq("accepts_marketing", true)
      .range(from, from + page - 1);
    if (error) throw error;
    for (const c of data ?? []) if (c.email && buyers.has(c.email.toLowerCase())) out.push(c);
    if (!data || data.length < page) break;
  }
  return out;
}
