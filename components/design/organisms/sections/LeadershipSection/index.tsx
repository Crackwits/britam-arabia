"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { TeamMember } from "@/components/lib/types";
import HeadingTriangle from "@/public/svg/headingtriangle";
import { STRAPI_URL } from "@/components/lib/settings";
interface LeadershipSectionProps {
    section5_leadership: string;
    section5_heading: string;
    section5_subheading: string;
    section5_body: string;
    team_members: TeamMember[];
}

const getMediaUrl = (url?: string) =>
    url ? `${STRAPI_URL}${url}` : "";

// ─── Hook: Intersection Observer ──────────────────────────────────────────────

function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect(); // fire once
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, inView };
}

// ─── Animation Utility ────────────────────────────────────────────────────────

/**
 * Returns inline style for a staggered fade-up animation driven by
 * Intersection Observer — no Framer Motion dependency required.
 *
 * opacity 0 → 1, translateY 40px → 0, duration 0.6s, stagger via delay.
 */
function fadeUpStyle(inView: boolean, delayMs: number): React.CSSProperties {
    return {
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ease ${delayMs}ms, transform 0.6s ease ${delayMs}ms`,
    };
}

// ─── MemberCard ───────────────────────────────────────────────────────────────

interface MemberCardProps {
    member: TeamMember;
    inView: boolean;
    index: number;
}

function MemberCard({ member, inView, index }: MemberCardProps) {
    const imageUrl = getMediaUrl(member.profile?.url);

    // Heading block animates at 0 + 150ms per card slot
    const delay = 300 + index * 150;

    return (
        <div
            style={fadeUpStyle(inView, delay)}
            className="group flex flex-col"
        >
            {/* Portrait image */}
            <div
                className="relative w-full overflow-hidden transition-all duration-300 ease-out group-hover:shadow-xl"
                style={{ aspectRatio: "12 / 13" }}
            >

                <Image
                    src={imageUrl}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-110"
                />

            </div>

            {/* Name + Position */}
            <div className="mt-4">
                <p className="text-2xl font-medium tracking-[-0.48px] text-richNavy mb-2">
                    {member.name}
                </p>
                <p className="text-base text-darkLight mb-8">
                    {member.position}
                </p>
            </div>
        </div>
    );
}

// ─── LeadershipSection ────────────────────────────────────────────────────────

export default function LeadershipSection({
    section5_leadership,
    section5_heading,
    section5_subheading,
    section5_body,
    team_members,
}: LeadershipSectionProps) {
    const { ref, inView } = useInView(0.15);

    return (
        <section
            ref={ref}
            className="w-full bg-white px-4 py-20 md:py-30 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div style={fadeUpStyle(inView, 0)} className="inline-flex items-center gap-2 mb-4">
                    <HeadingTriangle />
                    <span className="text-primaryDefault text-xl md:text-lg font-medium uppercase">
                        {section5_leadership}
                    </span>
                </div>

                <h2
                    style={fadeUpStyle(inView, 80)}
                    id="Leadership-heading"
                    className="text-navy900 uppercase font-medium tracking-[-1.92px] text-4xl sm:text-5xl lg:text-6xl max-w-7xl w-full pb-2"
                >
                    {section5_heading}
                </h2>

                {/* Subheading */}
                <p
                    style={fadeUpStyle(inView, 140)}
                    className="tracking-[-0.48px] text-darkLight text-lg md:text-2xl font-medium max-w-7xl w-full pb-8">

                    {section5_subheading}
                </p>

                {/* Body paragraph */}
                <p
                    style={{
                        ...fadeUpStyle(inView, 220),
                        maxWidth: "600px",
                    }}
                    className="text-darkLight text-base md:text-lg max-w-6xl mb-6">

                    {section5_body}
                </p>

                {/* ── Team grid ─────────────────────────────────────────────────── */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {team_members.map((member, index) => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            inView={inView}
                            index={index}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}