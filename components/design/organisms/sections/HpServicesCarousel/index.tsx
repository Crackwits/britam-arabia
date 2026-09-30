"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Capabilities } from "@/components/lib/types";
import { STRAPI_URL } from "@/components/lib/settings";
import HeadingTriangle from "@/public/svg/headingtriangle";

interface Props {
    lang: string;
    isArabic: boolean;
    services_entry_heading: string;
    services_entry_subheading: string;
    services_entry_items: Capabilities[];
}

const getMediaUrl = (url?: string) => (url ? `${STRAPI_URL}${url}` : "");

const GAP_PX = 32;
const EDGE_THRESHOLD = 10;
const SCROLL_DURATION = 800; // ms, raise for slower, lower for faster

const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ─── Arrow icons ────────────────────────────────────────────────────────────
export function LeftArrowIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="62"
            height="62"
            viewBox="0 0 62 62"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.75 31C7.75 18.1583 18.1583 7.75 31 7.75C43.8418 7.75 54.25 18.1583 54.25 31C54.25 43.8418 43.8418 54.25 31 54.25C18.1583 54.25 7.75 43.8418 7.75 31Z"
                fill="#34343F"
            />
            <path
                d="M38.7695 31.0104L23.2306 31.0104"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M29.4365 24.8001L23.2376 31.0001L29.4365 37.2001"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function RightArrowIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="62"
            height="62"
            viewBox="0 0 62 62"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M54.25 31C54.25 43.8418 43.8418 54.25 31 54.25C18.1583 54.25 7.75 43.8418 7.75 31C7.75 18.1583 18.1583 7.75 31 7.75C43.8418 7.75 54.25 18.1583 54.25 31Z"
                fill="#34343F"
            />
            <path
                d="M23.2305 30.9897L38.7694 30.9897"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M32.5635 37.2L38.7624 31L32.5635 24.7999"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

interface CardProps {
    item: Capabilities;
    imageHeight: number | null;
    cardRef: (el: HTMLElement | null) => void;
    textBlockRef: (el: HTMLDivElement | null) => void;
    onImageLoad: () => void;
}

function ServiceCard({ item, imageHeight, cardRef, textBlockRef, onImageLoad }: CardProps) {
    const imageUrl = getMediaUrl(item.image?.url);

    return (
        <article
            ref={cardRef}
            className="group flex flex-col flex-shrink-0 h-full w-[88vw] sm:w-[70vw] lg:w-[450px]"
        >
            <div
                className={[
                    "relative w-full overflow-hidden flex-shrink-0",
                    imageHeight === null ? "flex-1 min-h-0" : "",
                ].join(" ")}
                style={{
                    clipPath: "polygon(80px 0, 100% 0, 100% 100%, 0 100%, 0 80px)",
                    ...(imageHeight !== null ? { height: `${imageHeight}px` } : {}),
                }}
            >
                <img
                    src={imageUrl}
                    alt={item.image?.alternativeText ?? item.title}
                    className="inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    onLoad={onImageLoad}
                    onError={onImageLoad}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div ref={textBlockRef} className="mt-4 flex flex-col flex-shrink-0">
                <h3 className="text-2xl font-medium tracking-[-0.48px] text-richNavy mb-1">
                    {item.title}
                </h3>
                <p className="text-base text-darkLight mb-4">{item.description}</p>
                <span className="w-12 h-[1px] bg-[#ED0000] block" aria-hidden="true" />
            </div>
        </article>
    );
}

export default function ServicesCarousel({
    isArabic,
    services_entry_heading,
    services_entry_subheading,
    services_entry_items,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    // Arrow state
    const [edges, setEdges] = useState({
        isCarousel: false,
        canLeft: false,
        canRight: false,
    });

    // Card & image measurements
    const cardRefs = useRef<(HTMLElement | null)[]>([]);
    const textBlockRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [imageHeight, setImageHeight] = useState<number | null>(null);
    const loadedCountRef = useRef(0);

    // Drag + animation bookkeeping (refs => no re-renders)
    const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });
    const rafRef = useRef<number | null>(null);
    const animRef = useRef<{ raf: number | null; target: number | null }>({
        raf: null,
        target: null,
    });

    // ─── Image height matching ──────────────────────────────────────────────
    const recalcImageHeight = useCallback(() => {
        const cards = cardRefs.current;
        const texts = textBlockRefs.current;
        const count = services_entry_items.length;

        let min = Infinity;
        for (let i = 0; i < count; i++) {
            const cardEl = cards[i];
            const textEl = texts[i];
            if (!cardEl || !textEl) continue;

            const cardHeight = cardEl.getBoundingClientRect().height;
            const textHeight = textEl.getBoundingClientRect().height;
            const textMarginTop = parseFloat(getComputedStyle(textEl).marginTop) || 0;

            const available = cardHeight - textHeight - textMarginTop;
            if (available > 0 && available < min) min = available;
        }

        if (Number.isFinite(min)) setImageHeight(Math.floor(min));
    }, [services_entry_items.length]);

    const handleImageLoad = useCallback(() => {
        loadedCountRef.current += 1;
        if (loadedCountRef.current >= services_entry_items.length) {
            requestAnimationFrame(() => requestAnimationFrame(recalcImageHeight));
        }
    }, [services_entry_items.length, recalcImageHeight]);

    useEffect(() => {
        loadedCountRef.current = 0;
        setImageHeight(null);
        const fallback = requestAnimationFrame(() =>
            requestAnimationFrame(recalcImageHeight),
        );
        return () => cancelAnimationFrame(fallback);
    }, [services_entry_items, recalcImageHeight]);

    // ─── Arrow enabled/disabled state ───────────────────────────────────────
    const updateEdges = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;

        const max = el.scrollWidth - el.clientWidth;
        const isRtl = getComputedStyle(el).direction === "rtl";

        // Physical distance scrolled from the LEFT edge.
        // LTR: scrollLeft goes 0 → max.  RTL: scrollLeft goes 0 → -max.
        const fromLeft = isRtl ? max + el.scrollLeft : el.scrollLeft;
        const fromRight = max - fromLeft;

        const next = {
            isCarousel: max > EDGE_THRESHOLD,
            canLeft: fromLeft > EDGE_THRESHOLD,
            canRight: fromRight > EDGE_THRESHOLD,
        };

        setEdges((prev) =>
            prev.isCarousel === next.isCarousel &&
                prev.canLeft === next.canLeft &&
                prev.canRight === next.canRight
                ? prev
                : next,
        );
    }, []);

    // Listen to scroll (rAF-throttled)
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onScroll = () => {
            if (rafRef.current !== null) return;
            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                updateEdges();
            });
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            el.removeEventListener("scroll", onScroll);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [updateEdges]);

    // Re-measure when container OR content size changes
    useEffect(() => {
        updateEdges();

        const ro = new ResizeObserver(() => updateEdges());
        if (containerRef.current) ro.observe(containerRef.current);
        if (trackRef.current) ro.observe(trackRef.current);

        window.addEventListener("resize", updateEdges);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", updateEdges);
        };
    }, [updateEdges, services_entry_items, isArabic]);

    // ─── Smooth scroll animation ────────────────────────────────────────────
    const cancelAnimation = useCallback(() => {
        const anim = animRef.current;
        if (anim.raf !== null) cancelAnimationFrame(anim.raf);
        anim.raf = null;
        anim.target = null;
    }, []);

    const animateScrollTo = useCallback((to: number) => {
        const el = containerRef.current;
        if (!el) return;

        const anim = animRef.current;
        if (anim.raf !== null) cancelAnimationFrame(anim.raf);

        const from = el.scrollLeft;
        const distance = to - from;
        if (Math.abs(distance) < 1) {
            anim.raf = null;
            anim.target = null;
            return;
        }

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        const duration = reduceMotion ? 0 : SCROLL_DURATION;

        // Make sure no CSS smooth-scrolling fights the JS animation
        el.style.scrollBehavior = "auto";
        anim.target = to;
        const start = performance.now();

        const step = (now: number) => {
            const t = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
            el.scrollLeft = from + distance * easeInOutCubic(t);

            if (t < 1) {
                anim.raf = requestAnimationFrame(step);
            } else {
                anim.raf = null;
                anim.target = null;
            }
        };

        anim.raf = requestAnimationFrame(step);
    }, []);

    // Reset scroll on language / data change
    useEffect(() => {
        cancelAnimation();
        if (containerRef.current) containerRef.current.scrollLeft = 0;
        updateEdges();
    }, [isArabic, services_entry_items, updateEdges, cancelAnimation]);

    // Stop animation on unmount
    useEffect(() => cancelAnimation, [cancelAnimation]);

    // ─── Arrow navigation ───────────────────────────────────────────────────
    const getCardStep = useCallback(() => {
        const first = cardRefs.current.find(Boolean);
        const cardWidth = first?.getBoundingClientRect().width ?? 0;
        return cardWidth + GAP_PX;
    }, []);

    const scrollByCard = (direction: "left" | "right") => {
        const el = containerRef.current;
        if (!el) return;

        const max = el.scrollWidth - el.clientWidth;
        const isRtl = getComputedStyle(el).direction === "rtl";
        const minPos = isRtl ? -max : 0;
        const maxPos = isRtl ? 0 : max;

        // Chain from the in-flight target so rapid clicks keep moving forward
        const base = animRef.current.target ?? el.scrollLeft;
        const delta = direction === "right" ? getCardStep() : -getCardStep();
        const target = Math.min(maxPos, Math.max(minPos, base + delta));

        animateScrollTo(target);
    };

    // ─── Mouse drag (touch uses native scrolling) ───────────────────────────
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = containerRef.current;
        if (!el) return;
        if ((e.target as HTMLElement).closest("button, a")) return;

        e.preventDefault(); // stops native image dragging
        cancelAnimation();
        dragRef.current = {
            active: true,
            startX: e.clientX,
            startScroll: el.scrollLeft,
        };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = containerRef.current;
        const drag = dragRef.current;
        if (!drag.active || !el) return;
        e.preventDefault();

        // Same formula for LTR and RTL: content follows the pointer
        el.scrollLeft = drag.startScroll - (e.clientX - drag.startX) * 1.5;
    };

    const endDrag = () => {
        dragRef.current.active = false;
    };

    const heading = (
        <div className="px-4 mx-auto max-w-7xl w-full flex items-end justify-between gap-6">
            <div>
                {services_entry_subheading && (
                    <div className="inline-flex gap-2 mb-4">
                        <HeadingTriangle />
                        <span className="text-primaryDefault text-xl md:text-lg font-medium uppercase">
                            {services_entry_subheading}
                        </span>
                    </div>
                )}

                <h2
                    id="services-entry-heading"
                    className="text-navy900 font-medium tracking-[-1.92px] pb-4 text-4xl lg:text-5xl"
                >
                    {services_entry_heading}
                </h2>
            </div>
        </div>
    );

    const arrowBase =
        "absolute top-1/3 z-20 -translate-y-1/3 transition-opacity duration-200";

    return (
        <section className="relative w-full bg-white py-10 md:py-16">
            {heading}
            <div className="relative w-full mt-6">
                {/* Left button (physical left in both languages) */}
                {edges.isCarousel && (
                    <button
                        type="button"
                        onClick={() => scrollByCard("left")}
                        disabled={!edges.canLeft}
                        aria-label={isArabic ? "التالي" : "Previous"}
                        className={`${arrowBase} left-4 ${edges.canLeft
                                ? "cursor-pointer opacity-100"
                                : "cursor-not-allowed opacity-40"
                            }`}
                    >
                        <LeftArrowIcon width={62} height={62} />
                    </button>
                )}

                {/* Right button */}
                {edges.isCarousel && (
                    <button
                        type="button"
                        onClick={() => scrollByCard("right")}
                        disabled={!edges.canRight}
                        aria-label={isArabic ? "السابق" : "Next"}
                        className={`${arrowBase} right-4 ${edges.canRight
                                ? "cursor-pointer opacity-100"
                                : "cursor-not-allowed opacity-40"
                            }`}
                    >
                        <RightArrowIcon width={62} height={62} />
                    </button>
                )}

                <div
                    ref={containerRef}
                    dir={isArabic ? "rtl" : "ltr"}
                    className="overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing px-4 mx-auto w-full mt-6 select-none scrollbar-hide"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={endDrag}
                    onMouseLeave={endDrag}
                    onWheel={cancelAnimation}
                    onTouchStart={cancelAnimation}
                    style={{
                        WebkitOverflowScrolling: "touch",
                        touchAction: "pan-x pan-y",
                        userSelect: "none",
                    }}
                >
                    <div
                        ref={trackRef}
                        className="flex flex-row flex-nowrap items-stretch gap-8"
                    >
                        {services_entry_items.map((item, index) => (
                            <ServiceCard
                                key={item.id}
                                item={item}
                                imageHeight={imageHeight}
                                cardRef={(el) => {
                                    cardRefs.current[index] = el;
                                }}
                                textBlockRef={(el) => {
                                    textBlockRefs.current[index] = el;
                                }}
                                onImageLoad={handleImageLoad}
                            />
                        ))}
                        <div className="flex-shrink-0 w-4 sm:w-6 lg:w-8" aria-hidden="true" />
                    </div>
                </div>
            </div>
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }

                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}