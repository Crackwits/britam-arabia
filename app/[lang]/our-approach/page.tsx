import type { Metadata } from "next";
import { getCollection, getSingleType } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { Capabilities, OurApproachAttributes } from "@/components/lib/types";
import OurApproachTemplate from "@/components/design/templates/OurApproachTemplate";

type Params = Promise<{ lang: string }>; // ← add this

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const { lang } = await params;
    const page = await getSingleType<OurApproachAttributes>("our-approach", lang, {
        seo: { populate: "*", }
    });
    if (!page?.seo) return { title: "Britam Arabia" };
    return buildMetadata(page.seo, lang, "/our-approach");
}

export default async function OurApproach({ params }: { params: Params }) {
    const { lang } = await params;
    const capabilities = await getCollection<Capabilities>("integrated-capabilities", lang,
        {
            image: true,
        });
    const page = await getSingleType<OurApproachAttributes>("our-approach", lang,
        {
            image: true,
            section1_image: true,
            section2_content: { populate: "*" },
            section3_steps: { populate: "*" },
            measurable_impacts: { populate: "*" },

        });

    if (!page) {
        return <main><p>Content not available.</p></main>;
    }

    return (
        <>
            <OurApproachTemplate data={page} capabilities={capabilities} lang={lang} />
        </>
    );
}
