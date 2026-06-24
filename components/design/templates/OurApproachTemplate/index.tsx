
import { Capabilities, CriticalEnvironments, OurJourneyAttributes } from "@/components/lib/types";
import Navbar from "../../organisms/layout/Navbar";
import PageHero from "../../organisms/heros/PageHero";
import MediaBlock from "@/components/core/molecules/MediaBlock";
import WhatYouGetSection from "../../organisms/sections/Whatyougetsection";
import OurApproach from "../../organisms/sections/OurApproach";
import ServicesEntry from "../../organisms/sections/HpServicesEntry";
import { OurApproachAttributes } from "@/components/lib/types";

interface OurApproachTemplateProps {
    data: OurApproachAttributes;
    capabilities: Capabilities[];
    lang: string;
}

export default function OurApproachTemplate({ data, capabilities, lang }: OurApproachTemplateProps) {
    const isArabic = lang === 'ar';

    return (
        <>
            <Navbar activeSection="homehero" lang={lang} />
            <PageHero image={data.image} title={data.hero_headline} subtitle="" />
            <MediaBlock isArabic={isArabic} title={data.section1_title}
                desc={data.section1_desc}
                cta=""
                cta2_label=""
                cta2_link=""
                image={data.section1_image} />
            <WhatYouGetSection section2_title={data.section2_title}
                intro_what_you_get={data.section2_content} titleclass="" />

            <OurApproach isArabic={isArabic} subheading={data.section3_subheading}
                heading={data.section3_heading}
                desc={data.section3_desc}
                steps={data.section3_steps} />

            <ServicesEntry lang={lang} isArabic={isArabic} services_entry_heading={data.section5_heading} 
             services_entry_subheading={data.section5_subheading}
                services_entry_items={capabilities} />
        </>
    );
}