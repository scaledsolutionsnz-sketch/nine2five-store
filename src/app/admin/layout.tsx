import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("email")
    .eq("email", user.email!)
    .single();

  if (!admin) redirect("/admin/login");

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      <AdminNav email={user.email!} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
