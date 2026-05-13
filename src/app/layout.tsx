import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Nine2Five — Māori Grip Socks",
  description: "Premium Māori inspired grip socks built for rugby, sport, and training. Designed in New Zealand.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </CartProvider>
      </body>
    </html>
  );
}
