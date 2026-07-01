import type { Metadata } from "next";
import { getSingleType, getCollection } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { CookiePolicyAttributes } from "@/components/lib/types";
import CookiesPolicyTemplate from "@/components/design/templates/CookiesPolicyTemplate";

type Params = Promise<{ lang: string }>; // ← add this

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const { lang } = await params;
    const page = await getSingleType<CookiePolicyAttributes>("cookies-policy", lang, {
        seo: { populate: "*", }
    });
    if (!page?.seo) return { title: "Britam Arabia" };
    return buildMetadata(page.seo, lang, "/cookies-policy");
}

export default async function CookiesPolicy({ params }: { params: Params }) {
    const { lang } = await params;
    const page = await getSingleType<CookiePolicyAttributes>("cookies-policy", lang);

    if (!page) {
        return <main><p>Content not available.</p></main>;
    }

    return (
        <>
            <CookiesPolicyTemplate data={page} lang={lang} />
        </>
    );
}
