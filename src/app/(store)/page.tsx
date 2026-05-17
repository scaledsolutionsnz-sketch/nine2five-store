import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Heart, ArrowUpRight } from "lucide-react";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

const FALLBACK_PRODUCTS = [
  { name: "Grey Kahotea",  price: 2000, badge: null },
  { name: "Toa Whenua",    price: 2000, badge: "New" },
  { name: "Pasifika",      price: 2000, badge: "Limited" },
  { name: "Black Kahotea", price: 2000, badge: null },
  { name: "White Kahotea", price: 2000, badge: null },
];

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("*").eq("active", true).limit(5);
    return (data ?? []) as Product[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const hasProducts = featured.length > 0;

  return (
    <div className="bg-[#112016] min-h-screen">

      {/* ══════════════════════════════════════════════════════
          HERO — full-bleed forest green with athlete image
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ height: "92vh", minHeight: "560px" }}>
        {/* Athlete image */}
        <Image
          src="https://static.wixstatic.com/media/0d9f9d_8ccff4ed0c7140d9855c18abbd3f7553~mv2.jpeg/v1/fill/w_1400,h_1800,al_c,q_85/0d9f9d_8ccff4ed0c7140d9855c18abbd3f7553~mv2.jpeg"
          alt="Nine2Five athlete wearing Māori grip socks"
          fill
          className="object-cover object-top"
          priority
        />
        {/* Forest green gradient — heavy at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1810] via-[#0c1810]/60 to-[#112016]/20" />

        {/* Hero content — absolutely pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 sm:px-10 md:px-16 lg:px-20 pb-14 md:pb-20">
          <div className="max-w-5xl">

            {/* Location dot + label */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] inline-block" />
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#4ade80]">
                Masterton, New Zealand
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-black text-white leading-[0.85] mb-8
              text-[3.8rem] sm:text-[5rem] md:text-[6.5rem] lg:text-[8rem]">
              MĀORI<br />GRIP<br />SOCKS
            </h1>

            {/* Tagline + CTA */}
            <div className="flex flex-wrap items-center gap-5 mb-10">
              <p className="text-white/50 text-[14px] leading-relaxed max-w-[220px]">
                Built for movement. Worn with pride. From the rugby field to the gym.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold bg-[#4ade80] text-[#0a1a0e] hover:bg-[#86efac] transition-colors duration-200 shadow-lg shadow-[#4ade80]/20"
              >
                Shop Now <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Stats — frosted glass pill */}
            <div
              className="inline-flex items-center rounded-2xl overflow-hidden border"
              style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)", borderColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="px-5 py-3.5">
                <p className="font-display font-black text-[1.2rem] text-white leading-none">100k+</p>
                <p className="text-[10px] text-white/40 font-semibold mt-1 tracking-widest uppercase">Sales</p>
              </div>
              <div className="w-px h-10" style={{ background: "rgba(255,255,255,0.15)" }} />
              <div className="px-5 py-3.5">
                <p className="font-display font-black text-[1.2rem] text-white leading-none">Athletes</p>
                <p className="text-[10px] text-white/40 font-semibold mt-1 tracking-widest uppercase">Trusted By</p>
              </div>
              <div className="w-px h-10" style={{ background: "rgba(255,255,255,0.15)" }} />
              <div className="px-5 py-3.5">
                <p className="font-display font-black text-[1.2rem] text-[#4ade80] leading-none">NZ Made</p>
                <p className="text-[10px] text-white/40 font-semibold mt-1 tracking-widest uppercase">Identity</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURED COLLECTION — glass cards on forest green
      ══════════════════════════════════════════════════════ */}
      <section className="bg-[#112016] py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20">

          {/* Header row */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#4ade80] mb-2">
                Featured Collection
              </p>
              <h2 className="font-display font-bold text-2xl text-white">
                The pieces everyone&apos;s talking about.
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold text-white/35 hover:text-[#4ade80] transition-colors flex items-center gap-1 shrink-0 ml-4"
            >
              View All Socks <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {hasProducts
              ? featured.map((p) => <LiveCard key={p.id} product={p} />)
              : FALLBACK_PRODUCTS.map((p) => <FallbackCard key={p.name} {...p} />)
            }
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BRAND PILLARS — darker green panel
      ══════════════════════════════════════════════════════ */}
      <section className="bg-[#0c1810] py-24 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20">
          <div className="grid md:grid-cols-2 gap-16 items-start">

            {/* Left — text */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#4ade80] mb-4">
                Our Vision
              </p>
              <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight text-white mb-6">
                Unapologetically<br />Māori
              </h2>
              <p className="text-white/45 text-[15px] leading-relaxed mb-4">
                We help people wear their identity with confidence — to stand proud and unapologetically Māori in every space, without needing to change or soften yourself.
              </p>
              <p className="text-white/45 text-[15px] leading-relaxed mb-10">
                Every design is shaped by tikanga, whakapapa, and mana. We bring Māori identity into sport, work, and daily life.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold bg-[#4ade80] text-[#0a1a0e] hover:bg-[#86efac] transition-colors duration-200 shadow-lg shadow-[#4ade80]/15"
              >
                Shop the Collection <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right — glass feature tiles */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Cultural Integration",     desc: "Māori culture in everyday life" },
                { label: "Whakapapa Connection",     desc: "Ancestral ties by design" },
                { label: "Identity & Confidence",    desc: "Express yourself without compromise" },
                { label: "Authentic Representation", desc: "Tikanga-shaped, mana-led" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="p-5 rounded-2xl bg-white/[0.05] backdrop-blur-sm border border-white/[0.09] hover:bg-white/[0.09] transition-colors duration-300"
                >
                  <p className="font-display font-semibold text-sm text-white leading-snug mb-1.5">{f.label}</p>
                  <p className="text-[12px] text-white/35 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SPORT TAGS
      ══════════════════════════════════════════════════════ */}
      <section className="bg-[#112016] py-10 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20">
          <div className="flex flex-wrap gap-2 justify-center">
            {["Rugby", "Touch Rugby", "Gym", "Pilates", "Training", "Schools", "Clubs", "Māori Sport", "Pasifika"].map((tag) => (
              <span
                key={tag}
                className="px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.09] text-xs text-white/40 font-medium hover:border-[#4ade80]/50 hover:text-[#4ade80] hover:bg-[#4ade80]/[0.06] transition-all duration-200 cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA — centred
      ══════════════════════════════════════════════════════ */}
      <section className="bg-[#0c1810] py-28 px-6 sm:px-10 border-t border-white/[0.05]">
        <div className="max-w-md mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#4ade80] mb-5">
            Nine2Five Limited
          </p>
          <h2 className="font-display font-black text-5xl md:text-6xl text-white leading-none mb-5">
            Grip Up.<br />Stand Proud.
          </h2>
          <p className="text-white/40 text-[15px] mb-10 leading-relaxed">
            Māori grip socks. Masterton, New Zealand.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-bold bg-[#4ade80] text-[#0a1a0e] hover:bg-[#86efac] transition-colors duration-200 shadow-xl shadow-[#4ade80]/20 mb-12"
          >
            Shop Now <ArrowUpRight className="h-5 w-5" />
          </Link>
          <div className="flex items-center justify-center gap-8">
            <a href="https://instagram.com/nine2five.nz" target="_blank" rel="noopener" className="text-xs text-white/25 hover:text-white transition-colors">Instagram</a>
            <a href="https://tiktok.com/@nine2five.nz" target="_blank" rel="noopener" className="text-xs text-white/25 hover:text-white transition-colors">TikTok</a>
            <a href="https://www.facebook.com/profile.php?id=61563357785307" target="_blank" rel="noopener" className="text-xs text-white/25 hover:text-white transition-colors">Facebook</a>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ─── Live product card — glass morphism on forest green ─────── */
function LiveCard({ product }: { product: Product }) {
  const img = product.image_urls?.[0];
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group rounded-[18px] overflow-hidden bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.10] hover:border-white/[0.18] hover:shadow-lg hover:shadow-[#4ade80]/[0.06] transition-all duration-300"
    >
      {/* Image area with green glow pedestal */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 95%, rgba(74,222,128,0.18) 0%, rgba(12,24,16,0.9) 65%)' }}
      >
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-5">
            <div className="w-14 h-2 rounded-full bg-[#4ade80]/25 blur-sm mb-2" />
            <span className="text-white/25 text-[11px] font-display font-bold text-center px-3 leading-snug">{product.name}</span>
          </div>
        )}
        {isOnSale && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#4ade80] text-[#0a1a0e] text-[10px] font-bold uppercase tracking-wider">
            Sale
          </span>
        )}
        <button
          className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-white/[0.1] backdrop-blur-sm border border-white/[0.12] flex items-center justify-center hover:bg-white/[0.2] transition-colors"
          aria-label="Favourite"
        >
          <Heart className="h-3.5 w-3.5 text-white/50" />
        </button>
      </div>
      <div className="px-3.5 py-3">
        <p className="text-[13px] font-semibold text-white/85 truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[13px] font-bold text-[#4ade80]">${(product.price / 100).toFixed(2)}</p>
          {isOnSale && (
            <p className="text-[11px] text-white/25 line-through">${(product.compare_at_price! / 100).toFixed(2)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Fallback card ──────────────────────────────────────────── */
function FallbackCard({ name, price, badge }: { name: string; price: number; badge: string | null }) {
  return (
    <Link
      href="/shop"
      className="group rounded-[18px] overflow-hidden bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.10] hover:border-white/[0.18] hover:shadow-lg hover:shadow-[#4ade80]/[0.06] transition-all duration-300"
    >
      <div
        className="relative aspect-square flex flex-col items-center justify-end pb-5"
        style={{ background: 'radial-gradient(ellipse at 50% 95%, rgba(74,222,128,0.18) 0%, rgba(12,24,16,0.9) 65%)' }}
      >
        {badge && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/[0.12] border border-white/[0.15] text-white text-[10px] font-bold uppercase tracking-wider">
            {badge}
          </span>
        )}
        <div className="w-14 h-2 rounded-full bg-[#4ade80]/25 blur-sm mb-2" />
        <span className="text-white/25 text-[11px] font-display font-bold text-center px-3 leading-snug">{name}</span>
        <button
          className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-white/[0.1] border border-white/[0.12] flex items-center justify-center"
          aria-label="Favourite"
        >
          <Heart className="h-3.5 w-3.5 text-white/50" />
        </button>
      </div>
      <div className="px-3.5 py-3">
        <p className="text-[13px] font-semibold text-white/85 truncate">{name}</p>
        <p className="text-[13px] font-bold text-[#4ade80] mt-0.5">${(price / 100).toFixed(2)}</p>
      </div>
    </Link>
  );
}
