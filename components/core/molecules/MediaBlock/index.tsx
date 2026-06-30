'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { STRAPI_URL } from '@/components/lib/settings';
import { CoverType } from '@/components/lib/types';
// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaBlockProps {
    lang: string;
    isArabic: boolean;
    title: string;
    desc: string;       // CKEditor 5 HTML
    cta: string;
    cta_link: string;
    cta2_label: string;
    cta2_link: string;
    image: CoverType | null;
}

const getMediaUrl = (url?: string) =>
    url ? `${STRAPI_URL}${url}` : '';

// ─── Component ────────────────────────────────────────────────────────────────

export default function MediaBlock({
    lang,
    isArabic,
    title,
    desc,
    cta,
    cta_link,
    cta2_label,
    cta2_link,
    image,
}: MediaBlockProps) {
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
            className="w-full bg-white px-4 py-15 md:py-25 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                {/* ── Left: Text ────────────────────────────────────────────────── */}
                <div
                    className={[
                        'flex flex-col justify-center transition-all duration-700 ease-out',
                        visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8',
                    ].join(' ')}
                >
                    {title && (
                        <h2 className="text-navy900 capitalize font-medium tracking-[-1.92px] pb-4 text-4xl sm:text-5xl lg:text-6xl max-w-[485px] w-full">
                            {title}
                        </h2>
                    )}
                    {/* CKEditor HTML — scoped prose styles via inline class */}
                    <div
                        className="ck-prose text-darkLight text-base sm:text-lg space-y-4 mb-8"
                        dangerouslySetInnerHTML={{ __html: desc }}
                    />
                    <div className="flex flex-wrap items-center gap-6">
                        {/* Primary CTA */}
                        {cta && cta_link && (
                            <Link
                                href={`/${lang}/${cta_link}`}
                                className="inline-flex uppercase items-center gap-2 text-white bg-primaryDefault px-6 py-4 font-medium tracking-[0.84px] text-sm
    border-2 border-primaryDefault hover:bg-white hover:text-primaryDefault transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryDefault"
                            >
                                {cta}
                            </Link>
                        )}

                        {/* Secondary CTA — only renders if both label and url are provided */}
                        {cta2_label && cta2_link && (
                            <Link
                                href={cta2_link} target='_blank'
                                className="uppercase group inline-flex uppercase items-center gap-2 text-darkDefault font-medium tracking-[0.84px] text-sm transition-transform duration-200 focus:outline-none focus-visible:underline"
                            >
                                {cta2_label}

                                {/* Arrow flips direction based on RTL, slides on hover */}
                                <span
                                    className={[
                                        'transition-transform duration-300 ease-out',
                                        isArabic
                                            ? 'group-hover:-translate-x-1'   // RTL: nudge left
                                            : 'group-hover:translate-x-1',    // LTR: nudge right
                                    ].join(' ')}
                                    aria-hidden="true"
                                >
                                    {isArabic ? (
                                        // Left-pointing arrow for Arabic
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 12H5M12 19l-7-7 7-7" />
                                        </svg>
                                    ) : (
                                        // Right-pointing arrow for English
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </span>
                            </Link>
                        )}
                    </div>
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
                            className="relative w-full overflow-hidden"
                            style={{
                                aspectRatio: '1 / 1',
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