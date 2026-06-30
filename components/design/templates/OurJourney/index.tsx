'use client';

import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
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
            <section id='herobanner' ref={herobannerRef}>
                <PageHero image={ourJourneydata.image} title={ourJourneydata.hero_headline} subtitle="" />
            </section>
            <section id='pagecontent' ref={pagecontentRef}>
                <MediaBlock lang={lang} isArabic={isArabic} title={ourJourneydata.section1_title}
                    desc={ourJourneydata.section1_desc}
                    cta=""
                    cta_link=""
                    cta2_label=""
                    cta2_link=""
                    image={ourJourneydata.section1_image} />
                <OurJourneySection2 isArabic={isArabic} title={ourJourneydata.section2_title}
                    desc={ourJourneydata.section2_desc}
                    image={ourJourneydata.section2_image} />
                <CriticalEnvironmentsSection lang={lang} section3_title={ourJourneydata.section3_title}
                    section3_desc={ourJourneydata.section3_desc}
                    critical_environments={critical_environments} />
                <MediaBlock lang={lang} isArabic={isArabic} title=""
                    desc={ourJourneydata.section4_desc}
                    cta=""
                    cta_link=""
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
            </section>
        </>
    );
}