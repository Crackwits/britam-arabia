
import { CriticalEnvironments, OurJourneyAttributes } from "@/components/lib/types";
import Navbar from "../../organisms/layout/Navbar";
import DetailHero from "../../organisms/sections/DetailHero";
import DetailContent from "../../organisms/sections/DetailContent";
interface CriticalEnvironmentTemplateProps {
    data: CriticalEnvironments;
    lang: string;
}

export default function CriticalEnvironmentTemplate({ data, lang }: CriticalEnvironmentTemplateProps) {
    const isArabic = lang === 'ar';

    return (
        <>
            <Navbar activeSection="" lang={lang} />
            <section className="pt-21">
                <DetailHero subheading={data.industry} heading={data.name} cover={data.cover} />
                <DetailContent content={data.content} />
            </section>
        </>
    );
}