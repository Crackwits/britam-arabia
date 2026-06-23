import type { Metadata } from "next";
import { getSingleType, getCollection } from "@/components/lib/api";
import { buildMetadata } from "@/components/lib/seo";
import type { Capabilities, GlobalSettingAttributes, HomePageAttributes } from "@/components/lib/types";
import HomeTemplate from "@/components/design/templates/Home";

type Params = Promise<{ lang: string }>; // ← add this

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { lang } = await params;
  const page = await getSingleType<HomePageAttributes>("home-page", lang);
  if (!page?.seo) return { title: "Britam Arabia" };
  return buildMetadata(page.seo, lang, "/");
}

export default async function HomePage({ params }: { params: Params }) {
  const { lang } = await params;

  const globalsettings = await getSingleType<GlobalSettingAttributes>("global-setting", lang);
  const capabilities = await getCollection<Capabilities>("integrated-capabilities", lang,
    {
        image: true,
    });
  const page = await getSingleType<HomePageAttributes>("home-page", lang,
    {
      image: true,
      partner_image: true,
      section1_image: true,
      section4_image: true,
      intro_what_you_get: true,
      intro_why_choose_us: true,
      approach_steps: true,
      kpis: true,
      testimonials: true,
      critical_projects: { populate: "*" },
      services_entry_items: { populate: "*" },
    });

  if (!page) {
    return <main><p>Content not available.</p></main>;
  }

  return (
    <>
      <HomeTemplate homedata={page} capabilities={capabilities} globalSettings={globalsettings} lang={lang} />
    </>
  );
}
