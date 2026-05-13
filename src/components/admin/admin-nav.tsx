"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Users, Package, Mail, LogOut, ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Inventory", href: "/admin/inventory", icon: Package },
  { label: "Campaigns", href: "/admin/campaigns", icon: Mail },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  return (
    <aside className="w-[200px] shrink-0 flex flex-col bg-[#0d0d0d] border-r border-[#1a1a1a] h-full">
      <div className="px-4 py-5 border-b border-[#1a1a1a]">
        <p className="font-display font-black text-base tracking-tight">NINE2FIVE</p>
        <p className="text-[10px] text-[#525252] mt-0.5 uppercase tracking-widest">Admin</p>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
              isActive(href)
                ? "bg-[#16a34a]/10 text-[#16a34a]"
                : "text-[#737373] hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-2 pb-3 space-y-0.5 border-t border-[#1a1a1a] pt-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#525252] hover:text-white transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Store
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#525252] hover:text-[#ef4444] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
        <div className="mx-1 mt-2 px-3 py-2 rounded-lg bg-[#141414] border border-[#1e1e1e]">
          <p className="text-[10px] text-[#525252] truncate">{email}</p>
        </div>
      </div>
    </aside>
  );
}
