"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingBag, Users, Package,
  Megaphone, Tag, UserCheck, Warehouse, ClipboardList,
  BarChart2, Receipt, Settings, LogOut, ShoppingCart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const SECTIONS = [
  {
    items: [
      { href: "/admin",           label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/pos",        label: "POS Checkout", icon: ShoppingCart },
      { href: "/admin/orders",     label: "Orders",       icon: ShoppingBag },
      { href: "/admin/customers",  label: "Customers",    icon: Users },
      { href: "/admin/inventory",  label: "Inventory",    icon: Package },
      { href: "/admin/discounts",  label: "Discounts",    icon: Tag },
      { href: "/admin/affiliates", label: "Affiliates",   icon: UserCheck },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/suppliers",       label: "Suppliers",       icon: Warehouse },
      { href: "/admin/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
      { href: "/admin/accounting",      label: "Accounting",      icon: Receipt },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/campaigns", label: "Email Campaigns", icon: Megaphone },
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

  const username = email.split("@")[0];
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <aside className="w-[240px] shrink-0 flex flex-col h-full bg-[#0c0c0e] border-r border-white/[0.05]">
      {/* Logo */}
      <div className="px-5 pt-7 pb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#4ade80]">
            <span className="font-bold text-black text-[10px] tracking-tight leading-none">N2F</span>
          </div>
          <div>
            <p className="font-semibold text-[13px] text-white tracking-wider leading-none">
              NINE2FIVE
            </p>
            <p className="text-[11px] mt-0.5 leading-none text-white/30">
              Admin
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-2 h-px bg-white/[0.06]" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {SECTIONS.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-6" : ""}>
            {section.label && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/[0.22]">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-px">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-100",
                      active
                        ? "bg-[#4ade80]/[0.08] text-white"
                        : "text-white/[0.38] hover:bg-white/[0.04] hover:text-white/70"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full bg-[#4ade80]" />
                    )}
                    <Icon
                      className="shrink-0 transition-colors duration-100"
                      style={{
                        width: 15, height: 15,
                        color: active ? "#4ade80" : "rgba(255,255,255,0.28)",
                      }}
                    />
                    <span className="leading-none">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-2 pb-4">
        <div className="mx-3 mb-2 h-px bg-white/[0.06]" />

        <div className="flex flex-col gap-px">
          <Link
            href="/admin/settings"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-100 text-white/[0.38] hover:bg-white/[0.04] hover:text-white/70"
          >
            <Settings style={{ width: 15, height: 15, color: "rgba(255,255,255,0.28)", flexShrink: 0 }} />
            <span className="leading-none">Settings</span>
          </Link>

          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-100 w-full text-left text-white/[0.38] hover:bg-red-500/[0.08] hover:text-red-300/70"
          >
            <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
            <span className="leading-none">Sign out</span>
          </button>
        </div>

        {/* User chip */}
        <div className="flex items-center gap-3 mx-1 px-3 pt-4 mt-2 border-t border-white/[0.06]">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#4ade80]">
            <span className="text-[10px] text-black font-bold leading-none">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium truncate leading-none text-white/55">
              {username}
            </p>
            <p className="text-[10px] mt-0.5 leading-none text-white/[0.22]">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
