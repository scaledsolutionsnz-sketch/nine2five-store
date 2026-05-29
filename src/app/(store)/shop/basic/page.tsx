import { createClient } from "@/lib/supabase/server";
import { BasicProductClient } from "./basic-client";
import { getStaticProducts, SIZES } from "@/lib/products";
import type { Product, ProductVariant } from "@/types/database";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Basic Grip Sock",
  description: "No frills. Pure performance. The Basic grip sock — available in Black and White. Reliable traction, compression fit, built to last.",
};

async function getBasicProducts() {
  try {
    const supabase = await createClient();
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .in("slug", ["basic-black", "basic-white"])
      .eq("active", true);

    if (products && products.length >= 2) {
      const variantMap: Record<string, ProductVariant[]> = {};
      for (const p of products) {
        const { data: v } = await supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", p.id);
        variantMap[p.slug] = (v ?? []) as ProductVariant[];
      }
      const black = products.find((p) => p.slug === "basic-black")!;
      const white = products.find((p) => p.slug === "basic-white")!;
      return {
        black: { product: black as Product, variants: variantMap["basic-black"] ?? [] },
        white: { product: white as Product, variants: variantMap["basic-white"] ?? [] },
      };
    }
  } catch { /* fall through to static */ }

  const staticProducts = getStaticProducts();
  const black = staticProducts.find((p) => p.slug === "basic-black")!;
  const white = staticProducts.find((p) => p.slug === "basic-white")!;
  const makeVariants = (slug: string): ProductVariant[] =>
    SIZES.map((size) => ({ id: `${slug}-${size}`, product_id: slug, size, stock_quantity: 30, sku: null }));

  return {
    black: { product: black, variants: makeVariants("basic-black") },
    white: { product: white, variants: makeVariants("basic-white") },
  };
}

export default async function BasicPage() {
  const data = await getBasicProducts();
  return <BasicProductClient black={data.black} white={data.white} />;
}
