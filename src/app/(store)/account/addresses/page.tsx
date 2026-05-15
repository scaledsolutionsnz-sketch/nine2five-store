import { createClient } from "@/lib/supabase/server";
import { AddressForm } from "./address-form";
import type { Customer } from "@/types/database";

export default async function AddressesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("email", user!.email!)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Addresses</h1>
        <p className="text-sm text-[#737373] mt-1">Save your default shipping address for faster checkout</p>
      </div>
      <AddressForm customer={customer as Customer | null} />
    </div>
  );
}
