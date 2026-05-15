import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

const COMING_SOON_PRODUCTS = [
  { name: "Grey Kahotea",        price: "$20.00", badge: null },
  { name: "Toa Whenua",          price: "$20.00", badge: "New" },
  { name: "Pasifika",            price: "$20.00", badge: "Limited" },
  { name: "Black Kahotea",       price: "$20.00", badge: null },
];

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("*").eq("active", true).limit(4);
    return (data ?? []) as Product[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const hasProducts = featured.length > 0;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="-mt-16 relative h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://static.wixstatic.com/media/0d9f9d_8ccff4ed0c7140d9855c18abbd3f7553~mv2.jpeg/v1/fill/w_1400,h_1800,al_c,q_85/0d9f9d_8ccff4ed0c7140d9855c18abbd3f7553~mv2.jpeg"
            alt="Nine2Five — Māori grip socks"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-10 pb-16 max-w-6xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#16a34a] mb-3">
            Masterton, New Zealand
          </p>
          <h1 className="font-display font-black text-6xl md:text-8xl leading-none tracking-tight text-white mb-5">
            WEAR YOUR<br />IDENTITY
          </h1>
          <p className="text-[#a3a3a3] text-lg mb-8 max-w-md leading-relaxed">
            Stand proud and unapologetically Māori in every space. Grip socks designed for sport, culture, and everyday life.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/shop" className="btn-primary text-base px-8 py-4">Shop Now</Link>
            <Link href="#vision" className="btn-outline text-base px-8 py-4">Our Vision</Link>
          </div>
        </div>
      </section>

      {/* ── Sport tags ── */}
      <section className="py-8 px-6 border-b border-[#1e1e1e]">
        <div className="flex flex-wrap gap-2 justify-center">
          {["Rugby", "Touch Rugby", "Gym", "Pilates", "Training", "Schools", "Clubs", "Māori Sport", "Pasifika"].map((tag) => (
            <span key={tag} className="px-4 py-1.5 rounded-full border border-[#262626] text-xs text-[#737373] font-medium">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── Products ── */}
      <section className="py-24 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#16a34a] mb-2">Collection</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl">
              {hasProducts ? "Shop the Range" : "Designs"}
            </h2>
          </div>
          {hasProducts && (
            <Link href="/shop" className="hidden md:inline-flex text-sm text-[#737373] hover:text-white transition-colors underline underline-offset-4">
              View all →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {hasProducts
            ? featured.map((p) => <LiveCard key={p.id} product={p} />)
            : COMING_SOON_PRODUCTS.map((p) => (
                <div key={p.name} className="group">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-[#141414] border border-[#1e1e1e] mb-3 flex items-center justify-center">
                    {p.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#16a34a] text-white text-[10px] font-bold uppercase tracking-wider">
                        {p.badge}
                      </span>
                    )}
                    <p className="font-display font-bold text-[#333] text-sm text-center px-4">{p.name}</p>
                  </div>
                  <p className="font-display font-semibold text-sm text-white">{p.name}</p>
                  <p className="text-sm text-[#525252] mt-0.5">{p.price} NZD</p>
                </div>
              ))}
        </div>

        {!hasProducts && (
          <div className="mt-10 text-center">
            <p className="text-sm text-[#525252] mb-4">Products launching soon — follow us to be first.</p>
            <div className="flex items-center justify-center gap-4">
              <a href="https://instagram.com/nine2five.nz" target="_blank" rel="noopener" className="text-sm text-[#737373] hover:text-white transition-colors">
                Instagram →
              </a>
              <a href="https://tiktok.com/@nine2five.nz" target="_blank" rel="noopener" className="text-sm text-[#737373] hover:text-white transition-colors">
                TikTok →
              </a>
            </div>
          </div>
        )}
      </section>

      {/* ── Vision ── */}
      <section id="vision" className="py-24 bg-[#141414] border-t border-b border-[#1e1e1e]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#16a34a] mb-4">Our Vision</p>
            <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight mb-6">
              Unapologetically<br />Māori
            </h2>
            <p className="text-[#737373] leading-relaxed mb-5">
              We help people wear their identity with confidence — to stand proud and unapologetically Māori in every space, without needing to change or soften yourself.
            </p>
            <p className="text-[#737373] leading-relaxed mb-8">
              Every design is shaped by tikanga, whakapapa, and mana. We bring Māori identity into sport, work, and daily life — grounded in who you are.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Cultural Integration",    desc: "Māori culture in everyday life" },
                { label: "Whakapapa Connection",    desc: "Ancestral ties by design" },
                { label: "Identity & Confidence",   desc: "Express yourself without compromise" },
                { label: "Authentic Representation", desc: "Tikanga-shaped, mana-led" },
              ].map((f) => (
                <div key={f.label} className="p-4 rounded-xl bg-[#1c1c1c] border border-[#262626]">
                  <p className="font-display font-semibold text-sm text-white">{f.label}</p>
                  <p className="text-xs text-[#737373] mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <Image
              src="https://static.wixstatic.com/media/0d9f9d_646570a92e35454090de50be3c837289~mv2.png/v1/crop/x_0,y_23,w_1587,h_802/fill/w_1587,h_802,al_c,q_85/0d9f9d_646570a92e35454090de50be3c837289~mv2.png"
              alt="Nine2Five — Māori grip socks"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Products lineup ── */}
      <section className="py-24 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#16a34a] mb-2">Full Range</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl">Every Design</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Basic",               price: "$20.00", desc: "Clean and classic. The everyday sock." },
            { name: "Grey Kahotea",        price: "$20.00", desc: "Subtle tone, strong identity." },
            { name: "Black Kahotea",       price: "$20.00", desc: "Bold in black. Always." },
            { name: "White Kahotea",       price: "$20.00", desc: "Crisp and clean." },
            { name: "Pink Kahotea",        price: "$20.00", desc: "Colour with purpose." },
            { name: "Toa Whenua",          price: "$20.00", desc: "New design. Warrior of the land." },
            { name: "Pasifika",            price: "$20.00", desc: "Limited edition. Pacific identity." },
            { name: "Tino Rangatiratanga", price: "$15.00", desc: "The flag. The mana." },
          ].map((item) => (
            <Link key={item.name} href="/shop" className="flex items-center justify-between p-5 rounded-xl bg-[#141414] border border-[#1e1e1e] hover:border-[#16a34a]/40 hover:bg-[#16a34a]/5 transition-all group">
              <div>
                <p className="font-display font-semibold text-white group-hover:text-[#16a34a] transition-colors">{item.name}</p>
                <p className="text-sm text-[#525252] mt-0.5">{item.desc}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="font-display font-bold text-white">{item.price}</p>
                <p className="text-xs text-[#525252]">NZD</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 border-t border-[#1e1e1e]">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#16a34a] mb-4">Nine2Five Limited</p>
          <h2 className="font-display font-black text-4xl md:text-5xl mb-4">
            Grip Up.<br />Stand Proud.
          </h2>
          <p className="text-[#737373] mb-8 text-base">Māori grip socks. Masterton, New Zealand.</p>
          <Link href="/shop" className="btn-primary text-base px-10 py-4">Shop the Collection</Link>
          <div className="flex items-center justify-center gap-6 mt-8">
            <a href="https://instagram.com/nine2five.nz" target="_blank" rel="noopener" className="text-xs text-[#525252] hover:text-white transition-colors">Instagram</a>
            <a href="https://tiktok.com/@nine2five.nz" target="_blank" rel="noopener" className="text-xs text-[#525252] hover:text-white transition-colors">TikTok</a>
            <a href="https://www.facebook.com/profile.php?id=61563357785307" target="_blank" rel="noopener" className="text-xs text-[#525252] hover:text-white transition-colors">Facebook</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function LiveCard({ product }: { product: Product }) {
  const img = product.image_urls?.[0];
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
  return (
    <Link href={`/shop/${product.slug}`} className="group">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#141414] mb-3">
        {img ? (
          <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 bg-[#1c1c1c] flex items-center justify-center">
            <span className="text-[#333] text-xs font-display font-bold">{product.name}</span>
          </div>
        )}
        {isOnSale && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#16a34a] text-white text-[10px] font-bold uppercase tracking-wider">Sale</span>
        )}
      </div>
      <p className="font-display font-semibold text-sm text-white group-hover:text-[#16a34a] transition-colors">{product.name}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <p className="text-sm text-[#fafafa]">${(product.price / 100).toFixed(2)}</p>
        {isOnSale && <p className="text-xs text-[#525252] line-through">${(product.compare_at_price! / 100).toFixed(2)}</p>}
        <span className="text-xs text-[#525252]">NZD</span>
      </div>
    </Link>
  );
}
