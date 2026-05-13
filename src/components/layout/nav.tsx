"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

export function Nav() {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
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

        <div className="flex items-center gap-4">
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
          {["Shop", "Kahotea", "Limited", "About"].map((item) => (
            <Link
              key={item}
              href={item === "Shop" ? "/shop" : item === "About" ? "/#about" : `/shop?collection=${item.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-[#a3a3a3] hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
