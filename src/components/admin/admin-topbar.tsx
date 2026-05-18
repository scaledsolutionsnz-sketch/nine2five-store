"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Bell, ExternalLink } from "lucide-react";

const LABELS: Record<string, string> = {
  "/admin":                 "Dashboard",
  "/admin/analytics":       "Analytics",
  "/admin/orders":          "Orders",
  "/admin/customers":       "Customers",
  "/admin/inventory":       "Inventory",
  "/admin/pos":             "POS Checkout",
  "/admin/discounts":       "Discounts",
  "/admin/affiliates":      "Affiliates",
  "/admin/campaigns":       "Email Campaigns",
  "/admin/suppliers":       "Suppliers",
  "/admin/purchase-orders": "Purchase Orders",
  "/admin/accounting":      "Accounting",
  "/admin/settings":        "Settings",
};

export function AdminTopbar() {
  const pathname = usePathname();
  const base = "/" + pathname.split("/").slice(1, 3).join("/");
  const label = LABELS[base] ?? "Admin";

  return (
    <header className="shrink-0 flex items-center justify-between gap-6 sticky top-0 z-20 h-[72px] px-8 bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.06]">
      {/* Left: page title */}
      <h1 className="font-bold text-[18px] text-white leading-none whitespace-nowrap shrink-0">
        {label}
      </h1>

      {/* Right: controls */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search
            className="absolute left-3.5 pointer-events-none"
            style={{ width: 14, height: 14, color: "rgba(244,244,245,0.3)" }}
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-48 pl-9 pr-10 text-[13px] bg-white/[0.04] border border-white/[0.08] rounded-xl placeholder:text-white/20 text-white focus:outline-none focus:border-[#4ade80]/40 transition-all"
          />
          <kbd className="absolute right-2.5 text-[10px] text-white/20 bg-white/[0.04] border border-white/[0.08] rounded-md px-1.5 py-0.5 leading-none font-mono hidden lg:block">
            ⌘K
          </kbd>
        </div>

        <div className="h-5 w-px bg-white/[0.08] hidden md:block" />

        {/* View store */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 text-[13px] font-medium hover:bg-white/[0.1] hover:text-white transition-all"
        >
          <ExternalLink style={{ width: 13, height: 13 }} strokeWidth={2} />
          Store
        </Link>

        <button className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/50 hover:bg-white/[0.1] hover:text-white/80 transition-all">
          <Bell style={{ width: 15, height: 15 }} strokeWidth={1.8} />
        </button>

        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer bg-[#4ade80]">
          <span className="text-[12px] text-black font-bold leading-none">W</span>
        </div>
      </div>
    </header>
  );
}
