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
    <div className="flex min-h-screen">
      <AdminSidebar email={user.email!} />
      <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: "#F4F6F9" }}>
        <AdminTopbar />
        <main className="flex-1">
          <div className="px-8 pt-8 pb-12 max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
