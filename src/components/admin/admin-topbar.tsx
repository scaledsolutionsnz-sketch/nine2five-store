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
    <header
      className="shrink-0 flex items-center justify-between gap-6 sticky top-0 z-20"
      style={{
        height: 72,
        paddingLeft: 32,
        paddingRight: 32,
        backgroundColor: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #e8eaed",
      }}
    >
      {/* Left: page title */}
      <h1 className="font-semibold text-[18px] text-gray-900 leading-none whitespace-nowrap shrink-0">
        {label}
      </h1>

      {/* Right: controls */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search
            className="absolute left-3.5 pointer-events-none"
            style={{ width: 14, height: 14, color: "#9ca3af" }}
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-48 pl-9 pr-10 text-[13px] bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
          />
          <kbd className="absolute right-2.5 text-[10px] text-gray-400 bg-white border border-gray-200 rounded-md px-1.5 py-0.5 leading-none font-mono hidden lg:block">
            ⌘K
          </kbd>
        </div>

        <div className="h-5 w-px bg-gray-200 hidden md:block" />

        {/* View store */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-gray-200 text-gray-500 text-[13px] font-medium hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-all"
        >
          <ExternalLink style={{ width: 13, height: 13 }} strokeWidth={2} />
          Store
        </Link>

        <button className="h-9 w-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-all">
          <Bell style={{ width: 15, height: 15 }} strokeWidth={1.8} />
        </button>

        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
          style={{ backgroundColor: "#16a34a" }}
        >
          <span className="text-[12px] text-white font-bold leading-none">W</span>
        </div>
      </div>
    </header>
  );
}
