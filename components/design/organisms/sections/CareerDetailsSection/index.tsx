"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { MapPin } from "lucide-react";
import { CareersAttributes } from "@/components/lib/types";
import type { FormType } from "../../Forms/Formoptions";
import ManagementForm from "../../Forms/ManagementForm";
import FirefighterForm from "../../Forms/FirefighterForm";

interface CareerDetailsSectionProps {
    career: CareersAttributes;
    lang: "en" | "ar";
    isArabic: boolean;
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const headerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut", delay: i * 0.1 },
    }),
};

const formVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CareerDetailsSection({
    career,
    lang,
    isArabic,
}: CareerDetailsSectionProps) {
    // form_type and city both come from the CMS entry. Management is the fallback.
    const formType: FormType = career.slug === "firefighters-career" ? "firefighters" : "management";

    const formProps = {
        lang,
        isArabic,
        position: career.position,
        slug: career.slug,
        city: career.location,
    };

    return (
        <div
            dir={isArabic ? "rtl" : "ltr"}
            className={`w-full bg-white ${isArabic ? "rtl text-right" : "ltr text-left"}`}
        >
            <div className="max-w-7xl mx-auto px-4 pt-15">
                {/* ── Section 1: Job Details ── */}
                <motion.div variants={headerVariants} initial="hidden" animate="visible">
                    <h1 className="text-3xl md:text-5xl font-bold text-[#10224A] leading-tight">
                        {career.position}
                    </h1>

                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-3 flex-row">
                        <MapPin size={16} className="flex-shrink-0 text-gray-400" />
                        <span>
                            {career.location} / {career.employment_type}
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    custom={1}
                    variants={contentVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px 0px" }}
                    className="project-content pt-6 max-w-5xl w-full"
                    dangerouslySetInnerHTML={{ __html: career.content }}
                />
            </div>

            <div className="max-w-5xl mx-auto px-4 pt-8">
                {/* ── Section 2: Apply Form ── */}
                <motion.div
                    variants={formVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px 0px" }}
                >
                    {formType === "firefighters" ? (
                        <FirefighterForm {...formProps} />
                    ) : (
                        <ManagementForm {...formProps} />
                    )}
                </motion.div>
            </div>
        </div>
    );
}