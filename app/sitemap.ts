import type { MetadataRoute } from "next";
import { NAV_LINKS } from "@/lib/nav";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://niacosmetics.co.tz";

  return NAV_LINKS.map((link) => ({
    url: `${baseUrl}${link.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: link.href === "/" ? 1 : 0.7
  }));
}
