"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Megaphone,
  Tag,
  UserCheck,
  Warehouse,
  ClipboardList,
  BarChart2,
  Receipt,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/admin",                 label: "Dashboard",      icon: LayoutDashboard },
  { href: "/admin/analytics",       label: "Analytics",      icon: BarChart2 },
  { href: "/admin/orders",          label: "Orders",         icon: ShoppingBag },
  { href: "/admin/customers",       label: "Customers",      icon: Users },
  { href: "/admin/inventory",       label: "Inventory",      icon: Package },
  { href: "/admin/discounts",       label: "Discounts",      icon: Tag },
  { href: "/admin/affiliates",      label: "Affiliates",     icon: UserCheck },
  { href: "/admin/campaigns",       label: "Email",          icon: Megaphone },
  { href: "/admin/suppliers",       label: "Suppliers",      icon: Warehouse },
  { href: "/admin/purchase-orders", label: "Purchase Orders",icon: ClipboardList },
  { href: "/admin/accounting",      label: "Accounting",     icon: Receipt },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <aside className="w-72 shrink-0 flex flex-col h-screen bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#16a34a] flex items-center justify-center shrink-0">
            <span className="font-black text-white text-[9px] tracking-tight">N2F</span>
          </div>
          <div>
            <p className="font-display font-bold text-sm text-gray-900 leading-none">NINE2FIVE</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 flex flex-col min-h-0">
        <div className="flex flex-col flex-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex items-center gap-4 px-4 rounded-xl text-[15px] transition-all duration-100",
                  active
                    ? "bg-[#16a34a]/10 text-[#16a34a] font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", active ? "text-[#16a34a]" : "text-gray-400")} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3 space-y-1">
        <Link
          href="/admin/settings"
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
        >
          <Settings className="h-5 w-5 text-gray-400" />
          Settings
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] font-medium text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
        <div className="px-4 pt-2">
          <p className="text-[11px] text-gray-300 truncate">{email}</p>
        </div>
      </div>
    </aside>
  );
}
