import type { MetadataRoute } from "next";
import { absoluteSiteUrl, publicStaticRoutes } from "./seoMetadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicStaticRoutes.map((route) => ({
    url: absoluteSiteUrl(route),
    lastModified,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
