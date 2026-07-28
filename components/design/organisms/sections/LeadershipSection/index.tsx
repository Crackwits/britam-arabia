"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { TeamMember } from "@/components/lib/types";
import HeadingTriangle from "@/public/svg/headingtriangle";
import { STRAPI_URL } from "@/components/lib/settings";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

interface LeadershipSectionProps {
    section5_leadership: string;
    section5_heading: string;
    section5_subheading: string;
    section5_body: string;
    team_members: TeamMember[];
    isArabic: boolean;
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
    onSelect: (member: TeamMember) => void;
}

function MemberCard({ member, inView, index, onSelect }: MemberCardProps) {
    const imageUrl = getMediaUrl(member.profile?.url);
    const delay = 300 + index * 150;

    return (
        <button
            type="button"
            onClick={() => onSelect(member)}
            style={fadeUpStyle(inView, delay)}
            className="group flex flex-col cursor-pointer"
        >
            {/* Portrait image */}
            <div
                className="relative w-full overflow-hidden transition-all duration-300 ease-out group-hover:shadow-sm"
                style={{ aspectRatio: "12 / 13" }}
            >
                <Image
                    src={imageUrl}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
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
        </button>
    );
}

export function useLockBodyScroll(locked: boolean) {
    const lenis = useLenis();

    useEffect(() => {
        if (!locked) return;

        // Pause Lenis's own scroll handling while the modal is open
        lenis?.stop();

        // Also lock native scroll as a fallback (e.g. before Lenis mounts)
        const { style: htmlStyle } = document.documentElement;
        const { style: bodyStyle } = document.body;
        const prevHtmlOverflow = htmlStyle.overflow;
        const prevBodyOverflow = bodyStyle.overflow;
        htmlStyle.overflow = "hidden";
        bodyStyle.overflow = "hidden";

        return () => {
            lenis?.start();
            htmlStyle.overflow = prevHtmlOverflow;
            bodyStyle.overflow = prevBodyOverflow;
        };
    }, [locked, lenis]);
}

// ─── MemberModal ────────────────────────────────────────────────────────────

interface MemberModalProps {
    isArabic: boolean;
    member: TeamMember | null;
    onClose: () => void;
}

function MemberModal({ isArabic, member, onClose }: MemberModalProps) {
    useLockBodyScroll(!!member);

    useEffect(() => {
        if (!member) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [member, onClose]);

    if (!member) return null;

    const imageUrl = getMediaUrl(member.coloredprofile?.url || member.profile?.url);

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 md:p-8 animate-[fadeIn_0.2s_ease-out]"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl max-h-[85vh] md:max-h-[74vh] flex flex-col overflow-hidden bg-white px-4 py-8 md:px-8 md:py-16 animate-[scaleIn_0.25s_ease-out]"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-neutral900 transition-colors hover:bg-f7f7f7 hover:text-navy900"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="h-5 w-5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="text-center mb-6 md:mb-8 shrink-0">
                    <p className="text-base text-darkLight pb-1">
                        {member.position}
                    </p>
                    <h3 className="text-darkDefault text-2xl md:text-3xl font-medium tracking-[-0.48px]">
                        {member.name}
                    </h3>
                </div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-10 min-h-0 flex-1">
                    {/* Image: fixed, capped size on mobile so it can't swallow the modal height */}
                    <div className="shrink-0 mx-auto md:mx-0">
                        <div className="relative h-[200px] w-[200px] sm:h-[240px] sm:w-[240px] overflow-hidden md:h-[304px] md:w-[281px]">
                            <Image
                                src={imageUrl}
                                alt={member.name}
                                fill
                                sizes="(max-width: 768px) 240px, 281px"
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Text: guaranteed flexible + scrollable area */}
                    <div
                        data-lenis-prevent
                        className={`${isArabic ? 'pl-4' : 'pr-4'} text-darkLight text-base whitespace-pre-line min-h-0 flex-1 overflow-y-auto scrollbar-hide`}
                    >
                        <div

                            className="memberbio"
                            dangerouslySetInnerHTML={{ __html: member.bio }}>
                        </div>
                    </div>

                </div>
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
    isArabic
}: LeadershipSectionProps) {
    const { ref, inView } = useInView(0.15);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    return (
        <section
            ref={ref}
            className="w-full bg-white px-4 py-15 md:py-25 overflow-hidden">
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
                    className="text-navy900 font-medium tracking-[-1.92px] text-4xl sm:text-4xl lg:text-5xl max-w-7xl w-full pb-2"
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
                        maxWidth: "880px",
                    }}
                    className="text-darkLight text-base md:text-lg w-full max-w-6xl mb-6">

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
                            onSelect={setSelectedMember}
                        />
                    ))}
                </div>

            </div>

            <MemberModal isArabic={isArabic} member={selectedMember} onClose={() => setSelectedMember(null)} />
        </section>
    );
}