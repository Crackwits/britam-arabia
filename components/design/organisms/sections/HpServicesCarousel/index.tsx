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

// Gap between cards — must match the `gap-8` class on the track below.
// Kept as a constant (rather than measured) since it's a fixed design value.
const GAP_PX = 32;

// ─── Arrow icons ────────────────────────────────────────────────────────────
// Icon_11 = left-pointing arrow, Icon_12 = right-pointing arrow.
// stroke="currentColor" so button text-color classes (hover/disabled) drive it.

function LeftArrowIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path fillRule="evenodd" clipRule="evenodd" d="M0.999999 24.5V24.5C0.999999 37.756 11.744 48.5 25 48.5V48.5C38.256 48.5 49 37.756 49 24.5V24.5C49 11.244 38.256 0.500002 25 0.500002V0.500002C11.744 0.500001 1 11.244 0.999999 24.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M31.2656 25.3732L18.7342 25.3732" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23.7393 30.3818L18.7401 25.3818L23.7393 20.3818" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function RightArrowIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path fillRule="evenodd" clipRule="evenodd" d="M48.7998 25.1182V25.1182C48.7998 38.3742 38.0558 49.1182 24.7998 49.1182V49.1182C11.5438 49.1182 0.799806 38.3742 0.799806 25.1182V25.1182C0.799805 11.8622 11.5438 1.11817 24.7998 1.11817V1.11817C38.0558 1.11817 48.7998 11.8622 48.7998 25.1182Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.7344 24.9914L31.2658 24.9914" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M26.2607 30L31.2599 25L26.2607 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

interface CardProps {
    item: Capabilities;
    isArabic: boolean;
    lang: string;

    // ── Uniform image-height synchronization ──
    // Shared height (px) computed by the parent from the smallest
    // available image area across all cards. `null` until the first
    // measurement completes, in which case the card falls back to its
    // original flex-1/min-h-0 sizing — no hardcoded height is ever used.
    imageHeight: number | null;
    cardRef: (el: HTMLElement | null) => void;
    textBlockRef: (el: HTMLDivElement | null) => void;
    onImageLoad: () => void;
}

/* ──────────────────────────────────────────────────────────
   Card — no entrance/stagger animation. Only the hover
   image-scale transition remains for a bit of polish.
────────────────────────────────────────────────────────── */
function ServiceCard({
    item,
    isArabic,
    lang,
    imageHeight,
    cardRef,
    textBlockRef,
    onImageLoad,
}: CardProps) {
    const imageUrl = getMediaUrl(item.image?.url);

    return (
        <article
            ref={cardRef as (el: HTMLElement | null) => void}
            className="group flex flex-col flex-shrink-0 h-full w-[88vw] sm:w-[70vw] lg:w-[450px]"
        >
            <div
                className={[
                    "relative w-full overflow-hidden flex-shrink-0",
                    // Pre-measurement fallback: same flex-1/min-h-0 behavior,
                    // so nothing shifts before the shared height is known.
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
                {/* </Link> */}
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
    lang,
    isArabic,
    services_entry_heading,
    services_entry_subheading,
    services_entry_items,
}: Props) {
    // The visible, overflow-hidden viewport (max-w-7xl/px-4 box). We measure
    // its clientWidth to know how much of the track is on-screen at once.
    const wrapperRef = useRef<HTMLDivElement>(null);

    // The flex row that holds all the cards. We measure its natural
    // (unclipped) width via `scrollWidth`.
    const trackRef = useRef<HTMLDivElement>(null);

    const [trackWidth, setTrackWidth] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    // Current translate offset, always a positive magnitude — direction
    // (left vs right) is applied only in the transform style below, based
    // on `isArabic`. Clamped to [0, scrollDistance].
    const [x, setX] = useState(0);

    // ── Uniform image-height synchronization ── (unchanged logic)
    const cardRefs = useRef<(HTMLElement | null)[]>([]);
    const textBlockRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [imageHeight, setImageHeight] = useState<number | null>(null);
    const loadedCountRef = useRef(0);

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
            if (available > 0 && available < min) {
                min = available;
            }
        }

        if (Number.isFinite(min)) {
            setImageHeight(Math.floor(min));
        }
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

    // ── Measure track + container widths, react to resize ──
    const updateMeasurements = useCallback(() => {
        if (trackRef.current) setTrackWidth(trackRef.current.scrollWidth);
        if (wrapperRef.current) setContainerWidth(wrapperRef.current.clientWidth);
    }, []);

    useEffect(() => {
        updateMeasurements();

        const resizeObserver = new ResizeObserver(() => updateMeasurements());
        if (trackRef.current) resizeObserver.observe(trackRef.current);
        if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);

        window.addEventListener("resize", updateMeasurements);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateMeasurements);
        };
    }, [updateMeasurements, services_entry_items]);

    // Also re-check text/image layout on resize (breakpoint shifts change
    // card width → text wrapping → available image height).
    useEffect(() => {
        const onResize = () => recalcImageHeight();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [recalcImageHeight]);

    // How far the track can travel so its last card ends up flush with
    // the edge of the visible container.
    const scrollDistance = Math.max(trackWidth - containerWidth, 0);
    const isCarousel = scrollDistance > 0;

    // Keep x in range whenever the max changes (e.g. window resized down
    // to a point where fewer cards fit, or up to a point where they all fit).
    useEffect(() => {
        setX((prev) => Math.min(prev, scrollDistance));
    }, [scrollDistance]);

    // Step size = one card's width + the gap between cards.
    const step = useCallback(() => {
        const first = cardRefs.current.find(Boolean);
        const cardWidth = first?.getBoundingClientRect().width ?? 0;
        return cardWidth + GAP_PX;
    }, []);

    const goPrev = () => setX((prev) => Math.max(prev - step(), 0));
    const goNext = () => setX((prev) => Math.min(prev + step(), scrollDistance));

    const canPrev = x > 0.5;
    const canNext = x < scrollDistance - 0.5;

    const arrowButtonClasses = (enabled: boolean) => [
        "flex items-center justify-center h-12 w-12 transition-colors",
        enabled
            ? "text-darkDefault border-neutralLighter hover:text-primaryDefault hover:border-primaryDefault cursor-pointer"
            : "text-neutralLighter border-neutralLighter cursor-not-allowed",
    ].join(" ");

    const PrevIcon = isArabic ? RightArrowIcon : LeftArrowIcon;
    const NextIcon = isArabic ? LeftArrowIcon : RightArrowIcon;

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

            {isCarousel && (
                <div className={`flex items-center gap-3 shrink-0 pb-4 ${isArabic ? "flex-row-reverse" : ""}`}>
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={!canPrev}
                        aria-label={isArabic ? "التالي" : "Previous"}
                        className={arrowButtonClasses(canPrev)}
                    >
                        <PrevIcon width={48} height={48} />
                    </button>
                    <button
                        type="button"
                        onClick={goNext}
                        disabled={!canNext}
                        aria-label={isArabic ? "السابق" : "Next"}
                        className={arrowButtonClasses(canNext)}
                    >
                        <NextIcon width={48} height={48} />
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <section className="relative w-full bg-white py-10 md:py-16">
            {heading}

            <div ref={wrapperRef} className="overflow-hidden px-4 mx-auto max-w-7xl w-full mt-6">
                <div
                    ref={trackRef}
                    style={{
                        transform: `translateX(${isArabic ? x : -x}px)`,
                        transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                    className={[
                        "flex flex-nowrap items-stretch gap-8",
                        isArabic ? "flex-row-reverse" : "flex-row",
                    ].join(" ")}
                >
                    {services_entry_items.map((item, index) => (
                        <ServiceCard
                            key={item.id}
                            item={item}
                            isArabic={isArabic}
                            lang={lang}
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
        </section>
    );
}