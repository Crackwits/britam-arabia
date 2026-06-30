
'use client';
import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import HeroBanner from "../../organisms/heros/Herobanner";
import { CareersAttributes, LifeAtBritamAttributes } from '@/components/lib/types';
import Navbar from '../../organisms/layout/Navbar';
import PageHero from '../../organisms/heros/PageHero';
import MediaBlock from '@/components/core/molecules/MediaBlock';
import WhyJoinUsSection from '../../organisms/sections/WhyJoinUs';
import VisionCard from '../../organisms/sections/VisionCard';
import CareersSection from '../../organisms/sections/CareersSection';

interface LifeAtBritamTemplateProps {
    data: LifeAtBritamAttributes;
    careers: CareersAttributes[];
    lang: string;
}


export default function LifeAtBritamTemplate({ data, careers, lang }: LifeAtBritamTemplateProps) {
    const isArabic = lang === 'ar';
    const locale: "ar" | "en" = lang === "ar" ? "ar" : "en";
    const [activeSection, setActiveSection] = useState('');
    const [visibleSections, setVisibleSections] = useState(new Set());
    const [scrollProgress, setScrollProgress] = useState(0);

    // Refs for sections
    const herobannerRef = useRef<HTMLElement | null>(null);
    const pagecontentRef = useRef<HTMLElement | null>(null);


    // ====================================
    // METHOD 1: Intersection Observer API (Recommended)
    // ====================================
    useEffect(() => {
        const observerOptions = {
            root: null, // viewport
            rootMargin: '-50% 0px -50% 0px', // trigger when section is in center
            // rootMargin: '0px 0px 100px 0px',
            threshold: 0 // 0 = any pixel visible, 1 = entire element visible
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry: IntersectionObserverEntry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                    setVisibleSections(prev => new Set(prev).add(entry.target.id));
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all sections
        const sections = [herobannerRef, pagecontentRef];
        sections.forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        // Cleanup
        return () => {
            sections.forEach(ref => {
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            });
        };
    }, []);

    // ====================================
    // METHOD 2: Scroll Event Listener
    // ====================================
    useEffect(() => {
        const handleScroll = () => {
            // Calculate scroll progress
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
            setScrollProgress(progress);

            // Check if specific section is in view
            const sections = [
                { ref: herobannerRef, id: 'herobanner' },
                { ref: pagecontentRef, id: 'pagecontent' },
            ];

            sections.forEach(({ ref, id }) => {
                if (ref.current) {
                    const rect = ref.current.getBoundingClientRect();
                    const isInView = rect.top < windowHeight / 2 && rect.bottom > windowHeight / 2;

                    // if (isInView) {
                    //     console.log(`User reached: ${id}`);
                    // }
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ====================================
    // METHOD 3: Check if element is visible
    // ====================================
    const checkIfSectionVisible = (ref: RefObject<HTMLElement>) => {
        if (!ref.current) return false;

        const rect = ref.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        return (
            rect.top < windowHeight &&
            rect.bottom > 0
        );
    };

    return (
        <>
            <Navbar activeSection={activeSection} lang={lang} />
            <section ref={herobannerRef} id="herobanner">
                <PageHero image={data.image} title={data.hero_headline} subtitle="" />
            </section>

            <section ref={pagecontentRef} id="pagecontent">
                <MediaBlock isArabic={isArabic} title={data.section1_title}
                    desc={data.section1_desc}
                    cta=""
                    cta2_label=""
                    cta2_link=""
                    image={data.section1_image} />
                <VisionCard title={data.section2_title} description={data.section2_desc}
                    image={data.section2_image} lang={lang} isArabic={isArabic} />
                <CareersSection
                    subheading={data.section3_subheading}
                    heading={data.section3_heading}
                    desc={data.section3_desc}
                    openpositions={careers}
                    lang={lang} isArabic={isArabic}
                />
                <WhyJoinUsSection lang={lang} heading={data.section4_heading} subheading={data.section4_subheading}
                    titles={data.why_join_us} />
            </section>
        </>
    );
}