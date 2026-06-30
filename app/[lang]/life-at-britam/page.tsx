import type { Metadata } from "next";
import { getCollection, getSingleType } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { CareersAttributes, LifeAtBritamAttributes } from "@/components/lib/types";
import LifeAtBritamTemplate from "@/components/design/templates/LifeAtBritamTemplate";


type Params = Promise<{ lang: string }>; // ← add this

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const { lang } = await params;
    const page = await getSingleType<LifeAtBritamAttributes>("life-at-britam", lang, {
        seo: { populate: "*", }
    });
    if (!page?.seo) return { title: "Britam Arabia" };
    return buildMetadata(page.seo, lang, "/life-at-britam");
}

export default async function OurJourney({ params }: { params: Params }) {
    const { lang } = await params;
    const careers = await getCollection<CareersAttributes>("careers", lang);
    const page = await getSingleType<LifeAtBritamAttributes>("life-at-britam", lang,
        {
            image: true,
            section1_image: true,
            section2_image: true,
            why_join_us: { populate: "*" },
        });

    if (!page) {
        return <main><p>Content not available.</p></main>;
    }

    return (
        <>
            <LifeAtBritamTemplate data={page} careers={careers} lang={lang} />
        </>
    );
}
