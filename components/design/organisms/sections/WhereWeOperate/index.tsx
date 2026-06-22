'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CriticalProjects, KPIS } from '@/components/lib/types';
import HeadingTriangle from '@/public/svg/headingtriangle';
import { STRAPI_URL } from '@/components/lib/settings';

interface WhereWeOperateProps {
    title: string;
    heading: string;
    subheading: string;
    body: string;
    kpis: KPIS[] | [];
    project_title: string;
    critical_projects: CriticalProjects[] | [];
}

// ─── useCountUp hook ──────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
    const [count, setCount] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        // ✅ Reset count when leaving viewport
        if (!start) {
            setCount(0);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            return;
        }

        const startTime = performance.now();
        const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                setCount(target);
            }
        };
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [start, target, duration]);

    return count;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
    title: string;
    number: string;
    suffix: string | null;
    animate: boolean;
    index: number;
}

function KpiCard({ title, number, suffix, animate, index }: KpiCardProps) {
    const parsed = parseInt(number, 10);
    const isNumeric = !isNaN(parsed);
    const count = useCountUp(isNumeric ? parsed : 0, 2000, animate && isNumeric);
    const displayNumber = isNumeric ? count : number;

    return (
        <div
            className="flex flex-col items-start transition-all duration-300 hover:-translate-y-1"
            style={{
                opacity: animate ? 1 : 0,
                transform: animate ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
            }}
        >
            <span className="text-5xl font-bold text-primaryDefault tracking-[0.96px]">
                {displayNumber}
                {animate && suffix && <span>{suffix}</span>}
            </span>
            <span className="mt-2 text-base text-darkLight uppercase">{title}</span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const getMediaUrl = (url?: string): string => url ? `${STRAPI_URL}${url}` : '';

export default function WhereWeOperate({
    title, heading, subheading, body, kpis, project_title, critical_projects
}: WhereWeOperateProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const [animate, setAnimate] = useState(false);
    const [marqueeActive, setMarqueeActive] = useState(false);

    const logos = [
        ...(critical_projects ?? []),
        ...(critical_projects ?? []),
        ...(critical_projects ?? []),
        ...(critical_projects ?? []),
    ];

    if (!critical_projects?.length) return null;

    // ✅ KPI observer — keeps watching, toggles animate on enter AND leave
    useEffect(() => {
        const node = sectionRef.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setAnimate(true);   // entering → start count up
                } else {
                    setAnimate(false);  // leaving → reset to 0
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    // Header entrance animation
    useEffect(() => {
        const node = headerRef.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    node.style.opacity = '1';
                    node.style.transform = 'translateY(0)';
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    // Marquee trigger — starts only when scrolled into view
    useEffect(() => {
        const node = marqueeRef.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setMarqueeActive(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style>{`
                @keyframes marquee-scroll {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .marquee-track {
                    animation: marquee-scroll 30s linear infinite;
                    animation-play-state: paused;
                }
                .marquee-track.active {
                    animation-play-state: running;
                }
                .marquee-track:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <section
                className="w-full bg-white px-4 py-20 md:py-30 overflow-hidden"
                aria-labelledby="where-we-operate-heading"
            >
                <div className="max-w-7xl mx-auto">

                    {/* ── Header ── */}
                    <header
                        ref={headerRef}
                        style={{
                            opacity: 0,
                            transform: 'translateY(24px)',
                            transition: 'opacity 0.6s ease, transform 0.6s ease',
                        }}
                    >
                        <div className="inline-flex items-center gap-2 mb-4">
                            <HeadingTriangle />
                            <span className="text-primaryDefault text-xl md:text-lg font-medium uppercase">
                                {title}
                            </span>
                        </div>
                        <h2
                            id="where-we-operate-heading"
                            className="text-navy900 uppercase font-medium tracking-[-1.92px] text-4xl sm:text-5xl lg:text-6xl max-w-7xl w-full pb-2"
                        >
                            {heading}
                        </h2>
                        <p className="tracking-[-0.48px] text-darkLight text-lg md:text-2xl font-medium max-w-7xl w-full pb-8">
                            {subheading}
                        </p>
                        <p className="text-darkLight text-base md:text-lg max-w-6xl mb-6">
                            {body}
                        </p>
                    </header>

                    {/* ── KPI grid ── */}
                    {kpis.length > 0 && (
                        <div
                            ref={sectionRef}
                            role="list"
                            aria-label="Key performance indicators"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
                        >
                            {kpis.map((kpi, index) => (
                                <div key={kpi.id ?? index} role="listitem">
                                    <KpiCard
                                        title={kpi.title}
                                        number={kpi.number}
                                        suffix={kpi.suffix}
                                        animate={animate}
                                        index={index}
                                    />
                                </div>
                            ))}
                        </div>
                    )}



                </div>

            </section>
            {/* ── Marquee ── */}
            <section
                ref={marqueeRef}
                className="overflow-hidden pb-20 md:pb-30"
                aria-label={project_title}
            >
                <header className="max-w-7xl w-full mx-auto text-center mb-6 px-6">
                    <p className="text-darkLight text-lg">
                        {project_title}
                    </p>
                </header>

                <div className="relative">
                    <div className="overflow-hidden">
                        <div
                            className={`marquee-track flex items-center gap-14 w-max ${marqueeActive ? 'active' : ''}`}
                            role="list"
                            aria-label="Partner logos"
                        >
                            {logos.map((project, index) => (
                                <div
                                    key={`${project.id}-${index}`}
                                    role="listitem"
                                    className="flex px-4 md:px-8 lg:px-10 items-center justify-center shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300"
                                >
                                    <Image
                                        src={getMediaUrl(project.image?.url)}
                                        alt={project.name}
                                        width={project.image.width}
                                        height={project.image.height}
                                        className="object-contain"
                                        draggable={false}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}