import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery — Nine2Five",
  description: "Māori grip socks in action. Rugby, gym, pilates, touch, and everyday movement.",
};

const GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=900&q=85",
    alt: "Runner on track in athletic gear",
    tag: "Training",
    aspect: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=85",
    alt: "Gym training session",
    tag: "Gym",
    aspect: "aspect-[4/3]",
  },
  {
    src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=85",
    alt: "Athlete lifting weights",
    tag: "Performance",
    aspect: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=85",
    alt: "Pilates class in studio",
    tag: "Pilates",
    aspect: "aspect-[4/3]",
  },
  {
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=85",
    alt: "Functional fitness training",
    tag: "Gym",
    aspect: "aspect-square",
  },
  {
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=85",
    alt: "Fitness class movement",
    tag: "Lifestyle",
    aspect: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=900&q=85",
    alt: "Athlete sprinting on track",
    tag: "Athletics",
    aspect: "aspect-[4/3]",
  },
  {
    src: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=900&q=85",
    alt: "Sport performance close up",
    tag: "Performance",
    aspect: "aspect-square",
  },
  {
    src: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&q=85",
    alt: "Gym workout session",
    tag: "Training",
    aspect: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=900&q=85",
    alt: "Modern gym environment",
    tag: "Gym",
    aspect: "aspect-[4/3]",
  },
  {
    src: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=900&q=85",
    alt: "Athlete on grass field",
    tag: "Sport",
    aspect: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=900&q=85",
    alt: "Athlete in motion outdoors",
    tag: "Lifestyle",
    aspect: "aspect-square",
  },
];

export default function GalleryPage() {
  return (
    <div className="bg-black min-h-screen">

      {/* Hero header with athlete background */}
      <div className="relative overflow-hidden" style={{ height: "50vh", minHeight: "380px" }}>
        <Image
          src="https://static.wixstatic.com/media/0d9f9d_8ccff4ed0c7140d9855c18abbd3f7553~mv2.jpeg/v1/fill/w_1400,h_1800,al_c,q_85/0d9f9d_8ccff4ed0c7140d9855c18abbd3f7553~mv2.jpeg"
          alt="Nine2Five athlete"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(74,222,128,0.12) 0%, transparent 60%)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-10 md:px-20 pb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#4ade80] mb-3">Nine2Five</p>
          <h1 className="font-display font-black text-white leading-none"
            style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
            THE GALLERY
          </h1>
          <p className="text-white/40 text-base mt-3 max-w-sm">
            Worn on fields, in gyms, on tracks. Built for movement. Made with pride.
          </p>
        </div>
      </div>

      {/* Masonry grid */}
      <div className="px-10 md:px-20 py-16 max-w-screen-xl mx-auto">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
          {GALLERY.map((item, i) => (
            <div
              key={i}
              className="group relative break-inside-avoid mb-5 rounded-2xl overflow-hidden bg-[#111]"
            >
              <div className={`relative w-full ${item.aspect}`}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/[0.15] text-white/80 text-[10px] font-black uppercase tracking-widest">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-white/[0.06] py-28 text-center px-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#4ade80] mb-5">
          Ready to Represent
        </p>
        <h2 className="font-display font-black text-white leading-none mb-8"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
          WEAR YOUR IDENTITY
        </h2>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-[#4ade80] text-black font-bold text-sm uppercase tracking-widest px-10 py-4 rounded-full hover:bg-[#86efac] transition-all duration-300"
        >
          Shop Collection
        </Link>
      </div>
    </div>
  );
}
