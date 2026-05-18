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
    <aside className="w-[260px] shrink-0 flex flex-col h-screen sticky top-0 bg-[#11161F]">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#4ade80]">
            <span className="font-bold text-black text-[11px] tracking-tight leading-none">N2F</span>
          </div>
          <div>
            <p className="font-semibold text-[14px] text-white tracking-wide leading-none">
              NINE2FIVE
            </p>
            <p className="text-[11px] mt-1 leading-none" style={{ color: "#A9B0BC" }}>
              Admin
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {SECTIONS.map((section, si) => (
          <div key={si} className="mb-0.5">
            {section.label && (
              <p
                className="px-3 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "#5A6478" }}
              >
                {section.label}
              </p>
            )}
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 rounded-lg text-[14px] font-medium transition-colors duration-100 min-h-[44px]",
                    active
                      ? "text-white"
                      : "hover:text-white"
                  )}
                  style={{
                    backgroundColor: active ? "#343946" : undefined,
                    color: active ? "#FFFFFF" : "#C5CBD5",
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  }}
                >
                  <Icon
                    className="shrink-0"
                    style={{
                      width: 16,
                      height: 16,
                      color: active ? "#FFFFFF" : "#A9B0BC",
                    }}
                  />
                  <span className="leading-none">{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-3 pb-4">
        <div className="mx-1 mb-2 h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />

        <Link
          href="/admin/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors duration-100 min-h-[44px]"
          style={{ color: "#C5CBD5" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
        >
          <Settings style={{ width: 16, height: 16, color: "#A9B0BC", flexShrink: 0 }} />
          <span className="leading-none">Settings</span>
        </Link>

        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors duration-100 w-full text-left min-h-[44px]"
          style={{ color: "#C5CBD5" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239,68,68,0.08)";
            (e.currentTarget as HTMLElement).style.color = "rgb(252,165,165)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "";
            (e.currentTarget as HTMLElement).style.color = "#C5CBD5";
          }}
        >
          <LogOut style={{ width: 16, height: 16, flexShrink: 0, color: "#A9B0BC" }} />
          <span className="leading-none">Sign out</span>
        </button>

        {/* User chip */}
        <div
          className="flex items-center gap-3 px-3 pt-3 mt-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#4ade80]">
            <span className="text-[10px] text-black font-bold leading-none">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium truncate leading-none" style={{ color: "#C5CBD5" }}>
              {email}
            </p>
            <p className="text-[10px] mt-1 leading-none" style={{ color: "#5A6478" }}>
              Administrator
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
