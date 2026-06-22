import type { Metadata } from "next";
import { getBySlug, getCollection } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { CriticalEnvironments } from "@/components/lib/types";
import CriticalEnvironmentTemplate from "@/components/design/templates/CriticalEnvironmentTemplate";
import { notFound } from "next/navigation";

// ── Both dynamic segments are in params ───────────────────────────────────────
type Params = Promise<{ lang: string; slug: string }>;

// ── Pre-generate all slug paths at build time ─────────────────────────────────
export async function generateStaticParams() {
    const locales = ["en", "ar"];

    const paths = await Promise.all(
        locales.map(async (lang) => {
            const items = await getCollection<CriticalEnvironments>(
                "critical-projects",
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

    const page = await getBySlug<CriticalEnvironments>(
        "critical-projects",
        slug, // correct arg order: slug second
        lang,
        { cover: true } // nested populate object
    );

    if (!page?.seo) return { title: "Britam Arabia" };
    return buildMetadata(page.seo, lang, `/critical-environments/${slug}`);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CriticalEnvironmentPage({
    params,
}: {
    params: Params;
}) {
    const { lang, slug } = await params;

    const page = await getBySlug<CriticalEnvironments>(
        "critical-projects",
        slug,
        lang,
        {
            cover: true,  // populate cover image relation
        }
    );

    if (!page) notFound(); // renders app/not-found.tsx

    return <CriticalEnvironmentTemplate data={page} lang={lang} />;
}