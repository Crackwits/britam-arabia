
import { Capabilities, CriticalEnvironments, OurJourneyAttributes } from "@/components/lib/types";
import Navbar from "../../organisms/layout/Navbar";
import PageHero from "../../organisms/heros/PageHero";
import MediaBlock from "@/components/core/molecules/MediaBlock";
import WhatYouGetSection from "../../organisms/sections/Whatyougetsection";

interface CapabilitiesTemplateProps {
    data: Capabilities;
    lang: string;
}

export default function CapabilitiesTemplate({ data, lang }: CapabilitiesTemplateProps) {
    const isArabic = lang === 'ar';

    return (
        <>
            <Navbar activeSection="homehero" lang={lang} />
            <PageHero image={data.hero_image} title={data.hero_heading} />
            <MediaBlock isArabic={isArabic} title={data.section1_title}
                desc={data.section1_description}
                cta=""
                cta2_label=""
                cta2_link=""
                image={data.section1_image} />

            <WhatYouGetSection section2_title={data.section2_title} intro_what_you_get={data.section2_content} titleclass="max-w-[300px]" />

            <MediaBlock isArabic={isArabic} title={data.section3_title}
                desc={data.section3_desc}
                cta=""
                cta2_label=""
                cta2_link=""
                image={data.section3_image} />


        </>
    );
}