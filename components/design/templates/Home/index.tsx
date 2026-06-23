
import HeroBanner from "../../organisms/heros/Herobanner";
import PartnershipBanner from "../../organisms/heros/Partnershipbanner";
import { HomePageAttributes } from "@/components/lib/types";
import Navbar from "../../organisms/layout/Navbar";
import MediaBlock from "@/components/core/molecules/MediaBlock";
import WhatYouGetSection from "../../organisms/sections/Whatyougetsection";
import WhyChooseUsSection from "../../organisms/sections/Whychooseussection";
import OurApproach from "../../organisms/sections/OurApproach";
import WhereWeOperate from "../../organisms/sections/WhereWeOperate";
import ServicesEntry from "../../organisms/sections/HpServicesEntry";
import TestimonialsSection from "../../organisms/sections/TestimonialsSection";
import HpContactSection from "../../organisms/sections/HpContact";
import { GlobalSettingAttributes } from "@/components/lib/types";

interface HomePageTemplateProps {
    homedata: HomePageAttributes;
    globalSettings: GlobalSettingAttributes | null;
    lang: string;
}


export default function HomeTemplate({ homedata, globalSettings, lang }: HomePageTemplateProps) {
    const isArabic = lang === 'ar';
    const locale: "ar" | "en" = lang === "ar" ? "ar" : "en";
    return (
        <>
            <Navbar activeSection="homehero" lang={lang} />
            <HeroBanner homedata={homedata} />
            <PartnershipBanner homedata={homedata} />
            <MediaBlock isArabic={isArabic} title={homedata.section1_title}
                desc={homedata.section1_desc}
                cta={homedata.section1_cta}
                cta2_label=""
                cta2_link=""
                image={homedata.section1_image} />

            <WhatYouGetSection section2_title={homedata.section2_title} intro_what_you_get={homedata.intro_what_you_get} />
            <WhyChooseUsSection section3_title={homedata.section3_title} intro_why_choose_us={homedata.intro_why_choose_us} />
            <MediaBlock isArabic={isArabic} title={homedata.section4_title}
                desc={homedata.section4_desc}
                cta={homedata.section4_cta}
                cta2_label={homedata.section4_checklist_label}
                cta2_link={homedata.section4_checklist_link}
                image={homedata.section4_image} />
            <OurApproach isArabic={isArabic} subheading={homedata.section5_subheading}
                heading={homedata.section5_heading}
                desc={homedata.section5_desc}
                steps={homedata.approach_steps} />
            <WhereWeOperate title={homedata.where_we_operate}
                heading={homedata.where_we_operate_heading}
                subheading={homedata.where_we_operate_subheading}
                body={homedata.where_we_operate_body}
                kpis={homedata.kpis}
                project_title={homedata.project_title}
                critical_projects={homedata.critical_projects} />
            <ServicesEntry isArabic={isArabic} services_entry_heading={homedata.services_entry_heading}
                services_entry_items={homedata.services_entry_items} />

            <TestimonialsSection isArabic={isArabic}
                testimonials_title={homedata.testimonials_title}
                testimonials={homedata.testimonials} />
            <HpContactSection locale={locale} globalSettings={globalSettings} heading={homedata.inquiry_cta_heading} body={homedata.inquiry_cta_body} />
        </>
    );
}