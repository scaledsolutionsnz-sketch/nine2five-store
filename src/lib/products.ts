// Seed data matching what's on nine2five.nz
export const PRODUCTS = [
  {
    name: "Black Kahotea",
    slug: "black-kahotea",
    description: "Our best-selling Māori inspired grip sock. Bold black design with Kahotea pattern — built for rugby, training, and the turf.",
    price: 2000,
    compare_at_price: 2500,
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
    description: "Clean grey colourway with the iconic Kahotea Māori pattern. Versatile enough for the gym, the field, or the street.",
    price: 2000,
    compare_at_price: 2500,
    image_urls: [
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80",
    ],
  },
  {
    name: "White Kahotea",
    slug: "white-kahotea",
    description: "Crisp white with the Kahotea pattern. A fan favourite for Pilates, gym sessions, and light training.",
    price: 2000,
    compare_at_price: 2500,
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
    description: "Bold pink with Kahotea Māori detailing. Designed for performance, worn for style.",
    price: 2000,
    compare_at_price: 2500,
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
    description: "New design. Toa Whenua — Warrior of the Land. Premium grip sock honouring the connection to whenua through Māori design.",
    price: 2000,
    compare_at_price: 2500,
    image_urls: [
      "/products/toa-whenua/1.png",
      "/products/toa-whenua/2.png",
    ],
  },
  {
    name: "Pasifika",
    slug: "pasifika",
    description: "Limited edition. Pacific inspired design celebrating the unity of Polynesian culture and sport. Get them while they last.",
    price: 2000,
    compare_at_price: 2500,
    image_urls: [
      "/products/pasifika/1.avif",
      "/products/pasifika/2.avif",
      "/products/pasifika/3.avif",
    ],
  },
  {
    name: "Basic",
    slug: "basic",
    description: "No frills. Pure performance. The Basic grip sock — reliable traction, compression fit, and built to last.",
    price: 2000,
    compare_at_price: 2500,
    image_urls: [
      "https://images.unsplash.com/photo-1582897085656-c636d006a246?w=800&q=80",
    ],
  },
  {
    name: "Tino Rangatiratanga",
    slug: "tino-rangatiratanga",
    description: "Casual wear. Tino Rangatiratanga — sovereignty, pride, identity. Everyday socks that carry meaning.",
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
