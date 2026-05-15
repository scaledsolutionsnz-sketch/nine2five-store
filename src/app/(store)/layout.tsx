import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { AffiliateTracker } from "@/components/storefront/affiliate-tracker";
import { Pixels } from "@/components/analytics/pixels";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Pixels
        metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID ?? null}
        ga4Id={process.env.NEXT_PUBLIC_GA4_ID ?? null}
        tiktokPixelId={process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? null}
      />
      <Nav />
      <Suspense>
        <AffiliateTracker />
      </Suspense>
      <main className="pt-16">{children}</main>
      <footer className="border-t border-[#1e1e1e] mt-24 py-12 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <p className="font-display font-black text-lg tracking-tight">NINE2FIVE</p>
            <p className="text-sm text-[#737373] mt-1">Māori grip socks. Wear your identity.</p>
            <p className="text-xs text-[#525252] mt-2">Masterton, New Zealand</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-xs uppercase tracking-widest text-[#525252]">Shop</p>
              <a href="/shop" className="block text-[#737373] hover:text-white transition-colors">All Products</a>
              <a href="/shop?collection=kahotea" className="block text-[#737373] hover:text-white transition-colors">Kahotea</a>
              <a href="/shop?collection=limited" className="block text-[#737373] hover:text-white transition-colors">Limited</a>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-xs uppercase tracking-widest text-[#525252]">Info</p>
              <a href="/#vision" className="block text-[#737373] hover:text-white transition-colors">Our Vision</a>
              <a href="/shipping" className="block text-[#737373] hover:text-white transition-colors">Shipping</a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[#1a1a1a] flex items-center justify-between">
          <p className="text-xs text-[#525252]">© {new Date().getFullYear()} Nine2Five Limited. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com/nine2five.nz" target="_blank" rel="noopener" className="text-xs text-[#525252] hover:text-white transition-colors">Instagram</a>
            <a href="https://tiktok.com/@nine2five.nz" target="_blank" rel="noopener" className="text-xs text-[#525252] hover:text-white transition-colors">TikTok</a>
            <a href="https://www.facebook.com/profile.php?id=61563357785307" target="_blank" rel="noopener" className="text-xs text-[#525252] hover:text-white transition-colors">Facebook</a>
          </div>
        </div>
      </footer>
    </>
  );
}
