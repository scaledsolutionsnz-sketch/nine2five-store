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
  {
    group: "Overview",
    items: [
      { href: "/admin",           label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
    ],
  },
  {
    group: "Commerce",
    items: [
      { href: "/admin/orders",    label: "Orders",    icon: ShoppingBag },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/inventory", label: "Inventory", icon: Package },
      { href: "/admin/discounts", label: "Discounts", icon: Tag },
    ],
  },
  {
    group: "Growth",
    items: [
      { href: "/admin/affiliates", label: "Affiliates", icon: UserCheck },
      { href: "/admin/campaigns",  label: "Email",       icon: Megaphone },
    ],
  },
  {
    group: "Operations",
    items: [
      { href: "/admin/suppliers",       label: "Suppliers",       icon: Warehouse },
      { href: "/admin/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
      { href: "/admin/accounting",      label: "Accounting",      icon: Receipt },
    ],
  },
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
    <aside className="w-56 shrink-0 flex flex-col h-screen bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#16a34a] flex items-center justify-center shrink-0">
            <span className="font-black text-white text-[9px] tracking-tight">N2F</span>
          </div>
          <div>
            <p className="font-display font-bold text-[13px] text-gray-900 leading-none tracking-wide">NINE2FIVE</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {nav.map((section) => (
          <div key={section.group}>
            <p className="px-2 mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-300">
              {section.group}
            </p>
            <div className="space-y-px">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 font-medium",
                      active
                        ? "bg-[#16a34a]/8 text-[#16a34a]"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-[#16a34a]" : "text-gray-400")} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-3 py-3 space-y-px">
        <Link
          href="/admin/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
        >
          <Settings className="h-3.5 w-3.5 text-gray-400" />
          Settings
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:text-rose-500 hover:bg-rose-50 transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
        <div className="px-3 pt-2">
          <p className="text-[10px] text-gray-300 truncate">{email}</p>
        </div>
      </div>
    </aside>
  );
}
