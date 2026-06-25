"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { InsightsAttributes } from "@/components/lib/types";
import { STRAPI_URL } from "@/components/lib/settings";
import type { Variants } from "framer-motion";
// ─── Types ────────────────────────────────────────────────────────────────────

interface InsightsSectionProps {
    intro_title: string;
    intro_desc: string;
    insights: InsightsAttributes[];
    isArabic: boolean;
    lang: string;
}

// ─── Animation Variants ───────────────────────────────────────────────────────
// after

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 32 },
    visible: (delay: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            delay,
        },
    }),
};

// ─── Insight Card ─────────────────────────────────────────────────────────────

interface InsightCardProps {
    insight: InsightsAttributes;
    index: number;
    isArabic: boolean;
    lang: string;
}

function InsightCard({ insight, index, isArabic, lang }: InsightCardProps) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px 0px" });

    const thumbnailUrl = insight.thumbnail?.url
        ? insight.thumbnail.url.startsWith("http")
            ? insight.thumbnail.url
            : `${STRAPI_URL}${insight.thumbnail.url}`
        : null;

    const formattedDate = insight.date
        ? new Date(insight.date).toLocaleDateString("en-GB").replace(/\//g, "-")
        : "";

    return (
        <motion.div
            ref={ref}
            custom={index * 0.12}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
        >
            <Link
                href={`/${lang}/insights/${insight.slug}`}
                className="group flex flex-col h-full"
                aria-label={insight.title}
            >
                {/* Image */}
                <div className="relative w-full aspect-[1/1] overflow-hidden bg-gray-100">
                    {thumbnailUrl ? (
                        <Image
                            src={thumbnailUrl}
                            alt={insight.thumbnail?.alternativeText || insight.title}
                            fill
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            draggable={false}
                        />
                    ) : (
                        <div className="w-full h-full bg-lightLighter" />
                    )}
                </div>

                {/* Meta */}
                <div className="pt-4 flex flex-col gap-2 flex-1">
                    <p className="text-base text-darkLight">
                        {formattedDate}
                    </p>

                    <h3
                        className="text-richNavy font-medium text-2xl tracking-[-0.48px] pb-6"
                    >
                        {insight.title}
                    </h3>

                    <div
                        className="uppercase group inline-flex items-center gap-2 text-darkDefault font-medium tracking-[0.84px] text-sm transition-transform duration-200 focus:outline-none focus-visible:underline"
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
                    </div>
                    <span className="w-12 h-[1px] bg-[#ED0000] block" aria-hidden="true" />
                </div>
            </Link>
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InsightsSection({
    intro_title,
    intro_desc,
    insights,
    isArabic,
    lang,
}: InsightsSectionProps) {
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, margin: "-60px 0px" });

    return (
        <section
            dir={isArabic ? "rtl" : "ltr"}
            className="w-full bg-white py-16 md:py-21"
            aria-labelledby="insights-heading"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                {/* ── Header ── */}
                <div ref={headerRef} className="w-full max-w-[1140px] mb-10 md:mb-20">
                    <motion.h2
                        id="insights-heading"
                        custom={0}
                        variants={fadeUp}
                        initial="hidden"
                        animate={headerInView ? "visible" : "hidden"}
                        className="text-navy900 capitalize font-medium tracking-[-1.92px] pb-4 text-4xl sm:text-5xl lg:text-6xl">
                        {intro_title}
                    </motion.h2>

                    <motion.p
                        custom={0.1}
                        variants={fadeUp}
                        initial="hidden"
                        animate={headerInView ? "visible" : "hidden"}
                        className="text-darkLight text-base sm:text-lg mb-8"
                    >
                        {intro_desc}
                    </motion.p>
                </div>

                {/* ── Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {insights.map((insight, i) => (
                        <InsightCard
                            key={insight.id}
                            insight={insight}
                            index={i}
                            isArabic={isArabic}
                            lang={lang}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}