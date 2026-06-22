import type { Metadata } from "next";
import type { StrapiSEO } from "@/components/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL!;

export function buildMetadata(
    seo: StrapiSEO,
    lang: string,
    path: string
): Metadata {
    const imageUrl = seo.metaImage?.data?.attributes?.url
        ? `${STRAPI_URL}${seo.metaImage.data.attributes.url}`
        : undefined;

    const canonicalUrl = seo.canonicalUrl ?? `${SITE_URL}/${lang}${path}`;

    return {
        title: seo.metaTitle,
        description: seo.metaDescription,
        keywords: seo.keywords,

        alternates: {
            canonical: canonicalUrl,
            languages: {
                en: `${SITE_URL}/en${path}`,
                ar: `${SITE_URL}/ar${path}`,
            },
        },

        openGraph: {
            title: seo.metaTitle,
            description: seo.metaDescription,
            url: canonicalUrl,
            locale: lang === "ar" ? "ar_AR" : "en_US",
            alternateLocale: lang === "ar" ? "en_US" : "ar_AR",
            ...(imageUrl && {
                images: [
                    {
                        url: imageUrl,
                        width: seo.metaImage!.data.attributes.width,
                        height: seo.metaImage!.data.attributes.height,
                    },
                ],
            }),
        },

        twitter: {
            card: "summary_large_image",
            title: seo.metaTitle,
            description: seo.metaDescription,
            ...(imageUrl && { images: [imageUrl] }),
        },

        // RTL hint for Arabic
        other: {
            "og:locale": lang === "ar" ? "ar_AR" : "en_US",
        },
    };
}