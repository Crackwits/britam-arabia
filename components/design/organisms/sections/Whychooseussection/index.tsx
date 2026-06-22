'use client';

import { useEffect, useRef, useState } from 'react';
import { WhatYouGetItem } from '@/components/lib/types';

interface WhyChooseUsSectionProps {
    section3_title: string;
    intro_why_choose_us: WhatYouGetItem[];
}

function useInView(threshold = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
            },
            { threshold },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);
    return { ref, visible };
}

function Card({
    item,
    index,
    visible,
}: {
    item: WhatYouGetItem;
    index: number;
    visible: boolean;
}) {
    return (
        <div
            className={[
                // h-full makes the card fill its grid row so all cards are equal height
                'bg-[#F5F8FF] p-6 h-full transition-all ease-out duration-500',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            ].join(' ')}
            style={{ transitionDelay: visible ? `${index * 90}ms` : '0ms' }}
        >
            <h3 className="text-xl font-medium tracking-[-0.48px] text-richNavy mb-2">
                {item.title}
            </h3>
            <p className="text-base text-darkLight">
                {item.description}
            </p>
        </div>
    );
}

export default function WhyChooseUsSection({ section3_title, intro_why_choose_us }: WhyChooseUsSectionProps) {
    const { ref: sectionRef, visible } = useInView(0.1);

    const colB = intro_why_choose_us.filter((_, i) => i % 2 === 0); // 0,2,4
    const colC = intro_why_choose_us.filter((_, i) => i % 2 === 1); // 1,3,5

    // Shared row count = longer of the two columns
    const rowCount = Math.max(colB.length, colC.length);

    return (
        <section className="w-full bg-white py-20 px-6">
            <div className="max-w-7xl mx-auto" ref={sectionRef}>

                {/* ── Mobile / Tablet ───────────────────────────────────── */}
                <div className="lg:hidden">
                    <h2
                        className={[
                            'text-navy900 uppercase font-medium tracking-[-1.92px] pb-4 text-4xl sm:text-5xl mb-10 transition-all duration-700 ease-out',
                            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
                        ].join(' ')}
                    >
                        {section3_title}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
                        {intro_why_choose_us.map((item, index) => (
                            <Card key={item.id} item={item} index={index} visible={visible} />
                        ))}
                    </div>
                </div>

                {/* ── Desktop: 3-column layout ──────────────────────────── */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_1fr] lg:gap-x-6 lg:items-start">

                    {/* Col A: title */}
                    <div
                        className={[
                            'pt-2 transition-all duration-700 ease-out',
                            visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8',
                        ].join(' ')}
                    >
                        <h2 className="text-navy900 uppercase font-medium tracking-[-1.92px] text-4xl sm:text-5xl lg:text-6xl leading-tight">
                            {section3_title}
                        </h2>
                    </div>

                    {/* Col B + Col C share a subgrid so rows are equal height */}
                    <div
                        className="col-span-2 grid grid-cols-2 gap-4"
                        style={{ gridTemplateRows: `repeat(${rowCount}, 1fr)` }}
                    >
                        {/*
                          Interleave cards into the 2-col subgrid so that
                          Col B (left) and Col C (right) share the same row tracks:

                          Row 1: [colB[0]]  [empty]
                          Row 2: [colB[1]]  [colC[0]]
                          Row 3: [colB[2]]  [colC[1]]
                          Row 4: [empty]    [colC[2]]

                          We achieve this by placing cards explicitly with gridRow.
                        */}
                        {colB.map((item, i) => (
                            <div
                                key={item.id}
                                className="col-start-1 h-full"
                                style={{ gridRow: i + 1 }}
                            >
                                <Card item={item} index={i * 2} visible={visible} />
                            </div>
                        ))}
                        {colC.map((item, i) => (
                            <div
                                key={item.id}
                                className="col-start-2 h-full"
                                style={{ gridRow: i + 2 }} // offset by 1 row for stagger
                            >
                                <Card item={item} index={i * 2 + 1} visible={visible} />
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}