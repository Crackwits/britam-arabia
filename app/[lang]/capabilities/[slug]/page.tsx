import type { Metadata } from "next";
import { getBySlug, getCollection } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { Capabilities } from "@/components/lib/types";
import CapabilitiesTemplate from "@/components/design/templates/CapabilitiesTemplate";
import { notFound } from "next/navigation";

// ── Both dynamic segments are in params ───────────────────────────────────────
type Params = Promise<{ lang: string; slug: string }>;

// ── Pre-generate all slug paths at build time ─────────────────────────────────
export async function generateStaticParams() {
    const locales = ["en", "ar"];

    const paths = await Promise.all(
        locales.map(async (lang) => {
            const items = await getCollection<Capabilities>(
                "integrated-capabilities",
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

    const page = await getBySlug<Capabilities>(
        "integrated-capabilities",
        slug, // correct arg order: slug second
        lang,
        {
            image: true,
            hero_image: true,
            section1_image: true,
            section3_image: true,
            seo: { populate: "*" },
            section2_content: { populate: "*" },
        } // nested populate object
    );

    if (!page?.seo) return { title: "Britam Arabia" };
    return buildMetadata(page.seo, lang, `/capabilities/${slug}`);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CriticalEnvironmentPage({
    params,
}: {
    params: Params;
}) {
    const { lang, slug } = await params;

    const page = await getBySlug<Capabilities>(
        "integrated-capabilities",
        slug,
        lang,
        {
            image: true,
            hero_image: true,
            section1_image: true,
            section3_image: true,
            seo: { populate: "*" },
            section2_content: { populate: "*" },
        }
    );

    if (!page) notFound(); // renders app/not-found.tsx

    return <CapabilitiesTemplate data={page} lang={lang} />;
}