
import { CriticalEnvironments, OurJourneyAttributes } from "@/components/lib/types";
import Navbar from "../../organisms/layout/Navbar";
import PageHero from "../../organisms/heros/PageHero";
interface CriticalEnvironmentTemplateProps {
    data: CriticalEnvironments;
    lang: string;
}

export default function CriticalEnvironmentTemplate({ data, lang }: CriticalEnvironmentTemplateProps) {
    const isArabic = lang === 'ar';

    return (
        <>
            <Navbar activeSection="homehero" lang={lang} />
            <PageHero image={data.cover} title={data.name} />

        </>
    );
}