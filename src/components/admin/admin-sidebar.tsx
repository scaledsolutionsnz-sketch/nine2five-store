"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Users, Package,
  Megaphone, Tag, UserCheck, Warehouse, ClipboardList,
  BarChart2, Receipt, Settings, LogOut, ShoppingCart, Inbox, ImagePlay, Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SECTIONS = [
  {
    items: [
      { href: "/admin",           label: "Dashboard",  icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics",  icon: BarChart2 },
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
      { href: "/admin/inbox",        label: "Inbox",           icon: Inbox },
      { href: "/admin/campaigns",    label: "Email Campaigns", icon: Megaphone },
      { href: "/admin/social",       label: "Social",          icon: ImagePlay },
      { href: "/admin/ambassadors",  label: "Ambassadors",     icon: Star },
    ],
  },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [inboxCount, setInboxCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("inbox_threads")
      .select("*", { count: "exact", head: true })
      .eq("status", "needs_reply")
      .then(({ count }) => setInboxCount(count ?? 0));
  }, [pathname]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const initials = email.slice(0, 2).toUpperCase();

  return (
    <aside
      className="w-[248px] shrink-0 flex flex-col h-screen sticky top-0"
      style={{ backgroundColor: "#07180E", borderRight: "1px solid rgba(46,139,40,0.15)" }}
    >
      {/* Logo */}
      <div className="px-6 pt-7 pb-6 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/admin" style={{ textDecoration: "none" }}>
          <p
            className="font-display font-black leading-none"
            style={{ fontSize: 22, letterSpacing: "-0.04em", color: "#ffffff" }}
          >
            NINE<span style={{ color: "#2f9b2f" }}>2</span>FIVE
          </p>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: 6 }}>
            Admin Panel
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {SECTIONS.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-6" : ""}>
            {section.label && (
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "0 10px", marginBottom: 8 }}>
                {section.label}
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "0 10px",
                      height: 38,
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      textDecoration: "none",
                      color: active ? "#ffffff" : "rgba(255,255,255,0.45)",
                      backgroundColor: active ? "rgba(47,155,47,0.18)" : "transparent",
                      borderLeft: active ? "2px solid #2f9b2f" : "2px solid transparent",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                      }
                    }}
                  >
                    <Icon style={{ width: 14, height: 14, color: active ? "#2f9b2f" : "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                    <span style={{ lineHeight: 1, flex: 1 }}>{label}</span>
                    {href === "/admin/inbox" && inboxCount > 0 && (
                      <span style={{ background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 999, lineHeight: 1.4 }}>
                        {inboxCount > 99 ? "99+" : inboxCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-3 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 1 }}>
          <Link
            href="/admin/settings"
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px", height: 38, borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: "none", color: "rgba(255,255,255,0.45)", transition: "all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
          >
            <Settings style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <span style={{ lineHeight: 1 }}>Settings</span>
          </Link>

          <button
            onClick={signOut}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px", height: 38, borderRadius: 10, fontSize: 13, fontWeight: 500, width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.45)", transition: "all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fca5a5"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
          >
            <LogOut style={{ width: 14, height: 14, flexShrink: 0, color: "rgba(255,255,255,0.3)" }} />
            <span style={{ lineHeight: 1 }}>Sign out</span>
          </button>
        </div>

        {/* User chip */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "10px 12px", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#2f9b2f" }}>
            <span style={{ fontSize: 11, color: "#fff", fontWeight: 800, lineHeight: 1 }}>{initials}</span>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1, marginBottom: 4 }}>{email}</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", lineHeight: 1 }}>Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
