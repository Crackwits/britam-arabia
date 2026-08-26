import type { Metadata } from "next";
import type { StrapiSEO } from "@/components/lib/types";
import { STRAPI_URL, SITE_URL, SITE_NAME } from "./settings";

/* -------------------------------------------------------------------------- */
/*  Config                                                                     */
/* -------------------------------------------------------------------------- */

const stripTrailing = (u: string) => u.replace(/\/+$/, "");

const NSITE_URL = stripTrailing(SITE_URL);
const NSTRAPI_URL = stripTrailing(STRAPI_URL || "");

const SUPPORTED_LANGS = ["en", "ar"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

/** Facebook-style locale codes. `ar_AR` is the valid OG code for Arabic. */
const OG_LOCALE: Record<Lang, string> = {
    en: "en_US",
    ar: "ar_AR",
};

/* -------------------------------------------------------------------------- */
/*  Placeholders — used whenever Strapi returns nothing for a field            */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER = {
    en: {
        title: `${SITE_NAME}`,
        description: `Welcome to ${SITE_NAME}.`,
        imageAlt: `${SITE_NAME} preview image`,
    },
    ar: {
        title: `${SITE_NAME}`,
        description: `مرحبًا بكم في ${SITE_NAME}.`,
        imageAlt: `صورة معاينة ${SITE_NAME}`,
    },
} satisfies Record<Lang, { title: string; description: string; imageAlt: string }>;

/** Put a real 1200x630 file at /public/og/default.png before shipping. */
const PLACEHOLDER_IMAGE = {
    url: `${SITE_URL}/og/default.png`,
    width: 1200,
    height: 630,
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function resolveLang(lang: string): Lang {
    return (SUPPORTED_LANGS as readonly string[]).includes(lang)
        ? (lang as Lang)
        : "en";
}

/** "" | "/" -> "", "about" -> "/about", "/about/" -> "/about" */
function normalizePath(path?: string): string {
    if (!path || path === "/") return "";
    return `/${path}`.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
}

/** Strapi media URLs are relative on local uploads, absolute on S3/Cloudinary. */
function toAbsoluteMediaUrl(url?: string | null): string | undefined {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    return `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

type MediaLike = {
    url?: string;
    width?: number;
    height?: number;
    alternativeText?: string | null;
};

/** Accepts Strapi v4 (`data.attributes`), v5 (flat), arrays, or null. */
function extractMedia(metaImage: unknown): MediaLike | undefined {
    if (!metaImage) return undefined;

    // Peel off, in order: the v4 `data` envelope, an array wrapper, `attributes`.
    let node: any = metaImage;
    if (node.data !== undefined) node = node.data;
    if (Array.isArray(node)) node = node[0];
    if (node?.attributes) node = node.attributes;

    return node?.url ? (node as MediaLike) : undefined;
}

/** Strapi keywords come back as a comma-separated string. */
function normalizeKeywords(
    keywords?: string | string[] | null
): string[] | undefined {
    if (!keywords) return undefined;
    const list = (Array.isArray(keywords) ? keywords : keywords.split(","))
        .map((k) => k.trim())
        .filter(Boolean);
    return list.length ? list : undefined;
}

/** Descriptions get truncated by crawlers anyway — do it cleanly here. */
function clamp(text: string, max: number): string {
    const t = text.replace(/\s+/g, " ").trim();
    return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}

/* -------------------------------------------------------------------------- */
/*  Builder                                                                    */
/* -------------------------------------------------------------------------- */

export function buildMetadata(
    seo: StrapiSEO | null | undefined,
    lang: string,
    path: string,
    options: {
        type?: "website" | "article";
        noIndex?: boolean;
        publishedTime?: string;
        modifiedTime?: string;
    } = {}
): Metadata {
    const locale = resolveLang(lang);
    const cleanPath = normalizePath(path);
    const fallback = PLACEHOLDER[locale];

    const s = (seo ?? {}) as Partial<StrapiSEO> & Record<string, any>;

    /* ---- text ---- */
    const title = s.metaTitle?.trim() || fallback.title;
    const description = clamp(
        s.metaDescription?.trim() || fallback.description,
        160
    );

    /* ---- image (never undefined — falls back to the static OG image) ---- */
    const media = extractMedia(s.metaImage);
    const mediaUrl = toAbsoluteMediaUrl(media?.url);

    const image = mediaUrl
        ? {
              url: mediaUrl,
              width: media?.width ?? PLACEHOLDER_IMAGE.width,
              height: media?.height ?? PLACEHOLDER_IMAGE.height,
              alt: media?.alternativeText?.trim() || title,
          }
        : { ...PLACEHOLDER_IMAGE, alt: fallback.imageAlt };

    /* ---- urls ---- */
    // Support both `canonicalUrl` and Strapi's default `canonicalURL` field name.
    const canonicalUrl =
        s.canonicalUrl?.trim() ||
        s.canonicalURL?.trim() ||
        `${SITE_URL}/${locale}${cleanPath}`;

    const languages = Object.fromEntries(
        SUPPORTED_LANGS.map((l) => [l, `${SITE_URL}/${l}${cleanPath}`])
    ) as Record<Lang, string>;

    /* ---- robots ---- */
    const noIndex =
        options.noIndex ??
        /noindex/i.test(String(s.metaRobots ?? s.preventIndexing ?? ""));

    return {
        metadataBase: new URL(SITE_URL),
        title,
        description,
        keywords: normalizeKeywords(s.keywords),

        alternates: {
            canonical: canonicalUrl,
            languages: {
                ...languages,
                "x-default": `${SITE_URL}/en${cleanPath}`,
            },
        },

        robots: noIndex
            ? { index: false, follow: false }
            : {
                  index: true,
                  follow: true,
                  googleBot: {
                      index: true,
                      follow: true,
                      "max-image-preview": "large",
                      "max-snippet": -1,
                      "max-video-preview": -1,
                  },
              },

        openGraph: {
            type: options.type ?? "website",
            siteName: SITE_NAME,
            title,
            description,
            url: canonicalUrl,
            locale: OG_LOCALE[locale],
            alternateLocale: SUPPORTED_LANGS.filter((l) => l !== locale).map(
                (l) => OG_LOCALE[l]
            ),
            images: [image],
            ...(options.type === "article" && {
                publishedTime: options.publishedTime,
                modifiedTime: options.modifiedTime,
            }),
        },

        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image.url],
        },
    };
}