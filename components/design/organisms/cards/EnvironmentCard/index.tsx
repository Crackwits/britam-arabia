"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CriticalEnvironments } from "@/components/lib/types";
// import { formatIndex } from "@/lib/utils";

export const formatIndex = (n: number, pad = 2): string =>
    String(n + 1).padStart(pad, "0");

interface EnvironmentCardProps {
    project: CriticalEnvironments;
    index: number;
}

export default function EnvironmentCard({
    project,
    index,
}: EnvironmentCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
        >
            <Link
                href={`/critical-environments/${project.slug}`}
                className="group flex items-center gap-4 border-b border-gray-200 py-5 transition-colors duration-200 hover:bg-blue-50/60 px-2 -mx-2 rounded-sm"
            >
                {/* Index */}
                <span className="w-8 shrink-0 text-sm font-semibold text-gray-400 tabular-nums transition-colors duration-200 group-hover:text-[#1B2A6B]">
                    {formatIndex(index)}
                </span>

                {/* Project name — shifts right on hover */}
                <span className="flex-1 text-base font-semibold text-gray-900 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#1B2A6B]">
                    {project.name}
                </span>

                {/* Industry — right-aligned */}
                <span className="ml-auto shrink-0 text-xs font-semibold uppercase tracking-widest text-gray-400 transition-colors duration-200 group-hover:text-gray-600">
                    {project.industry}
                </span>

                {/* Arrow — appears on hover */}
                <svg
                    className="ml-3 h-4 w-4 shrink-0 translate-x-0 text-[#D0021B] opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                </svg>
            </Link>
        </motion.div>
    );
}