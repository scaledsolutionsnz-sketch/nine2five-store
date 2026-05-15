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
  ChevronRight,
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
    <aside className="w-56 shrink-0 flex flex-col h-screen bg-[#080808] border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#16a34a] flex items-center justify-center shrink-0 shadow-lg shadow-[#16a34a]/20">
            <span className="font-black text-white text-[9px] tracking-tight">N2F</span>
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-[13px] text-white leading-none tracking-wide">NINE2FIVE</p>
            <p className="text-[10px] text-[#3f3f3f] mt-0.5 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5 scrollbar-none">
        {nav.map((section) => (
          <div key={section.group}>
            <p className="px-2 mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#333]">
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
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 group relative",
                      active
                        ? "bg-[#16a34a]/10 text-[#16a34a] font-semibold"
                        : "text-[#555] hover:text-[#ccc] hover:bg-white/[0.04] font-medium"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-[#16a34a]" />
                    )}
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-[#16a34a]" : "text-[#444] group-hover:text-[#888]")} />
                    {label}
                    {active && <ChevronRight className="h-3 w-3 ml-auto opacity-40" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-2.5 space-y-px">
        <Link
          href="/admin/settings"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-[#555] hover:text-[#ccc] hover:bg-white/[0.04] transition-all"
        >
          <Settings className="h-3.5 w-3.5" />
          Settings
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-[#555] hover:text-rose-400 hover:bg-rose-500/5 transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
        <div className="px-2.5 pt-2 pb-0.5">
          <p className="text-[10px] text-[#2e2e2e] truncate font-medium">{email}</p>
        </div>
      </div>
    </aside>
  );
}
