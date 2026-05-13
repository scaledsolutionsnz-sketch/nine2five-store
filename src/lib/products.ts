// Seed data matching what's on nine2five.nz
export const PRODUCTS = [
  {
    name: "Black Kahotea",
    slug: "black-kahotea",
    description: "Our best-selling Māori inspired grip sock. Bold black design with Kahotea pattern — built for rugby, training, and the turf.",
    price: 2000,
    compare_at_price: 2500,
    image_urls: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
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
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
  },
  {
    name: "Pink Kahotea",
    slug: "pink-kahotea",
    description: "Bold pink with Kahotea Māori detailing. Designed for performance, worn for style.",
    price: 2000,
    compare_at_price: 2500,
    image_urls: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    ],
  },
  {
    name: "Toa Whenua",
    slug: "toa-whenua",
    description: "New design. Toa Whenua — Warrior of the Land. Premium grip sock honouring the connection to whenua through Māori design.",
    price: 2000,
    compare_at_price: 2500,
    image_urls: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    ],
  },
  {
    name: "Pasifika",
    slug: "pasifika",
    description: "Limited edition. Pacific inspired design celebrating the unity of Polynesian culture and sport. Get them while they last.",
    price: 2000,
    compare_at_price: 2500,
    image_urls: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800&q=80",
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
      "https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80",
    ],
  },
];

export const SIZES = ["6-9", "10-13"] as const;
export type Size = typeof SIZES[number];
