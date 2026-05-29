import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/shop/"],
        disallow: ["/admin/", "/account/", "/api/", "/checkout", "/cart"],
      },
    ],
    sitemap: "https://nine2five.nz/sitemap.xml",
  };
}
