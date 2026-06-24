import type { Metadata } from "next";
import { getCollection, getSingleType } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { InsightHeroAttributes, InsightsAttributes } from "@/components/lib/types";
import InsightsTemplate from "@/components/design/templates/InsightsTemplate";

type Params = Promise<{ lang: string }>; // ← add this

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const { lang } = await params;
    const page = await getSingleType<InsightHeroAttributes>("insight-hero", lang, {
        seo: { populate: "*", }
    });
    if (!page?.seo) return { title: "Britam Arabia" };
    return buildMetadata(page.seo, lang, "/insights");
}

export default async function Insights({ params }: { params: Params }) {
    const { lang } = await params;
    const data = await getCollection<InsightsAttributes>("insights", lang,
        {
            thumbnail: true,
            cover:true,
        });
    const page = await getSingleType<InsightHeroAttributes>("insight-hero", lang,
        {
            image: true,

        });

    if (!page) {
        return <main><p>Content not available.</p></main>;
    }

    return (
        <>
            <InsightsTemplate herodata={page} data={data} lang={lang} />
        </>
    );
}
