import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery — Nine2Five",
  description: "Māori grip socks in action. Rugby, gym, pilates, touch, and everyday movement.",
};

const GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1529518969858-8baa65152fc8?w=900&q=85",
    alt: "Rugby team running on field",
    tag: "Rugby",
    aspect: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=85",
    alt: "Athlete training in gym",
    tag: "Gym",
    aspect: "aspect-[4/3]",
  },
  {
    src: "https://images.unsplash.com/photo-1556906781-9a412961a28c?w=900&q=85",
    alt: "Grip sock close up",
    tag: "Product",
    aspect: "aspect-square",
  },
  {
    src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=85",
    alt: "Pilates movement",
    tag: "Pilates",
    aspect: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=900&q=85",
    alt: "Athlete portrait",
    tag: "Lifestyle",
    aspect: "aspect-[4/3]",
  },
  {
    src: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=900&q=85",
    alt: "Touch rugby players",
    tag: "Touch Rugby",
    aspect: "aspect-square",
  },
  {
    src: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&q=85",
    alt: "Gym training session",
    tag: "Training",
    aspect: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=900&q=85",
    alt: "Rugby player on grass field",
    tag: "Rugby",
    aspect: "aspect-[4/3]",
  },
  {
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=85",
    alt: "Fitness class movement",
    tag: "Gym",
    aspect: "aspect-square",
  },
  {
    src: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=900&q=85",
    alt: "Athlete in motion",
    tag: "Lifestyle",
    aspect: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=900&q=85",
    alt: "Gym environment",
    tag: "Training",
    aspect: "aspect-[4/3]",
  },
  {
    src: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=900&q=85",
    alt: "Sport lifestyle",
    tag: "Lifestyle",
    aspect: "aspect-square",
  },
];

export default function GalleryPage() {
  return (
    <div className="bg-black min-h-screen">

      {/* Header */}
      <div className="pt-32 pb-16 px-8 md:px-16 max-w-screen-xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#4ade80] mb-3">
          Nine2Five
        </p>
        <h1 className="font-display font-black text-5xl md:text-7xl text-white leading-none mb-6">
          THE GALLERY
        </h1>
        <p className="text-white/40 text-lg max-w-md leading-relaxed">
          Worn on fields, in gyms, on tracks. Built for movement. Made with pride.
        </p>
      </div>

      {/* Masonry Grid */}
      <div className="px-8 md:px-16 max-w-screen-xl mx-auto pb-32">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
          {GALLERY.map((item, i) => (
            <div
              key={i}
              className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-[#111]"
            >
              <div className={`relative w-full ${item.aspect}`}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
                {/* Tag */}
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/[0.12] text-white/70 text-[10px] font-bold uppercase tracking-widest">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-white/[0.06] py-24 text-center px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#4ade80] mb-4">
          Ready to Represent
        </p>
        <h2 className="font-display font-black text-4xl md:text-6xl text-white leading-none mb-6">
          WEAR YOUR IDENTITY
        </h2>
        <a
          href="/shop"
          className="inline-flex items-center gap-2 bg-[#4ade80] text-black font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#86efac] transition-all duration-300"
        >
          Shop Collection
        </a>
      </div>
    </div>
  );
}
