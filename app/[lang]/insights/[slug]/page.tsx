import type { Metadata } from "next";
import { getBySlug, getCollection } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { InsightsAttributes } from "@/components/lib/types";
import { notFound } from "next/navigation";
import InsightDetailTemplate from "@/components/design/templates/InsightDetailTemplate";
// ── Both dynamic segments are in params ───────────────────────────────────────
type Params = Promise<{ lang: string; slug: string }>;

// ── Pre-generate all slug paths at build time ─────────────────────────────────
export async function generateStaticParams() {
    const locales = ["en", "ar"];

    const paths = await Promise.all(
        locales.map(async (lang) => {
            const items = await getCollection<InsightsAttributes>(
                "insights",
                lang,
            );
            return items.map((item) => ({ lang, slug: item.slug }));
        })
    );

    return paths.flat();
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const { lang, slug } = await params; // ← slug now comes from params

    const page = await getBySlug<InsightsAttributes>(
        "insights",
        slug, // correct arg order: slug second
        lang,
        {
            cover: true,
            seo: { populate: "*", }
        } // nested populate object
    );

    if (!page?.seo) return { title: "Britam Arabia" };
    return buildMetadata(page.seo, lang, `/insights/${slug}`);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function InsightDetailPage({
    params,
}: {
    params: Params;
}) {
    const { lang, slug } = await params;

    const relatedinsights = await getCollection<InsightsAttributes>("insights",
        lang,
        {
            thumbnail: true,
            cover: true,  // populate cover image relation
        },
        { slug: { $ne: slug } }
    );

    const page = await getBySlug<InsightsAttributes>(
        "insights",
        slug,
        lang,
        {
            cover: true,  // populate cover image relation
        }
    );

    if (!page) notFound(); // renders app/not-found.tsx

    return <InsightDetailTemplate data={page} relatedinsights={relatedinsights} lang={lang} />;
}