import type { Metadata } from "next";
import { getSingleType, getCollection } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { PrivacyPolicyAttributes, TermsAndConditionsAttributes } from "@/components/lib/types";
import TermsConditionsTemplate from "@/components/design/templates/TermsConditionsTemplate";
import JsonLd from "@/components/lib/jsonld";
type Params = Promise<{ lang: string }>; // ← add this

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const { lang } = await params;
    const page = await getSingleType<TermsAndConditionsAttributes>("terms-and-condition", lang, {
        seo: { populate: "*", }
    });
    if (!page?.seo) return { title: "Britam Arabia" };
    return buildMetadata(page.seo, lang, "/terms-conditions");
}

export default async function TermsConditions({ params }: { params: Params }) {
    const { lang } = await params;
    const page = await getSingleType<TermsAndConditionsAttributes>("terms-and-condition", lang, {
        seo: { populate: "*" },
    });

    if (!page) {
        return <main><p>Content not available.</p></main>;
    }

    return (
        <>
            <JsonLd data={page.seo?.schema_markup} />
            <TermsConditionsTemplate data={page} lang={lang} />
        </>
    );
}
