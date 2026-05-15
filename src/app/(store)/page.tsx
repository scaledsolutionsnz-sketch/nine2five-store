import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

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

  return (
    <div>
      {/* Hero — pulls up by nav height so it's true full-screen */}
      <section className="-mt-16 relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1600&q=80"
            alt="Rugby training"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a]" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#16a34a] mb-5">
            Christchurch, New Zealand
          </p>
          <h1 className="font-display font-black text-6xl md:text-8xl leading-none tracking-tight text-white mb-6">
            BUILT FOR<br />THE TURF
          </h1>
          <p className="text-[#a3a3a3] text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Māori inspired grip socks. Designed for rugby, sport, and training.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/shop" className="btn-primary text-base px-8 py-4">
              Shop Now
            </Link>
            <Link href="#about" className="btn-outline text-base px-8 py-4">
              Our Story
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#525252]">
          <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#525252] to-transparent" />
        </div>
      </section>

      {/* Sport tags */}
      <section className="py-10 px-6 border-b border-[#1e1e1e]">
        <div className="flex flex-wrap gap-2 justify-center">
          {["Rugby", "Touch Rugby", "Gym", "Pilates", "Training", "Schools", "Clubs", "Māori Sport"].map((tag) => (
            <span key={tag} className="px-4 py-1.5 rounded-full border border-[#262626] text-xs text-[#737373] font-medium">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#16a34a] mb-2">Collection</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl">
              {featured.length > 0 ? "Featured Designs" : "Coming Soon"}
            </h2>
          </div>
          {featured.length > 0 && (
            <Link href="/shop" className="hidden md:inline-flex text-sm text-[#737373] hover:text-white transition-colors underline underline-offset-4">
              View all →
            </Link>
          )}
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {["Kahotea I", "Kahotea II", "Limited Drop", "Classic Black"].map((name) => (
              <div key={name} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#141414] border border-[#1e1e1e] mb-3 flex items-center justify-center">
                  <div className="text-center px-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#16a34a] mb-1">Coming Soon</p>
                    <p className="font-display font-bold text-sm text-[#404040]">{name}</p>
                  </div>
                </div>
                <p className="font-display font-semibold text-sm text-[#525252]">{name}</p>
                <p className="text-xs text-[#404040] mt-0.5">— NZD</p>
              </div>
            ))}
          </div>
        )}

        {featured.length > 0 && (
          <Link href="/shop" className="md:hidden mt-6 block text-center text-sm text-[#737373] hover:text-white transition-colors underline underline-offset-4">
            View all products →
          </Link>
        )}
      </section>

      {/* Performance section */}
      <section className="py-24 bg-[#141414] border-t border-b border-[#1e1e1e]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#16a34a] mb-4">Performance</p>
            <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight mb-6">
              Grip That<br />Doesn&apos;t Quit
            </h2>
            <p className="text-[#737373] leading-relaxed mb-8">
              Nine2Five grip socks are built for athletes who demand more from their gear. Non-slip grip soles, compression fit, and performance materials that hold up from the first whistle to the final play.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Non-slip grip", desc: "Turf-tested traction" },
                { label: "Compression fit", desc: "Locked in support" },
                { label: "Performance material", desc: "Built to last" },
                { label: "Māori design", desc: "Identity + culture" },
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
              src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80"
              alt="Athlete training"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80"
              alt="Nine2Five story"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#16a34a] mb-4">Our Story</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-6 leading-tight">
              Culture Meets<br />Performance
            </h2>
            <p className="text-[#737373] leading-relaxed mb-4">
              Nine2Five started in Christchurch with one goal — create grip socks that carry Māori identity into sport. We believe your gear should reflect who you are.
            </p>
            <p className="text-[#737373] leading-relaxed mb-8">
              Every design is inspired by Māori patterns, whakapapa, and the culture that drives our community. Worn by rugby players, gym athletes, and rangatahi who carry their identity with them everywhere.
            </p>
            <p className="font-display font-semibold text-sm text-[#737373]">
              Christchurch, New Zealand
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-[#1e1e1e]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-display font-black text-4xl md:text-5xl mb-4">
            Ready to Grip Up?
          </h2>
          <p className="text-[#737373] mb-8 text-lg">New drops incoming. Be first to know.</p>
          <Link href="/shop" className="btn-primary text-base px-10 py-4">
            Shop the Collection
          </Link>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const img = product.image_urls?.[0];
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
  return (
    <Link href={`/shop/${product.slug}`} className="group">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#141414] mb-3">
        {img ? (
          <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 bg-[#1c1c1c] flex items-center justify-center">
            <span className="text-[#333] text-xs">No image</span>
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
