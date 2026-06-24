"use client";

import { motion } from "framer-motion";
import { CriticalEnvironments } from "@/components/lib/types";
import EnvironmentCard from "../../cards/EnvironmentCard";

interface CriticalEnvironmentsSectionProps {
    lang: string;
    section3_title: string;
    section3_desc: string;
    critical_environments: CriticalEnvironments[];
}
export default function CriticalEnvironmentsSection({
    lang,
    section3_title,
    section3_desc,
    critical_environments,
}: CriticalEnvironmentsSectionProps) {
    return (
        <section aria-labelledby="critical-environments"
        className="w-full bg-white px-4 py-15 md:py-25 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">

                    {/* ── Left column: heading + description ── */}
                    <div className="flex flex-col justify-start lg:sticky lg:top-28 lg:self-start">
                        {/* Heading */}
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.08 }}
                            className="text-navy900 uppercase font-medium tracking-[-1.92px] pb-4 text-4xl sm:text-5xl lg:text-6xl max-w-6xl w-full"                            >
                            {section3_title}
                        </motion.h2>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.25 }}
                            className="text-darkLight text-base sm:text-lg lg:mb-0 mb-13">
                        
                            {section3_desc}
                        </motion.p>
                    </div>

                    {/* ── Right column: environment list ── */}
                    <div className="flex flex-col px-4">
                            {critical_environments.map((project, index) => (
                                <EnvironmentCard
                                    key={project.id}
                                    project={project}
                                    index={index}
                                    lang={lang}
                                />
                            ))}
                    </div>

                </div>
            </div>
        </section>
    );
}