import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "sonner";

const BASE_URL = "https://nine2five.co.nz";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Nine2Five — Māori Grip Socks",
    template: "%s | Nine2Five",
  },
  description: "Premium Māori inspired grip socks built for rugby, sport, and training. New Zealand made. Free NZ shipping on orders over $75.",
  keywords: ["grip socks", "Māori", "rugby socks", "New Zealand", "sport socks", "grip socks NZ", "nine2five"],
  authors: [{ name: "Nine2Five" }],
  creator: "Nine2Five",
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: BASE_URL,
    siteName: "Nine2Five",
    title: "Nine2Five — Māori Grip Socks",
    description: "Premium Māori inspired grip socks built for rugby, sport, and training.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Nine2Five Māori Grip Socks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nine2Five — Māori Grip Socks",
    description: "Premium Māori inspired grip socks built for rugby, sport, and training.",
    images: ["https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1200&q=80"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
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
