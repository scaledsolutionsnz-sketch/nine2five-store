"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function Nav() {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#262626]"
          : "bg-transparent"
      )}
    >
      <nav className="flex items-center justify-between px-6 md:px-10 h-16">
        <Link href="/" className="font-display font-black text-xl tracking-tight text-white">
          NINE2FIVE
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="text-sm font-medium text-[#a3a3a3] hover:text-white transition-colors">
            Shop
          </Link>
          <Link href="/shop?collection=kahotea" className="text-sm font-medium text-[#a3a3a3] hover:text-white transition-colors">
            Kahotea
          </Link>
          <Link href="/shop?collection=limited" className="text-sm font-medium text-[#a3a3a3] hover:text-white transition-colors">
            Limited
          </Link>
          <Link href="/#about" className="text-sm font-medium text-[#a3a3a3] hover:text-white transition-colors">
            About
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Account */}
          <Link
            href={loggedIn ? "/account" : "/account/login"}
            className="relative flex items-center justify-center h-9 w-9 rounded-lg hover:bg-white/8 transition-colors"
            title={loggedIn ? "My Account" : "Sign In"}
          >
            <User className="h-5 w-5" />
            {loggedIn && (
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-[#16a34a]" />
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center h-9 w-9 rounded-lg hover:bg-white/8 transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#16a34a] text-white text-[10px] font-bold flex items-center justify-center">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg hover:bg-white/8 transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-[#262626] px-6 py-4 space-y-4">
          {[
            { label: "Shop", href: "/shop" },
            { label: "Kahotea", href: "/shop?collection=kahotea" },
            { label: "Limited", href: "/shop?collection=limited" },
            { label: "About", href: "/#about" },
            { label: loggedIn ? "My Account" : "Sign In", href: loggedIn ? "/account" : "/account/login" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-[#a3a3a3] hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
