"use client";

import React, { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { useParams } from "next/navigation";
import { WhatYouGetItem } from "@/components/lib/types";
import HeadingTriangle from "@/public/svg/headingtriangle";


interface TestimonialsSectionProps {
    isArabic: boolean,
    testimonials_title: string;
    testimonials: WhatYouGetItem[];
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
};

const headingVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
            delay: i * 0.12,
        },
    }),
};

// ─── Testimonial Card ─────────────────────────────────────────────────────────

interface CardProps {
    item: WhatYouGetItem;
    index: number;
    isArabic: boolean;
}

function TestimonialCard({ item, index, isArabic }: CardProps) {
    return (
        <motion.article
            custom={index}
            variants={cardVariants}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            tabIndex={0}
            className={`
        group flex min-h-[260px] flex-col justify-between border border-f7f7f7 bg-fcfcff p-6
        shadow-sm transition-shadow duration-300`}
        >
            {/* ── Quote ── */}
            <p className="text-base text-darkLight">
                &ldquo;{item.description}&rdquo;
            </p>

            {/* ── Accent line + company name ── */}
            <div className={`mt-6 flex flex-col ${isArabic ? "items-end" : "items-start"}`}>
                <motion.span
                    aria-hidden="true"
                    initial={{ width: 32 }}
                    animate={{ width: 32 }}
                    whileHover={{ width: 48 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mb-3 block h-[2px] bg-[#ED0000]"
                />
                <span className="text-base text-darkLight">{item.title}</span>
            </div>
        </motion.article>
    );
}


// ─── Section ──────────────────────────────────────────────────────────────────

export default function TestimonialsSection({
    isArabic,
    testimonials_title,
    testimonials,
}: TestimonialsSectionProps) {
    const params = useParams();

    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px 0px" });

    const label = isArabic ? "آراء العملاء" : "TESTIMONIALS";

    return (
        <motion.section
            ref={ref}
            variants={sectionVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="w-full bg-white px-4 py-20 md:py-30 overflow-hidden"
            aria-labelledby="testimonials-heading"
        >
            <div className="mx-auto max-w-7xl">
                {/* ── Label + Heading ── */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <HeadingTriangle />
                        <span className="text-primaryDefault text-xl md:text-lg font-medium uppercase">
                            {label}
                        </span>
                    </div>
                    <motion.h2
                        id="testimonials-heading"
                        variants={headingVariants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        className="text-navy900 uppercase font-medium tracking-[-1.92px] text-4xl sm:text-5xl lg:text-6xl max-w-7xl w-full pb-2">
                        {testimonials_title}
                    </motion.h2>
                </div>

                {/* ── Grid ── */}
                <div
                    className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {testimonials.map((item, index) => (
                        <TestimonialCard
                            key={item.id}
                            item={item}
                            index={index}
                            isArabic={isArabic}
                        />
                    ))}
                </div>
            </div>
        </motion.section>
    );
}