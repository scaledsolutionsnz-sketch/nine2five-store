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
      { href: "/admin",            label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics",  label: "Analytics", icon: BarChart2 },
    ],
  },
  {
    group: "Commerce",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/inventory", label: "Inventory", icon: Package },
      { href: "/admin/discounts", label: "Discounts", icon: Tag },
    ],
  },
  {
    group: "Growth",
    items: [
      { href: "/admin/affiliates", label: "Affiliates", icon: UserCheck },
      { href: "/admin/campaigns", label: "Email", icon: Megaphone },
    ],
  },
  {
    group: "Operations",
    items: [
      { href: "/admin/suppliers",       label: "Suppliers",        icon: Warehouse },
      { href: "/admin/purchase-orders", label: "Purchase Orders",  icon: ClipboardList },
      { href: "/admin/accounting",      label: "Accounting",       icon: Receipt },
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
    <aside className="w-60 shrink-0 flex flex-col h-screen bg-[#0d0d0d] border-r border-[#1e1e1e]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#16a34a] flex items-center justify-center">
            <span className="font-black text-white text-[10px] tracking-tight">N2F</span>
          </div>
          <div>
            <p className="font-display font-bold text-sm text-white leading-none">NINE2FIVE</p>
            <p className="text-[10px] text-[#525252] mt-0.5">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {nav.map((section) => (
          <div key={section.group}>
            <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#404040]">
              {section.group}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors group",
                      active
                        ? "bg-[#16a34a]/10 text-[#16a34a] font-medium"
                        : "text-[#737373] hover:text-white hover:bg-[#1a1a1a]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                    {active && <ChevronRight className="h-3 w-3 ml-auto opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-[#1e1e1e] pt-3">
        <Link
          href="/admin/settings"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[#737373] hover:text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[#737373] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
        <div className="px-2.5 pt-2">
          <p className="text-[10px] text-[#404040] truncate">{email}</p>
        </div>
      </div>
    </aside>
  );
}
