"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CoverType } from "@/components/lib/types";
import { STRAPI_URL } from "@/components/lib/settings";
import WhiteTriangle from "@/public/svg/whitetriangle";
import OrangeTriangle from "@/public/svg/orangetriangle";
import type { Variants } from "framer-motion";
// ─── Types ────────────────────────────────────────────────────────────────────

interface VisionCardProps {
    image: CoverType;
    title: string;
    description: string;
    lang: string;
    isArabic: boolean;
}

const getMediaUrl = (url?: string) =>
    url ? `${STRAPI_URL}${url}` : '';

// ─── Animation Variants ───────────────────────────────────────────────────────

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: "easeOut" },
    },
};

const textBoxVariants: Variants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.65, ease: "easeOut", delay: 0.2 },
    },
};

const floatVariants: Variants = {
    float: {
        opacity: 1,
        // y: [0, -6, 0],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function VisionCard({
    image,
    title,
    description,
    lang,
    isArabic
}: VisionCardProps) {
    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px 0px" }}
            className="relative w-full max-w-7xl mx-auto overflow-hidden">


            {/* ── Background Image ── */}
            <motion.div
                className="relative w-full h-full group"
                whileHover="hover"
            >

                <motion.div
                    className="absolute inset-0"
                    // variants={{ hover: { scale: 1.05 } }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <Image
                        src={getMediaUrl(image?.url)}
                        alt={image?.alternativeText ?? title}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                    />
                    {/* Dark overlay for text legibility */}
                    <div className="pointer-events-none absolute inset-0 bg-black/35" />
                    <div
                        aria-hidden="true"
                        className={`absolute top-0 z-10 h-20 w-20 ${isArabic ? "right-0 rotate-90" : "left-0"
                            }`}
                    >
                        <WhiteTriangle />

                    </div>
                    <div
                        aria-hidden="true"
                        className={`absolute top-0 z-10 h-20 w-20 ${isArabic ? "hidden" : "left-0"
                            }`}
                    >
                        <OrangeTriangle />
                    </div>
                </motion.div>


                <div className="flex h-full flex-col justify-center max-w-4xl w-full mx-auto px-5 py-35">
                    {/* ── Content Box (overlaid on desktop, stacked on mobile) ── */}
                    <motion.div
                        variants={textBoxVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        animate="float"
                        className="relative footer-clip bg-white max-w-[516px] w-full p-10">
                        <motion.div variants={floatVariants} animate="float">
                            <h2 className="text-darkDefault font-medium tracking-[-0.8px] text-3xl md:text-4xl pb-6">
                                {title}
                            </h2>
                            <p className="text-darkLight text-lg">
                                {description}
                            </p>
                        </motion.div>
                    </motion.div>
                </div>


            </motion.div>

            {/* ── Content Box (mobile — stacked below image) ── */}
            <motion.div
                variants={textBoxVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="
          flex md:hidden
          flex-col
          bg-white
          w-full
          p-8
          shadow-inner
        "
            >
                <h2 className="text-[#111827] font-bold text-2xl sm:text-3xl leading-tight mb-3">
                    {title}
                </h2>
                <p className="text-[#6b7280] text-sm sm:text-base leading-relaxed">
                    {description}
                </p>
            </motion.div>
        </motion.div>
    );
}