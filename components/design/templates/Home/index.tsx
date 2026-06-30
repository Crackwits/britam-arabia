
'use client';
import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import HeroBanner from "../../organisms/heros/Herobanner";
import PartnershipBanner from "../../organisms/heros/Partnershipbanner";
import { Capabilities, HomePageAttributes } from "@/components/lib/types";
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
    capabilities: Capabilities[];
    globalSettings: GlobalSettingAttributes | null;
    lang: string;
}


export default function HomeTemplate({ homedata, capabilities, globalSettings, lang }: HomePageTemplateProps) {
    const isArabic = lang === 'ar';
    const locale: "ar" | "en" = lang === "ar" ? "ar" : "en";
    const [activeSection, setActiveSection] = useState('');
    const [visibleSections, setVisibleSections] = useState(new Set());
    const [scrollProgress, setScrollProgress] = useState(0);

    // Refs for sections
    const herobannerRef = useRef<HTMLElement | null>(null);
    const partnershipRef = useRef<HTMLElement | null>(null);
    const resiliencesystemRef = useRef<HTMLElement | null>(null);


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
        const sections = [herobannerRef, partnershipRef, resiliencesystemRef];
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
                { ref: partnershipRef, id: 'partnership' },
                { ref: resiliencesystemRef, id: 'resiliencesystem' },

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
                <HeroBanner homedata={homedata} />
            </section>
            <section ref={partnershipRef} id="partnership">
                <PartnershipBanner homedata={homedata} />

            </section>
            <section ref={resiliencesystemRef} id="resiliencesystem">
                <MediaBlock lang={lang} isArabic={isArabic} title={homedata.section1_title}
                    desc={homedata.section1_desc}
                    cta={homedata.section1_cta}
                    cta_link="our-journey"
                    cta2_label=""
                    cta2_link=""
                    image={homedata.section1_image} />
            </section>


            <WhatYouGetSection section2_title={homedata.section2_title} intro_what_you_get={homedata.intro_what_you_get} titleclass="" />
            <WhyChooseUsSection section3_title={homedata.section3_title} intro_why_choose_us={homedata.intro_why_choose_us} />
            <MediaBlock lang={lang} isArabic={isArabic} title={homedata.section4_title}
                desc={homedata.section4_desc}
                cta={homedata.section4_cta}
                cta_link="contact-us"
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
            <ServicesEntry lang={lang} isArabic={isArabic} services_entry_heading={homedata.services_entry_heading}
                services_entry_subheading=""
                services_entry_items={capabilities} />

            <TestimonialsSection isArabic={isArabic}
                testimonials_title={homedata.testimonials_title}
                testimonials={homedata.testimonials} />
            <HpContactSection locale={locale} globalSettings={globalSettings} heading={homedata.inquiry_cta_heading} body={homedata.inquiry_cta_body} />
        </>
    );
}