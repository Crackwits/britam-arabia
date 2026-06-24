
import { InsightHeroAttributes, InsightsAttributes } from "@/components/lib/types";
import Navbar from "../../organisms/layout/Navbar";
import PageHero from "../../organisms/heros/PageHero";
import DetailHero from "../../organisms/sections/DetailHero";
import DetailContent from "../../organisms/sections/DetailContent";

interface InsightDetailTemplateProps {
    data: InsightsAttributes;
    lang: string;
}

export default function InsightDetailTemplate({ data, lang }: InsightDetailTemplateProps) {
    const isArabic = lang === 'ar';

    return (
        <>
            <Navbar activeSection="homehero" lang={lang} />
            <DetailHero subheading={data.date} heading={data.title} cover={data.cover}/>
            <DetailContent content={data.content}/>
        </>
    );
}