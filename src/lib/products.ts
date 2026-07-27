// Seed data matching what's on nine2five.nz
export const PRODUCTS = [
  {
    name: "Black Kahotea",
    slug: "black-kahotea",
    description: "The design that started it all. Kahotea draws from traditional Māori koru patterns — representing growth, strength, and continuous movement. Every loop in the design carries intention. On the field, the Black Kahotea grips the turf, the gym floor, and the mat so you can focus on your game, not your feet. Tested grip sole, compression support, cushion comfort. Worn by Lincoln University Rugby and athletes who carry their identity into every space they enter.",
    price: 2500,
    compare_at_price: null,
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
    description: "The same Kahotea pattern — koru-rooted, Māori-made — in a clean grey training colourway. Grey Kahotea holds its grip rep after rep whether you're in a box jump, a lunge, or a full session. Versatile enough to go with anything. The pattern carries the same intention as the Black: strength in movement, presence in every step. Compression fit. Tested grip sole.",
    price: 2500,
    compare_at_price: null,
    image_urls: [
      "/products/grey-kahotea/1.avif",
      "/products/grey-kahotea/2.avif",
      "/products/grey-kahotea/3.avif",
    ],
  },
  {
    name: "White Kahotea",
    slug: "white-kahotea",
    description: "The Kahotea pattern in white — clean enough for pilates, meaningful enough to wear with pride. Koru-based Māori design language representing new beginnings and personal growth. Won't bunch, won't slip, won't lose its shape after washing. Grip panel placement is exactly where your foot needs it in a lunge, a plank, or a downward dog. A fan favourite for a reason.",
    price: 2500,
    compare_at_price: null,
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
    description: "The Kahotea koru pattern in bold pink — because your socks should say something before you even move. Koru represents growth, vitality, and the unfolding of new life. Turns heads and holds grip through pilates, touch rugby, gym, and everything in between. Your identity isn't something you put away when you train. Tested grip sole. Compression fit.",
    price: 2500,
    compare_at_price: null,
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
    description: "Toa Whenua — Warrior of the Land. A design rooted in the Māori understanding that true strength comes from your connection to the land beneath your feet. Toa: the warrior spirit. Whenua: the earth, the land, the placenta — the place you come from. This is not decoration. It is whakapapa made wearable. Tested grip sole, compression support, cushion comfort for long sessions on turf, court, or gym floor.",
    price: 2500,
    compare_at_price: null,
    image_urls: [
      "/products/toa-whenua/1.webp",
      "/products/toa-whenua/2.webp",
      "/products/toa-whenua/3.webp",
    ],
  },
  {
    name: "Pasifika",
    slug: "pasifika",
    description: "Limited edition. The Pasifika design honours the unity of Polynesian people — the connection between Pacific Island cultures, the ocean that binds them, and the athletes who carry that identity into sport every single day. Once this run is gone, it's gone. No reprints. The design was made with respect for the communities it represents. Same tested grip sole, compression support, and cushion comfort as the full range. Rep your culture in every session.",
    price: 2500,
    compare_at_price: null,
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
    price: 2500,
    compare_at_price: null,
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
    price: 2500,
    compare_at_price: null,
    image_urls: [
      "/products/basic-white/3.webp",
      "/products/basic-white/4.webp",
      "/products/basic-white/1.webp",
    ],
  },
  {
    name: "Tino Rangatiratanga",
    slug: "tino-rangatiratanga",
    description: "Tino Rangatiratanga — self-determination, sovereignty, the right to be who you are without apology. The flag that flies at every tangi, every protest, every celebration. This sock is not a grip sock. It is a statement you wear every day — to training, to work, to the supermarket. Made for Māori and everyone who believes culture should never have to stay at the door.",
    price: 1500,
    compare_at_price: null,
    image_urls: [
      "/products/tino-rangatiratanga/1.avif",
      "/products/tino-rangatiratanga/2.avif",
    ],
  },
];

export const SIZES = ["6-9", "10-13"] as const;

export type ProductExtras = {
  badges: string[];
  specs: { label: string; value: string }[];
  care: string[];
  soldCount?: string;
  limitedStock?: boolean;
};

const PREMIUM_SPECS: ProductExtras["specs"] = [
  { label: "Material", value: "80% Cotton · 15% Nylon · 5% Elastane" },
  { label: "Grip", value: "Silicone grip sole" },
  { label: "Support", value: "Arch compression + cushion comfort" },
  { label: "Sizes", value: "6–9 and 10–13" },
];
const BASIC_SPECS: ProductExtras["specs"] = [
  { label: "Material", value: "75% Cotton · 20% Nylon · 5% Elastane" },
  { label: "Grip", value: "Silicone grip sole" },
  { label: "Support", value: "Light compression fit" },
  { label: "Sizes", value: "6–9 and 10–13" },
];
const PREMIUM_CARE = [
  "Machine wash cold",
  "Tumble dry low",
  "Do not iron grip sole",
  "Do not bleach",
];
const BASIC_CARE = ["Machine wash cold", "Tumble dry low", "Do not bleach"];

const PRODUCT_EXTRAS: Record<string, ProductExtras> = {
  "black-kahotea":        { badges: ["Best Seller", "Lincoln Rugby"],    specs: PREMIUM_SPECS, care: PREMIUM_CARE, soldCount: "28+" },
  "grey-kahotea":         { badges: [],                                  specs: PREMIUM_SPECS, care: PREMIUM_CARE, soldCount: "6+" },
  "white-kahotea":        { badges: ["Fan Favourite"],                   specs: PREMIUM_SPECS, care: PREMIUM_CARE, soldCount: "9+" },
  "pink-kahotea":         { badges: [],                                  specs: PREMIUM_SPECS, care: PREMIUM_CARE, soldCount: "4+" },
  "toa-whenua":           { badges: ["Māori Design"],                    specs: PREMIUM_SPECS, care: PREMIUM_CARE, soldCount: "3+" },
  "pasifika":             { badges: ["Limited Edition"],                 specs: PREMIUM_SPECS, care: PREMIUM_CARE, limitedStock: true, soldCount: "2+" },
  "basic-black":          { badges: [],                                  specs: BASIC_SPECS,   care: BASIC_CARE },
  "basic-white":          { badges: [],                                  specs: BASIC_SPECS,   care: BASIC_CARE },
  "tino-rangatiratanga":  { badges: ["Statement Sock"],            specs: [
    { label: "Material", value: "80% Cotton · 15% Nylon · 5% Elastane" },
    { label: "Style",    value: "Casual wear — no grip sole" },
    { label: "Sizes",    value: "6–9 and 10–13" },
  ], care: BASIC_CARE },
};

export function getProductExtras(slug: string): ProductExtras {
  return PRODUCT_EXTRAS[slug] ?? { badges: [], specs: PREMIUM_SPECS, care: PREMIUM_CARE };
}
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
