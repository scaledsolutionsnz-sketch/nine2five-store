import type { Metadata } from "next";
import "./globals.css";
import { Outfit, Inter } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const BASE_URL = "https://nine2five.nz";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Nine2Five — Māori Grip Socks",
    template: "%s | Nine2Five",
  },
  description: "Premium Māori inspired grip socks built for rugby, sport, and training. New Zealand made.",
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
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </CartProvider>
      </body>
    </html>
  );
}
