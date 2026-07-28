"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IconText } from "@/components/lib/types";
import { STRAPI_URL } from "@/components/lib/settings";
import HeadingTriangle from "@/public/svg/headingtriangle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImpactSectionProps {
    subheading: string;
    heading: string;
    measurable_impacts: IconText[];
    isArabic: boolean;
}

// ─── Impact Card ──────────────────────────────────────────────────────────────

interface ImpactCardProps {
    item: IconText;
    isArabic: boolean;
    index: number;
}

function ImpactCard({ item, isArabic, index }: ImpactCardProps) {
    const ref = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const iconUrl = item.icon?.url
        ? item.icon.url.startsWith("http")
            ? item.icon.url
            : `${STRAPI_URL}${item.icon.url}`
        : null;

    return (
        <article
            ref={ref}
            className={`
        flex-shrink-0
        w-full
        min-h-[200px]
        bg-white
        border border-neutralLighter
        p-7
        flex flex-col gap-3
        select-none
        transition-all duration-700 ease-out
        hover:shadow-md
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
      `}
            style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
            aria-label={item.title}
        >
            {/* Icon */}
            <div className="w-11 h-10 relative flex-shrink-0">
                {iconUrl && (
                    <Image
                        src={iconUrl}
                        alt={item.icon?.alternativeText || item.title}
                        fill
                        className="object-contain"
                        sizes="44px"
                        draggable={false}
                    />
                )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-medium tracking-[-0.48px] text-richNavy pt-4">
                {item.title}
            </h3>

            {/* Description */}
            <p className="text-base text-darkLight">
                {item.description}
            </p>
        </article>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ImpactSection({
    subheading,
    heading,
    measurable_impacts,
    isArabic
}: ImpactSectionProps) {
    return (
        <section
            dir={isArabic ? "rtl" : "ltr"}
            className="w-full px-4 py-16 md:py-25 overflow-hidden"
            aria-labelledby="impact-heading"
        >
            <div className="max-w-7xl mx-auto">
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
                    id="impact-heading"
                    className="text-navy900 font-medium tracking-[-1.92px] text-4xl sm:text-4xl lg:text-5xl max-w-5xl w-full pb-16"
                >
                    {heading}
                </h2>
            </div>

            {/* ── Grid of Cards ── */}
            <div
                className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                role="region"
                aria-label={isArabic ? "التأثيرات القابلة للقياس" : "Measurable impacts"}
            >
                {measurable_impacts.map((item, index) => (
                    <ImpactCard
                        key={item.id}
                        item={item}
                        isArabic={isArabic}
                        index={index}
                    />
                ))}
            </div>
        </section>
    );
}