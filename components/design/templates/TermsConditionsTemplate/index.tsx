
'use client';
import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import Navbar from "../../organisms/layout/Navbar";
import { TermsAndConditionsAttributes } from '@/components/lib/types';
import PolicySection from '../../organisms/sections/PolicySection';



interface TermsConditionsTemplateProps {
    data: TermsAndConditionsAttributes;
    lang: string;
}


export default function TermsConditionsTemplate({ data, lang }: TermsConditionsTemplateProps) {
    const isArabic = lang === 'ar';
    const locale: "ar" | "en" = lang === "ar" ? "ar" : "en";
    const [activeSection, setActiveSection] = useState('');
    const [visibleSections, setVisibleSections] = useState(new Set());
    const [scrollProgress, setScrollProgress] = useState(0);

    // Refs for sections
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
        const sections = [pagecontentRef];
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
            <section ref={pagecontentRef} id="pagecontent" className='pt-21'>
                <PolicySection data={data} lang={lang} />
            </section>
        </>
    );
}