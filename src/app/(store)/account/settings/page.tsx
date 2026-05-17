import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";
import type { Customer } from "@/types/database";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: customer } = await supabase
    .from("customers").select("*").eq("email", user!.email!).single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl text-white mb-8">Settings</h1>
        <p className="text-white/40 text-sm -mt-6">Manage your profile and preferences</p>
      </div>
      <SettingsForm customer={customer as Customer | null} email={user!.email!} />
    </div>
  );
}
