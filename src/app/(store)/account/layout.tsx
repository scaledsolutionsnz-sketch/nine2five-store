import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountNav } from "@/components/storefront/account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/account/login");

  // Ensure customer record is linked (handles magic link / OAuth flows)
  await supabase.rpc("link_customer_account");

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-24 px-8 md:px-16 max-w-screen-xl mx-auto">
      <div className="grid md:grid-cols-[220px_1fr] gap-12">
        <AccountNav email={user.email!} />
        <main>{children}</main>
      </div>
    </div>
  );
}
