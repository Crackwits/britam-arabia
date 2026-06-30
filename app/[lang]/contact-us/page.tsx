import type { Metadata } from "next";
import { getSingleType, getCollection } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { GlobalSettingAttributes, ContactusAttributes } from "@/components/lib/types";
import ContactUsTemplate from "@/components/design/templates/ContactUsTemplate";

type Params = Promise<{ lang: string }>; // ← add this

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const { lang } = await params;
    const page = await getSingleType<ContactusAttributes>("contactus", lang, {
        seo: { populate: "*", }
    });
    if (!page?.seo) return { title: "Britam Arabia" };
    return buildMetadata(page.seo, lang, "/contact-us");
}

export default async function ContactUs({ params }: { params: Params }) {
    const { lang } = await params;

    const globalsettings = await getSingleType<GlobalSettingAttributes>("global-setting", lang);

    const page = await getSingleType<ContactusAttributes>("contactus", lang);

    if (!page) {
        return <main><p>Content not available.</p></main>;
    }

    return (
        <>
            <ContactUsTemplate data={page} globalsettings={globalsettings} lang={lang} />
        </>
    );
}
