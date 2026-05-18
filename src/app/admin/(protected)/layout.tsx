import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

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
    <div className="h-screen flex overflow-hidden bg-[#09090b]">
      <AdminSidebar email={user.email!} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#09090b]">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
