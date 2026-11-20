import type { MetadataRoute } from "next";
import { NAV_LINKS } from "@/lib/nav";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return NAV_LINKS.map((link) => ({
    url: `${SITE_URL}${link.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: link.href === "/" ? 1 : 0.7
  }));
}
