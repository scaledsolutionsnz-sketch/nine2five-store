import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery — Nine2Five",
  description: "Māori grip socks in action. Rugby, gym, pilates, touch, and everyday movement.",
};

const GALLERY = [
  { src: "/gallery/1.png",  alt: "Nine2Five socks lifestyle", tag: "Lifestyle",   aspect: "aspect-[3/4]" },
  { src: "/gallery/2.png",  alt: "Nine2Five socks in action", tag: "Sport",       aspect: "aspect-[4/3]" },
  { src: "/gallery/3.png",  alt: "Nine2Five grip socks",      tag: "Training",    aspect: "aspect-[3/4]" },
  { src: "/gallery/4.png",  alt: "Nine2Five product shot",    tag: "Product",     aspect: "aspect-square" },
  { src: "/gallery/5.png",  alt: "Nine2Five socks worn",      tag: "Lifestyle",   aspect: "aspect-[4/3]" },
  { src: "/gallery/6.png",  alt: "Nine2Five on the field",    tag: "Sport",       aspect: "aspect-[3/4]" },
  { src: "/gallery/7.png",  alt: "Nine2Five team socks",      tag: "Team",        aspect: "aspect-[4/3]" },
  { src: "/gallery/8.png",  alt: "Nine2Five close up",        tag: "Product",     aspect: "aspect-[3/4]" },
  { src: "/gallery/9.png",  alt: "Nine2Five lifestyle shot",  tag: "Lifestyle",   aspect: "aspect-square" },
  { src: "/gallery/10.png", alt: "Nine2Five performance",     tag: "Performance", aspect: "aspect-[4/3]" },
  { src: "/gallery/11.png", alt: "Nine2Five gym training",    tag: "Training",    aspect: "aspect-[3/4]" },
  { src: "/gallery/12.png", alt: "Nine2Five movement",        tag: "Sport",       aspect: "aspect-[4/3]" },
  { src: "/gallery/13.png", alt: "Nine2Five culture",         tag: "Culture",     aspect: "aspect-[3/4]" },
  { src: "/gallery/14.png", alt: "Nine2Five field session",   tag: "Sport",       aspect: "aspect-square" },
  { src: "/gallery/15.png", alt: "Nine2Five gym socks",       tag: "Gym",         aspect: "aspect-[4/3]" },
  { src: "/gallery/16.png", alt: "Nine2Five product display", tag: "Product",     aspect: "aspect-[3/4]" },
  { src: "/gallery/17.png", alt: "Nine2Five outdoor action",  tag: "Lifestyle",   aspect: "aspect-[4/3]" },
  { src: "/gallery/18.png", alt: "Nine2Five Māori design",    tag: "Culture",     aspect: "aspect-[3/4]" },
  { src: "/gallery/19.png", alt: "Nine2Five athlete socks",   tag: "Performance", aspect: "aspect-square" },
  { src: "/gallery/20.png", alt: "Nine2Five on grass",        tag: "Sport",       aspect: "aspect-[4/3]" },
  { src: "/gallery/21.png", alt: "Nine2Five grip pattern",    tag: "Product",     aspect: "aspect-[3/4]" },
  { src: "/gallery/22.png", alt: "Nine2Five workout",         tag: "Training",    aspect: "aspect-[4/3]" },
  { src: "/gallery/23.png", alt: "Nine2Five lifestyle",       tag: "Lifestyle",   aspect: "aspect-[3/4]" },
  { src: "/gallery/24.png", alt: "Nine2Five team shot",       tag: "Team",        aspect: "aspect-square" },
  { src: "/gallery/25.png", alt: "Nine2Five active wear",     tag: "Performance", aspect: "aspect-[4/3]" },
  { src: "/gallery/26.png", alt: "Nine2Five street style",    tag: "Lifestyle",   aspect: "aspect-[3/4]" },
  { src: "/gallery/27.png", alt: "Nine2Five identity",        tag: "Culture",     aspect: "aspect-[4/3]" },
];

export default function GalleryPage() {
  return (
    <div className="bg-[#112016] min-h-screen">

      {/* Hero header */}
      <div className="relative overflow-hidden" style={{ height: "55vh", minHeight: "400px" }}>
        <Image
          src="/gallery/1.png"
          alt="Nine2Five athlete"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(58,119,34,0.10) 0%, transparent 60%)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-10 md:px-20 pb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#3a7722] mb-3">Nine2Five</p>
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
      <div className="px-6 md:px-16 py-16 max-w-screen-xl mx-auto">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {GALLERY.map((item, i) => (
            <div
              key={i}
              className="group relative break-inside-avoid mb-4 rounded-xl overflow-hidden bg-[#192d1e]"
            >
              <div className={`relative w-full ${item.aspect}`}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#112016]/50 backdrop-blur-sm border border-white/[0.15] text-white/80 text-[10px] font-black uppercase tracking-widest">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-white/[0.06] py-24 text-center px-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#3a7722] mb-5">
          Ready to Represent
        </p>
        <h2 className="font-display font-black text-white leading-none mb-8"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
          WEAR YOUR IDENTITY
        </h2>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-[#3a7722] text-white font-bold text-sm uppercase tracking-widest px-10 py-4 rounded-full hover:bg-[#4d9e2e] transition-all duration-300"
        >
          Shop Collection
        </Link>
      </div>
    </div>
  );
}
