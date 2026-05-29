// Seed data matching what's on nine2five.nz
export const PRODUCTS = [
  {
    name: "Black Kahotea",
    slug: "black-kahotea",
    description: "The one that started it all. The Black Kahotea grips the turf, the gym floor, and the mat — so you can focus on your game, not your feet. Best-seller. Worn by players who don't slip under pressure. Tested grip pattern, compression support, and cushion comfort built for rugby, training, and everything in between.",
    price: 2500,
    compare_at_price: 3499,
    image_urls: [
      "/products/black-kahotea/1.avif",
      "/products/black-kahotea/2.avif",
      "/products/black-kahotea/3.avif",
      "/products/black-kahotea/4.avif",
    ],
  },
  {
    name: "Grey Kahotea",
    slug: "grey-kahotea",
    description: "The clean training sock. Grey Kahotea holds its grip rep after rep — whether you're in a box jump, a lunge, or a full training session. Same tested grip pattern as the Black Kahotea. Versatile colourway that goes with anything. Compression fit keeps your foot locked in so your technique stays sharp.",
    price: 2500,
    compare_at_price: 3499,
    image_urls: [
      "/products/grey-kahotea/1.avif",
      "/products/grey-kahotea/2.avif",
      "/products/grey-kahotea/3.avif",
    ],
  },
  {
    name: "White Kahotea",
    slug: "white-kahotea",
    description: "Built for pilates, barre, and gym — and clean enough to wear all day. The White Kahotea won't bunch, won't slip, and won't lose its shape after washing. The grip panel placement is exactly where your foot needs it in a lunge, a plank, or a downward dog. A fan favourite for a reason.",
    price: 2500,
    compare_at_price: 3499,
    image_urls: [
      "/products/white-kahotea/1.avif",
      "/products/white-kahotea/2.avif",
      "/products/white-kahotea/3.avif",
      "/products/white-kahotea/4.avif",
    ],
  },
  {
    name: "Pink Kahotea",
    slug: "pink-kahotea",
    description: "The gym sock people ask about. The Pink Kahotea turns heads and holds grip — whether you're mid-rep, mid-game, or mid-run. Designed for pilates, touch rugby, gym, and general training. Bold Kahotea Māori detailing because your socks should say something before you even move.",
    price: 2500,
    compare_at_price: 3499,
    image_urls: [
      "/products/pink-kahotea/1.avif",
      "/products/pink-kahotea/2.avif",
      "/products/pink-kahotea/3.avif",
      "/products/pink-kahotea/4.avif",
      "/products/pink-kahotea/5.avif",
    ],
  },
  {
    name: "Toa Whenua",
    slug: "toa-whenua",
    description: "Toa Whenua — Warrior of the Land. This design carries meaning before your first step. Cushion comfort for long sessions, compression support to reduce fatigue, and a tested grip pattern that holds whether you're on turf, court, or gym floor. Wear your whakapapa. Perform with purpose.",
    price: 2500,
    compare_at_price: 3499,
    image_urls: [
      "/products/toa-whenua/1.webp",
      "/products/toa-whenua/2.webp",
      "/products/toa-whenua/3.webp",
    ],
  },
  {
    name: "Pasifika",
    slug: "pasifika",
    description: "Limited edition. The Pasifika celebrates the unity of Polynesian culture and sport — and once this run sells out, it's gone. Same grip sole pattern, compression support, and cushion comfort as the full range. Wear it to the gym, the field, or the court. Rep your culture in every session.",
    price: 2500,
    compare_at_price: 3499,
    image_urls: [
      "/products/pasifika/1.avif",
      "/products/pasifika/2.avif",
      "/products/pasifika/3.avif",
    ],
  },
  {
    name: "Basic Black",
    slug: "basic-black",
    description: "No frills. Pure grip. The Basic Black is for athletes who want reliable traction without the design noise. Same tested grip pattern, compression fit, and cushion comfort — just in a clean all-black colourway. Goes with everything. Built to last.",
    price: 2000,
    compare_at_price: 2500,
    image_urls: [
      "/products/basic-black/2.webp",
      "/products/basic-black/3.webp",
      "/products/basic-black/1.webp",
      "/products/basic-black/4.webp",
    ],
  },
  {
    name: "Basic White",
    slug: "basic-white",
    description: "Clean, minimal, and built to grip. The Basic White is the everyday training sock — no distractions, just performance. Same grip sole as the full range. Crisp white colourway that pairs with any gym kit. If you want grip without the statement, this is it.",
    price: 2000,
    compare_at_price: 2500,
    image_urls: [
      "/products/basic-white/3.webp",
      "/products/basic-white/4.webp",
      "/products/basic-white/1.webp",
    ],
  },
  {
    name: "Tino Rangatiratanga",
    slug: "tino-rangatiratanga",
    description: "Sovereignty. Pride. Identity. The Tino Rangatiratanga sock is everyday casual wear that carries deep meaning. Not a grip sock — a statement sock. Wear your culture anywhere you go.",
    price: 1500,
    compare_at_price: null,
    image_urls: [
      "/products/tino-rangatiratanga/1.avif",
      "/products/tino-rangatiratanga/2.avif",
    ],
  },
];

export const SIZES = ["6-9", "10-13"] as const;
export type Size = typeof SIZES[number];

import type { Product } from "@/types/database";

export function getStaticProducts(): Product[] {
  return PRODUCTS.map((p, i) => ({
    id: p.slug,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    compare_at_price: p.compare_at_price,
    image_urls: p.image_urls,
    active: true,
    created_at: new Date(2025, 0, i + 1).toISOString(),
  }));
}
