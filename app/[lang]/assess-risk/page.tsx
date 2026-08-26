import type { Metadata } from "next";
import { getSingleType } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { AssessRiskAttributes } from "@/components/lib/types";
import RiskAssessmentTemplate from "@/components/design/templates/RiskAssessmentTemplate";
import JsonLd from "@/components/lib/jsonld";
type Params = Promise<{ lang: string }>; // ← add this

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const { lang } = await params;
    const page = await getSingleType<AssessRiskAttributes>("risk-assessment", lang, {
        seo: { populate: "*", }
    });
    if (!page?.seo) return { title: "Britam Arabia" };
    return buildMetadata(page.seo, lang, "/assess-risk");
}

export default async function AssessRisk({ params }: { params: Params }) {
    const { lang } = await params;

    const page = await getSingleType<AssessRiskAttributes>("risk-assessment", lang, {
        seo: { populate: "*" },
    });

    if (!page) {
        return <main><p>Content not available.</p></main>;
    }

    return (
        <>
            <JsonLd data={page.seo?.schema_markup} />
            <RiskAssessmentTemplate data={page} lang={lang} />
        </>
    );
}
