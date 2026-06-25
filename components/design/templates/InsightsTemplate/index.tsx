
import { InsightHeroAttributes, InsightsAttributes } from "@/components/lib/types";
import Navbar from "../../organisms/layout/Navbar";
import PageHero from "../../organisms/heros/PageHero";
import InsightsSection from "../../organisms/sections/InsightsSection";

interface InsightsTemplateProps {
    herodata: InsightHeroAttributes;
    data: InsightsAttributes[];
    lang: string;
}

export default function InsightsTemplate({ herodata, data, lang }: InsightsTemplateProps) {
    const isArabic = lang === 'ar';

    return (
        <>
            <Navbar activeSection="homehero" lang={lang} />
            <PageHero image={herodata.image} title={herodata.hero_headline} subtitle="" />
            <InsightsSection
                intro_title={herodata.intro_title}
                intro_desc={herodata.intro_desc}
                insights={data}
                isArabic={isArabic}
                lang={lang}
            />
        </>
    );
}