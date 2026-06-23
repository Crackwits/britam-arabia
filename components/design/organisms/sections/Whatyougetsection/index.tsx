'use client';

import { useEffect, useRef, useState } from 'react';
import { WhatYouGetItem } from '@/components/lib/types';


interface WhatYouGetSectionProps {
    section2_title: string;
    intro_what_you_get: WhatYouGetItem[];
    titleclass: string;
}

function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
            { threshold },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);
    return { ref, visible };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WhatYouGetSection({
    section2_title,
    intro_what_you_get,
    titleclass,
}: WhatYouGetSectionProps) {
    const { ref: headingRef, visible: headingVisible } = useInView(0.2);
    const { ref: gridRef, visible: gridVisible } = useInView(0.1);

    return (
        <section  className="w-full bg-white px-4 py-20 md:py-30 overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* ── Heading ─────────────────────────────────────────────────── */}
                <div ref={headingRef}>
                    <h2
                        className={[
                            'text-navy900 uppercase font-medium tracking-[-1.92px] pb-4 text-4xl sm:text-5xl lg:text-6xl max-w-[740px] text-center mx-auto w-full mb-16',
                            'transition-all duration-700 ease-out',
                            headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
                        ].join(' ')}
                    >
                        {section2_title}
                    </h2>
                </div>

                {/* ── Grid ────────────────────────────────────────────────────── */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
                >
                    {intro_what_you_get.map((item, index) => (
                        <div
                            key={item.id}
                            className={[
                                'flex flex-col transition-all ease-out',
                                'duration-500',
                                gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                            ].join(' ')}
                            style={{
                                transitionDelay: gridVisible ? `${index * 80}ms` : '0ms',
                            }}
                        >
                            {/* Number */}
                            <span className="text-primaryDefault text-sm tracking-[4.2px] uppercase font-bold">
                                {String(index + 1).padStart(2, '0')}
                            </span>

                            {/* Title */}
                            <h3 className={`text-2xl font-medium tracking-[-0.48px] text-richNavy mb-2 ${titleclass}`}>
                                {item.title}
                            </h3>

                            {/* Description */}
                            <p className="text-base text-darkLight mb-8">
                                {item.description}
                            </p>

                            {/* Red underline */}
                            <span className="w-12 h-[1px] bg-[#ED0000] block" aria-hidden="true" />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}