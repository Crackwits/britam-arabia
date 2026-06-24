'use client';

import { useEffect, useRef } from 'react';
import { WhatYouGetItem } from '@/components/lib/types';
import HeadingTriangle from '@/public/svg/headingtriangle';
// ─── Types ────────────────────────────────────────────────────────────────────

interface OurApproachProps {
    isArabic: boolean;
    subheading: string;
    heading: string;
    desc: string;
    steps: WhatYouGetItem[] | [];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OurApproach({ isArabic, subheading, heading, desc, steps }: OurApproachProps) {
    // const steps = steps ?? [];
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<(HTMLElement | null)[]>([]);

    // ── Intersection Observer for entrance animations ──────────────────────
    useEffect(() => {
        const elements: Element[] = [
            headerRef.current,
            ...cardsRef.current,
        ].filter(Boolean) as Element[];

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        (entry.target as HTMLElement).style.opacity = '1';
                        (entry.target as HTMLElement).style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [steps]);

    return (
        <section
            ref={sectionRef}
            aria-labelledby="our-approach-heading"
            className="w-full bg-white px-4 py-15 md:py-25 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto">

                {/* ── Header block ──────────────────────────────────────────── */}
                <header
                    ref={headerRef}
                    className="text-center mb-16 md:mb-17"
                    style={{
                        opacity: 0,
                        transform: 'translateY(28px)',
                        transition: 'opacity 0.65s ease, transform 0.65s ease',
                    }}
                >
                    {/* Eyebrow */}
                    <div
                        className="inline-flex items-center gap-2 mb-4"
                        aria-hidden="false"
                    >
                        <HeadingTriangle />
                        <span className="text-primaryDefault text-xl md:text-lg font-medium uppercase">
                            {subheading}
                        </span>
                    </div>

                    {/* Main heading */}
                    <h2
                        id="our-approach-heading"
                        className="text-navy900 uppercase font-medium tracking-[-1.92px] text-4xl sm:text-5xl lg:text-6xl text-center mx-auto max-w-5xl w-full pb-2"
                    >
                        {heading}
                    </h2>

                    {/* Description */}
                    <p className="tracking-[-0.48px] text-darkLight text-lg  md:text-2xl font-medium max-w-5xl w-full mx-auto">
                        {desc}
                    </p>
                </header>

                {/* ── Steps grid ────────────────────────────────────────────── */}
                {steps.length > 0 && (
                    <div
                        role="list"
                        aria-label="Approach steps"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0"
                    >
                        {steps.map((step, index) => {
                            const stepNum = (index + 1).toString().padStart(2, '0');
                            const isLast = index === steps.length - 1;

                            return (
                                <article
                                    key={step.id}
                                    ref={(el) => { cardsRef.current[index] = el; }}
                                    role="listitem"
                                    aria-label={`Step ${stepNum}: ${step.title}`}
                                    className={[
                                        'group flex flex-col items-center text-center px-4 md:px-6',
                                        'transition-all duration-300 cursor-pointer',
                                    ].join(' ')}
                                    style={{
                                        opacity: 0,
                                        transform: 'translateY(32px)',
                                        transition: `opacity 0.6s ease ${0.15 + index * 0.12}s, transform 0.6s ease ${0.15 + index * 0.12}s`,
                                    }}
                                >
                                    <div className="flex items-center gap-3 w-full pb-6" aria-hidden="true">
                                        <div className="flex-1 h-[2px] bg-[#EAEAEA]" />
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="w-[6px] h-[6px] rounded-full bg-[#0034A5]" />
                                            <span className="text-primaryDefault text-sm font-bold uppercase tracking-[4px]">
                                               
                                                {isArabic ? `خطوة${stepNum}` : `STEP${stepNum}`}
                                            </span>
                                        </div>
                                        <div className="flex-1 h-[2px] bg-[#EAEAEA]" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="tracking-[-0.48px] text-richNavy pb-2 text-2xl font-medium">
                                        {step.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-darkLight text-base mb-8 w-full max-w-[400px] mx-auto">
                                        {step.description}
                                    </p>

                                    {/* Bottom red accent line */}
                                    <div
                                        className="mb-6 w-12 h-[1px] bg-[#ED0000] mx-auto group-hover:w-14 transition-all duration-300"
                                        aria-hidden="true"
                                    />
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}