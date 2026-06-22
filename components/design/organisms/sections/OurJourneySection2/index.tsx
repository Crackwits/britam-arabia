'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { STRAPI_URL } from '@/components/lib/settings';
import { CoverType } from '@/components/lib/types';
// ─── Types ────────────────────────────────────────────────────────────────────

interface OurJourneySection2Props {
    isArabic: boolean;
    title: string;
    desc: string;
    image: CoverType | null;
}

const getMediaUrl = (url?: string) =>
    url ? `${STRAPI_URL}${url}` : '';

// ─── Component ────────────────────────────────────────────────────────────────

export default function OurJourneySection2({
    isArabic,
    title,
    desc,
    image,
}: OurJourneySection2Props) {
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
            { threshold: 0.15 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const imageUrl = getMediaUrl(image?.url);
    return (
        <section
            ref={ref}
            className="w-full bg-white px-4 py-20 md:py-30 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto">

                {/* ── Left: Text ────────────────────────────────────────────────── */}
                <div
                    className={[
                        'transition-all duration-700 ease-out',
                        visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8',
                    ].join(' ')}
                >
                    <h2 className="text-navy900 uppercase font-medium tracking-[-1.92px] pb-4 text-4xl sm:text-5xl lg:text-6xl max-w-6xl w-full">
                        {title}
                    </h2>

                    {/* CKEditor HTML — scoped prose styles via inline class */}
                    <div
                        className="ck-prose text-darkLight text-base sm:text-lg space-y-4 mb-16"
                        dangerouslySetInnerHTML={{ __html: desc }}
                    />
                </div>

                {/* ── Right: Image with diagonal cut ────────────────────────────── */}
                <div
                    className={[
                        'relative transition-all duration-700 ease-out delay-150',
                        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8',
                    ].join(' ')}
                >
                    {imageUrl && (
                        <div
                            className="relative w-full overflow-hidden corner-clip aspect-[1/1] md:aspect-[4/2]"
                            style={{
                                clipPath: 'polygon(80px 0, 100% 0, 100% 100%, 0 100%, 0 80px)',
                            }}
                        >
                            <Image
                                src={imageUrl}
                                alt={image?.alternativeText ?? title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}