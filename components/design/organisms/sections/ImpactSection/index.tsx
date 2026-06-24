"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
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
}

function ImpactCard({ item, isArabic }: ImpactCardProps) {
    const iconUrl = item.icon?.url
        ? item.icon.url.startsWith("http")
            ? item.icon.url
            : `${STRAPI_URL}${item.icon.url}`
        : null;

    return (
        <article
            className="
        embla__slide
        flex-shrink-0
        w-full sm:w-[360px]
        min-h-[200px]
        bg-white
        border border-neutralLighter
        p-7
        flex flex-col gap-3
        select-none
        transition-shadow duration-300
        hover:shadow-md
      "
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
            <h3
                className="text-xl font-medium tracking-[-0.48px] text-richNavy pt-4"
            >
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
    const [emblaRef] = useEmblaCarousel({
        align: "start",
        dragFree: true,
        direction: isArabic ? "rtl" : "ltr",
        containScroll: "trimSnaps",
    });

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
                    className="text-navy900 uppercase font-medium tracking-[-1.92px] text-4xl sm:text-5xl lg:text-6xl max-w-5xl w-full pb-16"
                >
                    {heading}
                </h2>
            </div>

            {/* ── Draggable Carousel ── */}
            <div
                ref={emblaRef}
                className="overflow-hidden cursor-grab active:cursor-grabbing max-w-7xl mx-auto"
                role="region"
                aria-label={isArabic ? "عرض التأثيرات" : "Impact cards carousel"}
            >
                <div
                    className={`embla__container flex flex-col sm:flex-row gap-4 ${isArabic ? "sm:flex-row-reverse" : ""}`}
                >
                    {measurable_impacts.map((item) => (
                        <ImpactCard
                            key={item.id}
                            item={item}
                            isArabic={isArabic}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}