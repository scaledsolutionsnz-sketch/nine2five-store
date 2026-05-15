import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { AccountNav } from "@/components/storefront/account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/account/login");

  // Ensure customer record is linked (handles magic link / OAuth flows)
  await supabase.rpc("link_customer_account");

  return (
    <div className="pt-24 pb-24 px-6 md:px-10 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-[200px_1fr] gap-8">
        <AccountNav email={user.email!} />
        <main>{children}</main>
      </div>
    </div>
  );
}
