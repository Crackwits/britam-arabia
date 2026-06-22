"use client";

import { motion } from "framer-motion";
import { CriticalEnvironments } from "@/components/lib/types";
import EnvironmentCard from "../../cards/EnvironmentCard";

interface CriticalEnvironmentsSectionProps {
    section3_title: string;
    section3_desc: string;
    critical_environments: CriticalEnvironments[];
}
export default function CriticalEnvironmentsSection({
    section3_title,
    section3_desc,
    critical_environments,
}: CriticalEnvironmentsSectionProps) {
    return (
        <section className="w-full bg-[#f5f5f5] py-20 md:py-28">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">

                    {/* ── Left column: heading + description ── */}
                    <div className="flex flex-col justify-start lg:sticky lg:top-28 lg:self-start">
                        {/* Red triangle label accent */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center gap-2 mb-5"
                        >
                            <span
                                className="inline-block"
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderTop: "5px solid transparent",
                                    borderBottom: "5px solid transparent",
                                    borderLeft: "8px solid #D0021B",
                                }}
                            />
                            <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#1B2A6B]">
                                Critical Environments
                            </span>
                        </motion.div>

                        {/* Heading */}
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.08 }}
                            className="text-3xl font-bold leading-snug tracking-tight text-gray-900 md:text-4xl xl:text-[2.6rem]"
                        >
                            {section3_title}
                        </motion.h2>

                        {/* Divider */}
                        <motion.div
                            initial={{ scaleX: 0, originX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="my-6 h-px w-12 bg-[#D0021B]"
                        />

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.25 }}
                            className="text-sm leading-relaxed text-gray-500 md:text-base max-w-md"
                        >
                            {section3_desc}
                        </motion.p>

                        {/* Total count badge */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-10 hidden lg:flex items-center gap-3"
                        >
                            <span className="text-5xl font-black text-gray-100 select-none">
                                {String(critical_environments.length).padStart(2, "0")}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                Environments
                            </span>
                        </motion.div>
                    </div>

                    {/* ── Right column: environment list ── */}
                    <div className="flex flex-col">
                        {/* Column headers */}
                        <div className="flex items-center gap-4 border-b-2 border-gray-900 pb-3 px-2 -mx-2">
                            <span className="w-8 shrink-0" />
                            <span className="flex-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                                Project
                            </span>
                            <span className="ml-auto text-xs font-bold uppercase tracking-widest text-gray-400">
                                Industry
                            </span>
                            {/* Spacer for arrow column */}
                            <span className="ml-3 w-4" />
                        </div>

                        {/* Rows */}
                        <div className="mt-1">
                            {critical_environments.map((project, index) => (
                                <EnvironmentCard
                                    key={project.id}
                                    project={project}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}