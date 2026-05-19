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
    <aside className="w-[256px] shrink-0 flex flex-col h-screen sticky top-0" style={{ backgroundColor: "#0F1319", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Logo */}
      <div className="px-5 pt-7 pb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#3a7722]">
            <span className="font-black text-black text-[11px] tracking-tight leading-none">N2F</span>
          </div>
          <div>
            <p className="font-bold text-[15px] text-white tracking-wide leading-none">Nine2Five</p>
            <p className="text-[11px] mt-1.5 leading-none font-medium" style={{ color: "#6B7280" }}>Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 overflow-y-auto pb-2">
        {SECTIONS.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-5" : ""}>
            {section.label && (
              <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "#4B5563" }}>
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 h-[38px] rounded-lg text-[13px] font-medium transition-all duration-100",
                      active ? "text-white" : "text-[#9CA3AF]"
                    )}
                    style={{
                      backgroundColor: active ? "rgba(17,109,255,0.15)" : undefined,
                      boxShadow: active ? "inset 2px 0 0 #116DFF" : undefined,
                    }}
                    onMouseEnter={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                      if (!active) (e.currentTarget as HTMLElement).style.color = "#E5E7EB";
                    }}
                    onMouseLeave={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "";
                      if (!active) (e.currentTarget as HTMLElement).style.color = "#9CA3AF";
                    }}
                  >
                    <Icon className="shrink-0" style={{ width: 15, height: 15, color: active ? "#60A5FA" : "#6B7280" }} />
                    <span className="leading-none">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-4 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="pt-4 space-y-0.5">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 h-[38px] rounded-lg text-[13px] font-medium text-[#9CA3AF] transition-all duration-100"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "#E5E7EB"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}
          >
            <Settings style={{ width: 15, height: 15, color: "#6B7280", flexShrink: 0 }} />
            <span className="leading-none">Settings</span>
          </Link>

          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 h-[38px] rounded-lg text-[13px] font-medium w-full text-left text-[#9CA3AF] transition-all duration-100"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLElement).style.color = "#FCA5A5"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}
          >
            <LogOut style={{ width: 15, height: 15, flexShrink: 0, color: "#6B7280" }} />
            <span className="leading-none">Sign out</span>
          </button>
        </div>

        {/* User chip */}
        <div className="flex items-center gap-3 mt-4 px-3 py-3 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#3a7722]">
            <span className="text-[11px] text-black font-bold leading-none">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold truncate leading-none" style={{ color: "#D1D5DB" }}>{email}</p>
            <p className="text-[10px] mt-1.5 leading-none font-medium" style={{ color: "#4B5563" }}>Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
