import type { Metadata } from "next";
import { getCollection, getSingleType } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { CriticalEnvironments, OurJourneyAttributes } from "@/components/lib/types";
import HomeTemplate from "@/components/design/templates/Home";
import OurJourneyTemplate from "@/components/design/templates/OurJourney";
import JsonLd from "@/components/lib/jsonld";
type Params = Promise<{ lang: string }>; // ← add this

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const { lang } = await params;
    const page = await getSingleType<OurJourneyAttributes>("our-journey", lang, {
        seo: { populate: "*", }
    });
    if (!page?.seo) return { title: "Britam Arabia" };
    return buildMetadata(page.seo, lang, "/our-journey");
}

export default async function OurJourney({ params }: { params: Params }) {
    const { lang } = await params;
    const critical_environments = await getCollection<CriticalEnvironments>("critical-projects", lang,
        {
            cover: true,
        });
    const page = await getSingleType<OurJourneyAttributes>("our-journey", lang,
        {
            image: true,
            section1_image: true,
            section2_image: true,
            section4_image: true,
            team_members: { populate: "*" },
            operations_team: { populate: "*" },
            seo: { populate: "*" },
        });

    if (!page) {
        return <main><p>Content not available.</p></main>;
    }

    return (
        <>
            <JsonLd data={page.seo?.schema_markup} />
            <OurJourneyTemplate ourJourneydata={page} critical_environments={critical_environments} lang={lang} />
        </>
    );
}
