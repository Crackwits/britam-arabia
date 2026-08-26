import type { Metadata } from "next";
import { getSingleType, getCollection } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { PrivacyPolicyAttributes } from "@/components/lib/types";
import PrivacyPolicyTemplate from "@/components/design/templates/PrivacyPolicyTemplate";
import JsonLd from "@/components/lib/jsonld";
type Params = Promise<{ lang: string }>; // ← add this

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const { lang } = await params;
    const page = await getSingleType<PrivacyPolicyAttributes>("privacy-policy", lang, {
        seo: { populate: "*", }
    });
    if (!page?.seo) return { title: "Britam Arabia" };
    return buildMetadata(page.seo, lang, "/privacy-policy");
}

export default async function PrivacyPolicy({ params }: { params: Params }) {
    const { lang } = await params;
    const page = await getSingleType<PrivacyPolicyAttributes>("privacy-policy", lang, { seo: { populate: "*" }, });

    if (!page) {
        return <main><p>Content not available.</p></main>;
    }

    return (
        <>
            <JsonLd data={page.seo?.schema_markup} />
            <PrivacyPolicyTemplate data={page} lang={lang} />
        </>
    );
}
