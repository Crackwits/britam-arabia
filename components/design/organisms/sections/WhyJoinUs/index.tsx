"use client";

import { motion } from "framer-motion";
import { TitleComponent } from "@/components/lib/types";
import HeadingTriangle from "@/public/svg/headingtriangle";

interface WhyJoinUsSectionProps {
    lang: string;
    heading: string;
    subheading: string;
    titles: TitleComponent[];
}
export const formatIndex = (n: number, pad = 2): string =>
    String(n + 1).padStart(pad, "0");
export default function WhyJoinUsSection({
    lang,
    heading,
    subheading,
    titles,
}: WhyJoinUsSectionProps) {
    return (
        <section aria-labelledby="critical-environments"
            className="w-full bg-white px-4 py-15 md:py-25 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">

                    {/* ── Left column: heading + description ── */}
                    <div className="flex flex-col justify-start lg:sticky lg:top-28 lg:self-start">
                        {/* Heading */}
                        <motion.div
                            className="inline-flex items-center gap-2 mb-4"
                            aria-hidden="false"
                        >
                            <HeadingTriangle />
                            <span className="text-primaryDefault text-xl md:text-lg font-medium uppercase">
                                {subheading}
                            </span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.08 }}
                            className="text-navy900 uppercase font-medium tracking-[-1.92px] pb-4 text-4xl sm:text-5xl lg:text-6xl max-w-6xl w-full"                            >
                            {heading}
                        </motion.h2>
                    </div>

                    {/* ── Right column: environment list ── */}
                    <div className="flex flex-col px-4">
                        {titles.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                            >
                                <div className="group flex items-center gap-4 border-b border-lightLighter py-5 transition-colors duration-200 hover:bg-f7f7f7 -mx-2">
                                    {/* Index */}
                                    <span className="w-8 shrink-0 text-sm tracking-[0.84px] font-medium text-primaryDefault tabular-nums transition-colors duration-200">
                                        {formatIndex(index)}
                                    </span>

                                    {/* Project name — shifts right on hover */}
                                    <span className="flex-1 text-base font-medium text-darkDefault tracking-[-0.48px] uppercase transition-all duration-200 group-hover:translate-x-1">
                                        {item.title}
                                    </span>
                                </div>



                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}