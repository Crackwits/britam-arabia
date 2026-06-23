
import { CriticalEnvironments, OurJourneyAttributes } from "@/components/lib/types";
import Navbar from "../../organisms/layout/Navbar";
import PageHero from "../../organisms/heros/PageHero";
import MediaBlock from "@/components/core/molecules/MediaBlock";
import OurJourneySection2 from "../../organisms/sections/OurJourneySection2";
import LeadershipSection from "../../organisms/sections/LeadershipSection";
import CriticalEnvironmentsSection from "../../organisms/sections/CriticalEnvironmentsSection";
interface OurJourneyTemplateProps {
    ourJourneydata: OurJourneyAttributes;
    critical_environments: CriticalEnvironments[];
    lang: string;
}

export default function OurJourneyTemplate({ ourJourneydata, critical_environments, lang }: OurJourneyTemplateProps) {
    const isArabic = lang === 'ar';

    return (
        <>
            <Navbar activeSection="homehero" lang={lang} />
            <PageHero image={ourJourneydata.image} title={ourJourneydata.hero_headline} />
            <MediaBlock isArabic={isArabic} title={ourJourneydata.section1_title}
                desc={ourJourneydata.section1_desc}
                cta=""
                cta2_label=""
                cta2_link=""
                image={ourJourneydata.section1_image} />
            <OurJourneySection2 isArabic={isArabic} title={ourJourneydata.section2_title}
                desc={ourJourneydata.section2_desc}
                image={ourJourneydata.section2_image} />
            <CriticalEnvironmentsSection section3_title={ourJourneydata.section3_title}
                section3_desc={ourJourneydata.section3_desc}
                critical_environments={critical_environments} />
            <MediaBlock isArabic={isArabic} title=""
                desc={ourJourneydata.section4_desc}
                cta=""
                cta2_label=""
                cta2_link=""
                image={ourJourneydata.section4_image} />

            <LeadershipSection
                section5_leadership={ourJourneydata.section5_leadership}
                section5_heading={ourJourneydata.section5_heading}
                section5_subheading={ourJourneydata.section5_subheading}
                section5_body={ourJourneydata.section5_body}
                team_members={ourJourneydata.team_members}
            />
        </>
    );
}