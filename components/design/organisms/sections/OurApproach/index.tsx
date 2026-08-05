'use client';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { WhatYouGetItem } from '@/components/lib/types';
import HeadingTriangle from '@/public/svg/headingtriangle';
import { STRAPI_URL } from '@/components/lib/settings';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OurApproachProps {
    isArabic: boolean;
    subheading: string;
    heading: string;
    desc: string;
    steps: WhatYouGetItem[] | [];
}

// ─── Variants ─────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
};

const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

const scaleX: Variants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
        scaleX: 1,
        opacity: 1,
        transition: { duration: 0.7, ease: 'easeOut' },
    },
};

const popIn: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.5, ease: 'backOut' },
    },
};

// Parent that staggers its direct children
function stagger(staggerChildren: number, delayChildren = 0): Variants {
    return {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren, delayChildren },
        },
    };
}

// Shared viewport config — re-animates every time section enters view
const vp = { once: false, margin: '0px 0px -100px 0px', amount: 0.2 } as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function OurApproach({ isArabic, subheading, heading, desc, steps }: OurApproachProps) {
    const getMediaUrl = (url?: string) => (url ? `${STRAPI_URL}${url}` : '');

    return (
        <section
            aria-labelledby="our-approach-heading"
            className="w-full bg-white px-4 py-15 md:py-20 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto">

                {/* ── Header ────────────────────────────────────────────────── */}
                <motion.header
                    className="text-center mb-16 md:mb-17"
                    variants={stagger(0.18, 0.1)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={vp}
                >
                    {/* Eyebrow */}
                    <motion.div
                        className="inline-flex items-center gap-2 mb-4"
                        variants={fadeUp}
                    >
                        <HeadingTriangle />
                        <span className="text-primaryDefault text-xl md:text-lg font-medium uppercase">
                            {subheading}
                        </span>
                    </motion.div>

                    {/* Heading */}
                    <motion.h2
                        id="our-approach-heading"
                        className="text-navy900 font-medium tracking-[-1.92px] text-4xl sm:text-4xl lg:text-5xl text-center mx-auto max-w-[750px] w-full pb-2"
                        variants={fadeUp}
                    >
                        {heading}
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        className="tracking-[-0.48px] text-darkLight text-base md:text-lg font-normal max-w-[1050px] w-full mx-auto"
                        variants={fadeUp}
                    >
                        {desc}
                    </motion.p>
                </motion.header>

                {/* ── Steps grid ────────────────────────────────────────────── */}
                {steps.length > 0 && (
                    <motion.div
                        role="list"
                        aria-label="Approach steps"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0"
                        variants={stagger(0.25, 0.1)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={vp}
                    >
                        {steps.map((step, index) => {
                            const stepNum = (index + 1).toString().padStart(2, '0');

                            return (
                                // Each card is a stagger parent for its own children
                                <motion.article
                                    key={step.id}
                                    role="listitem"
                                    aria-label={`Step ${stepNum}: ${step.title}`}
                                    className="group flex flex-col items-center text-center px-4 md:px-6"
                                    variants={stagger(0.15, 0.05)}
                                >
                                    {/* ── Divider row ── */}
                                    <motion.div
                                        className="flex items-center gap-3 w-full pb-6"
                                        aria-hidden="true"
                                        variants={fadeIn}
                                    >
                                        <motion.div
                                            className="flex-1 h-[2px] bg-[#EAEAEA]"
                                            variants={scaleX}
                                            style={{ transformOrigin: 'left' }}
                                        />
                                        <motion.div className="flex items-center gap-2 shrink-0" variants={fadeIn}>
                                            <motion.span
                                                className="w-[8px] h-[8px] rounded-full bg-[#0034A5]"
                                                variants={popIn}
                                            />
                                            <motion.span
                                                className="text-primaryDefault text-sm font-bold uppercase tracking-[4px]"
                                                variants={fadeUp}
                                            >
                                                {isArabic ? `خطوة ${stepNum}` : `STEP ${stepNum}`}
                                            </motion.span>
                                        </motion.div>
                                        <motion.div
                                            className="flex-1 h-[2px] bg-[#EAEAEA]"
                                            variants={scaleX}
                                            style={{ transformOrigin: 'right' }}
                                        />
                                    </motion.div>

                                    {/* ── Icon ── */}
                                    {step.icon?.url && (
                                        <motion.div
                                            className="mb-5"
                                            variants={{
                                                hidden: { opacity: 0, scale: 0.7, y: 16 },
                                                visible: {
                                                    opacity: 1,
                                                    scale: 1,
                                                    y: 0,
                                                    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                                                },
                                            }}
                                        >
                                            <Image
                                                src={getMediaUrl(step.icon?.url)}
                                                alt={step.icon?.alternativeText || step.title}
                                                width={42}
                                                height={38}
                                            />
                                        </motion.div>
                                    )}

                                    {/* ── Title ── */}
                                    <motion.h3
                                        className="tracking-[-0.48px] text-richNavy pb-2 text-2xl font-medium"
                                        variants={fadeUp}
                                    >
                                        {step.title}
                                    </motion.h3>

                                    {/* ── Description ── */}
                                    <motion.p
                                        className="text-darkLight text-base mb-8 w-full max-w-[400px] mx-auto"
                                        variants={fadeUp}
                                    >
                                        {step.description}
                                    </motion.p>

                                    {/* ── Bottom accent line ── */}
                                    <motion.div
                                        className="mb-6 w-12 h-[2px] bg-[#ED0000] mx-auto group-hover:w-14 transition-[width] duration-300"
                                        aria-hidden="true"
                                        variants={scaleX}
                                        style={{ transformOrigin: 'center' }}
                                    />
                                </motion.article>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </section>
    );
}