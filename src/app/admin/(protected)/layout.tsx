import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

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
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <AdminSidebar email={user.email!} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
