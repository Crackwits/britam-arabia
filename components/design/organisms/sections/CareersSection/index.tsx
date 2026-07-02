"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { CareersAttributes } from "@/components/lib/types";
import HeadingTriangle from "@/public/svg/headingtriangle";
// ─── Types ────────────────────────────────────────────────────────────────────



interface CareersSectionProps {
    subheading: string;
    heading: string;
    desc: string;
    openpositions: CareersAttributes[];
    lang: string;
    isArabic: boolean;
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const headerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

const rowVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut", delay: i * 0.1 },
    }),
};


interface CareerRowProps {
    career: CareersAttributes;
    index: number;
    isArabic: boolean;
    lang: string;
}

function CareerRow({ career, index, isArabic, lang }: CareerRowProps) {
    return (
        <motion.div
            custom={index}
            variants={rowVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px 0px" }}
        >
            <Link
                href={`/${lang}/careers/${career.slug}`}
                className="group block py-8 border-b border-neutralLighter transition-all duration-200 hover:bg-f7f7f7"
                aria-label={`${career.position} — ${career.location}, ${career.employment_type}`}
            >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-center">
                    {/* ── Left column: Open Position + location ── */}
                    <div
                        className="md:col-span-3"
                    >
                        <p className="text-lg text-darkLight pb-3 md:pb-10">
                            {isArabic ? "وظيفة شاغرة" : "Open Position"}
                        </p>
                        <div
                            className="flex items-center gap-1.5 text-lg text-darkLight pb-7 md:pb-0 flex-row"
                        >
                            <MapPin size={14} className="flex-shrink-0 text-lg text-darkLight" />
                            <span>
                                {career.location} / {career.employment_type}
                            </span>
                        </div>
                    </div>

                    {/* ── Middle column: title + brief ── */}
                    <div
                        className="md:col-span-6 "
                    >
                        <h3 className="font-medium text-navy900 text-2xl mb-3 tracking-[-0.48px] transition-colors duration-200 group-hover:text-primaryDefault">
                            {career.position}
                        </h3>
                        <p className="text-lg text-darkLight">
                            {career.brief}
                        </p>
                    </div>

                    {/* ── Right column: CTA ── */}
                    <div
                        className="md:col-span-3 flex justify-end md:justify-end"
                    >
                        <span
                            className={`
                inline-flex items-center gap-2
                text-sm font-medium uppercase tracking-[0.84px]
                text-darkDefault
                transition-colors duration-200
                group-hover:text-primaryDefault
              `}
                        >
                            {isArabic ? (
                                <>
                                    قدم الآن
                                    <ArrowLeft
                                        size={14}
                                        className="transition-transform duration-300 group-hover:-translate-x-1"
                                    />
                                </>
                            ) : (
                                <>
                                    Apply Now
                                    <ArrowRight
                                        size={14}
                                        className="transition-transform duration-300 group-hover:translate-x-1"
                                    />
                                </>
                            )}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CareersSection({
    subheading,
    heading,
    desc,
    openpositions,
    lang = "en",
}: CareersSectionProps) {
    const isArabic = lang === "ar";

    return (
        <section
            dir={isArabic ? "rtl" : "ltr"}
            className="w-full bg-white py-16 md:py-24"
            aria-labelledby="careers-heading"
        >
            <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12">
                {/* ── Header ── */}
                <motion.div
                    variants={headerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px 0px" }}
                    className={isArabic ? "text-right" : "text-left"}
                >
                    <div
                        className="inline-flex gap-2 mb-4"
                        aria-hidden="false"
                    >
                        <HeadingTriangle />
                        <span className="text-primaryDefault text-xl md:text-lg font-medium uppercase">
                            {subheading}
                        </span>
                    </div>
                    <p
                        id="join-our-team"
                        className="text-navy900 uppercase font-medium tracking-[-1.92px] text-4xl sm:text-5xl lg:text-6xl max-w-6xl w-full pb-2"
                    >
                        {isArabic ? "انضم إلى فريقنا." : "Join Our Team."}
                    </p>
                    <h2
                        id="careers-heading"
                        className="text-navy900 uppercase font-medium tracking-[-1.92px] text-4xl sm:text-5xl lg:text-6xl max-w-6xl w-full pb-2"
                    >
                        {heading}
                    </h2>

                    <p className="tracking-[-0.48px] text-darkLight text-lg  md:text-2xl max-w-5xl w-full">
                        {desc}</p>
                </motion.div>

                {/* ── Open Positions List ── */}
                <div className="mt-6">
                    {openpositions.map((career, index) => (
                        <CareerRow
                            key={career.id}
                            career={career}
                            index={index}
                            isArabic={isArabic}
                            lang={lang}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}