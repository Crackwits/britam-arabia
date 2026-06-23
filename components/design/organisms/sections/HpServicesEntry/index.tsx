"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Capabilities, MediaItem } from "@/components/lib/types";
import { STRAPI_URL } from "@/components/lib/settings";
import Link from "next/link";

interface Props {
    isArabic: boolean;
    services_entry_heading: string;
    services_entry_items: Capabilities[];
}

const getMediaUrl = (url?: string) =>
    url ? `${STRAPI_URL}${url}` : '';

interface CardProps {
    item: Capabilities;
    index: number;
    isArabic: boolean;
    visible: boolean;
}

function ServiceCard({ item, index, isArabic, visible }: CardProps) {
    const imageUrl = getMediaUrl(item.image?.url);
    const isEven = index % 2 === 0;

    return (
        <motion.article
            // whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className={[
                "group flex flex-col transition-all duration-700 ease-out",
                // stagger delay per card
                index === 0 ? "delay-[0ms]" :
                    index === 1 ? "delay-[150ms]" :
                        index === 2 ? "delay-[300ms]" : "delay-[450ms]",
                visible
                    ? "opacity-100 translate-x-0"
                    : isEven
                        ? "opacity-0 -translate-x-8"   // even cards slide from left
                        : "opacity-0 translate-x-8",   // odd cards slide from right
            ].join(" ")}
        >
            {/* ── Image ── */}
            <div
                className="relative w-full overflow-hidden"
                style={{
                    clipPath: 'polygon(80px 0, 100% 0, 100% 100%, 0 100%, 0 80px)',
                    aspectRatio: "9 / 8",
                }}
            >
                <img
                    src={imageUrl}
                    alt={item.image?.alternativeText ?? item.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* ── Text block ── */}
            <div className="mt-5 flex flex-col">
                <h3 className="text-2xl font-medium tracking-[-0.48px] text-richNavy mb-2">
                    {item.title}
                </h3>

                <p className="text-base text-darkLight mb-8">
                    {item.description}
                </p>

                <Link
                    href={`/capabilities/${item.slug}`}
                    target="_blank"
                    className="pb-2 uppercase group inline-flex items-center gap-2 text-darkDefault font-medium tracking-[0.84px] text-sm transition-transform duration-200 focus:outline-none focus-visible:underline"
                >
                    {isArabic ? "استكشف" : "Explore"}
                    <span
                        className={[
                            'transition-transform duration-300 ease-out',
                            isArabic
                                ? 'group-hover:-translate-x-1'
                                : 'group-hover:translate-x-1',
                        ].join(' ')}
                        aria-hidden="true"
                    >
                        {isArabic ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        )}
                    </span>
                </Link>
                <span className="w-12 h-[1px] bg-[#ED0000] block" aria-hidden="true" />
            </div>
        </motion.article>
    );
}

export default function ServicesEntry({
    isArabic,
    services_entry_heading,
    services_entry_items,
}: Props) {
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={ref}
            className="w-full bg-white px-4 py-20 md:py-30 overflow-hidden"
            aria-labelledby="services-entry-heading"
        >
            <div className="mx-auto max-w-7xl">
                {/* ── Heading ── */}
                <h2
                    id="services-entry-heading"
                    className={[
                        "text-navy900 uppercase font-medium tracking-[-1.92px] pb-8 text-4xl sm:text-5xl lg:text-6xl max-w-5xl w-full",
                        "transition-all duration-700 ease-out",
                        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
                    ].join(" ")}
                >
                    {services_entry_heading}
                </h2>

                {/* ── Grid ── */}
                <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2">
                    {services_entry_items.map((item, index) => (
                        <ServiceCard
                            key={item.id}
                            item={item}
                            index={index}
                            isArabic={isArabic}
                            visible={visible}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}