import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/lib/settings";

const BASE_URL = SITE_URL.replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
