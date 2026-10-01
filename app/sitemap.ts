import type { MetadataRoute } from "next";
import { getCollection } from "@/components/lib/api";
import { SITE_URL } from "@/components/lib/settings";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/components/lib/locales";

// Regenerated hourly, so new CMS entries show up without a redeploy
export const revalidate = 3600;

const BASE_URL = SITE_URL.replace(/\/+$/, "");

const STATIC_PATHS = [
  "",
  "/our-approach",
  "/our-journey",
  "/life-at-britam",
  "/insights",
  "/faq",
  "/contact-us",
  "/assess-risk",
  "/privacy-policy",
  "/terms-conditions",
  "/cookies-policy",
];

// Strapi collection -> URL prefix of its [slug] pages
const COLLECTIONS = [
  { contentType: "critical-projects", path: "/critical-environments" },
  { contentType: "insights", path: "/insights" },
  { contentType: "careers", path: "/careers" },
];

type SlugEntry = { slug: string; updatedAt?: string };

function entry(path: string, lastModified?: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE_URL}/${DEFAULT_LOCALE}${path}`,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    alternates: {
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
      ),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicEntries = await Promise.all(
    COLLECTIONS.map(async ({ contentType, path }) => {
      try {
        const items = await getCollection<SlugEntry>(contentType, DEFAULT_LOCALE);
        return items
          .filter((item) => item.slug)
          .map((item) => entry(`${path}/${item.slug}`, item.updatedAt));
      } catch (error) {
        // A CMS hiccup shouldn't take the whole sitemap down
        console.error(`sitemap: failed to load ${contentType}`, error);
        return [];
      }
    })
  );

  return [...STATIC_PATHS.map((path) => entry(path)), ...dynamicEntries.flat()];
}
