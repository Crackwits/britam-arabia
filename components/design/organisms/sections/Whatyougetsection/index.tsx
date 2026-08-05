'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { WhatYouGetItem } from '@/components/lib/types';
import { STRAPI_URL } from '@/components/lib/settings';

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
            ([entry]) => {
                setVisible(entry.isIntersecting); // toggle on every enter/leave
            },
            { threshold },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);
    return { ref, visible };
}
// ─── Single animated item ───────────────────────────────────────────────────

function WhatYouGetCard({
    item,
    index,
    titleclass,
    getMediaUrl,
}: {
    item: WhatYouGetItem;
    index: number;
    titleclass: string;
    getMediaUrl: (url?: string) => string;
}) {
    const { ref, visible } = useInView(0.2);

    return (
        <div
            ref={ref}
            className={[
                'flex flex-col transition-all ease-out duration-700',
                visible
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-10 scale-95',
            ].join(' ')}
            style={{
                transitionDelay: visible ? `${index * 120}ms` : '0ms',
            }}
        >
            {item.icon?.url && (
                <Image
                    src={getMediaUrl(item.icon?.url)}
                    alt={item.icon?.alternativeText || item.title}
                    width="42"
                    height="38"
                    className="mb-5"
                />
            )}

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
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WhatYouGetSection({
    section2_title,
    intro_what_you_get,
    titleclass,
}: WhatYouGetSectionProps) {
    const { ref: headingRef, visible: headingVisible } = useInView(0.2);
    const getMediaUrl = (url?: string) => (url ? `${STRAPI_URL}${url}` : "");

    return (
        <section className="w-full bg-white px-4 py-15 md:py-20 overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* ── Heading ─────────────────────────────────────────────────── */}
                <div ref={headingRef}>
                    <h2
                        className={[
                            'text-navy900 font-medium tracking-[-1.92px] pb-4 text-4xl sm:text-4xl lg:text-5xl max-w-[740px] text-center mx-auto w-full mb-16',
                            'transition-all duration-700 ease-out',
                            headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
                        ].join(' ')}
                    >
                        {section2_title}
                    </h2>
                </div>

                {/* ── Grid ────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {intro_what_you_get.map((item, index) => (
                        <WhatYouGetCard
                            key={item.id}
                            item={item}
                            index={index % 3}
                            titleclass={titleclass}
                            getMediaUrl={getMediaUrl}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}