import type { MetadataRoute } from "next";
import { absoluteSiteUrl, operatorOnlyRoutes } from "./seoMetadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...operatorOnlyRoutes],
    },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
  };
}
