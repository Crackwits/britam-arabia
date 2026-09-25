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

// ─── Arrow icons ────────────────────────────────────────────────────────────

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
    lang,
    isArabic,
    services_entry_heading,
    services_entry_subheading,
    services_entry_items,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [startY, setStartY] = useState(0);
    const [isHorizontalScroll, setIsHorizontalScroll] = useState(false);
    const [currentScrollLeft, setCurrentScrollLeft] = useState(0);

    // Card & image measurements
    const cardRefs = useRef<(HTMLElement | null)[]>([]);
    const textBlockRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [imageHeight, setImageHeight] = useState<number | null>(null);
    const loadedCountRef = useRef(0);

    const [containerWidth, setContainerWidth] = useState(0);
    const [scrollWidth, setScrollWidth] = useState(0);

    // Calculate image heights to match across all cards
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

    // Update measurements
    const updateMeasurements = useCallback(() => {
        if (containerRef.current) {
            setScrollWidth(containerRef.current.scrollWidth);
            setContainerWidth(containerRef.current.clientWidth);
        }
    }, []);

    useEffect(() => {
        updateMeasurements();

        const resizeObserver = new ResizeObserver(() => updateMeasurements());
        if (containerRef.current) resizeObserver.observe(containerRef.current);

        window.addEventListener("resize", updateMeasurements);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateMeasurements);
        };
    }, [updateMeasurements, services_entry_items, isArabic]);

    // Track scroll position for button states
    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                setCurrentScrollLeft(containerRef.current.scrollLeft);
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, []);

    // Reset scroll on language change
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollLeft = 0;
        }
    }, [isArabic, services_entry_items]);

    const scrollDistance = Math.max(scrollWidth - containerWidth, 0);
    const isCarousel = scrollDistance > 0;

    // ✅ FIXED: Same button logic for both LTR and RTL
    // Both use the same scrollLeft manipulation logic
    const canPrev = isArabic? -currentScrollLeft < scrollDistance - 10 : currentScrollLeft > 10;
    const canNext = isArabic? -currentScrollLeft > 10 : currentScrollLeft < scrollDistance - 10;

    // ─── Mouse Drag Handlers ───────────────────────────────────────────────

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        if ((e.target as HTMLElement).closest("button, a")) return;

        e.preventDefault();
        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setScrollLeft(containerRef.current.scrollLeft);
        containerRef.current.style.cursor = "grabbing";
        containerRef.current.style.scrollBehavior = "auto";
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();

        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;

        if (isArabic) {
            containerRef.current.scrollLeft = scrollLeft + walk;
        } else {
            containerRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    const handleMouseUp = () => {
        if (!containerRef.current) return;
        setIsDragging(false);
        containerRef.current.style.cursor = "grab";
        containerRef.current.style.scrollBehavior = "smooth";
    };

    const handleMouseLeave = () => {
        if (!containerRef.current) return;
        setIsDragging(false);
        containerRef.current.style.cursor = "grab";
        containerRef.current.style.scrollBehavior = "smooth";
    };

    // ─── Touch Drag Handlers ───────────────────────────────────────────────

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
        setStartY(e.touches[0].clientY);
        setScrollLeft(containerRef.current.scrollLeft);
        setIsHorizontalScroll(false);
        containerRef.current.style.scrollBehavior = "auto";
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging || !containerRef.current) return;

        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const deltaX = Math.abs(x - startX);
        const deltaY = Math.abs(y - startY);

        // Determine scroll direction on first move
        if (!isHorizontalScroll && (deltaX > 5 || deltaY > 5)) {
            setIsHorizontalScroll(deltaX > deltaY);
        }

        // Only prevent default and scroll horizontally if user is scrolling horizontally
        if (isHorizontalScroll) {
            e.preventDefault();
            const walk = (startX - x) * 1.5;

            if (isArabic) {
                containerRef.current.scrollLeft = scrollLeft - walk;
            } else {
                containerRef.current.scrollLeft = scrollLeft + walk;
            }
        }
    };

    const handleTouchEnd = () => {
        if (!containerRef.current) return;
        setIsDragging(false);
        setIsHorizontalScroll(false);
        containerRef.current.style.scrollBehavior = "smooth";
    };

    // ─── Arrow Navigation ────────────────────────────────────────────────────

    const getCardStep = useCallback(() => {
        const first = cardRefs.current.find(Boolean);
        const cardWidth = first?.getBoundingClientRect().width ?? 0;
        return cardWidth + GAP_PX;
    }, []);

    // ✅ FIXED - Same logic for both languages
    const goPrev = () => {
        if (!containerRef.current) return;
        containerRef.current.style.scrollBehavior = "smooth";
        containerRef.current.scrollLeft -= getCardStep();
    };

    const goNext = () => {
        if (!containerRef.current) return;
        containerRef.current.style.scrollBehavior = "smooth";
        containerRef.current.scrollLeft += getCardStep();
    };

    const arrowButtonClasses = (enabled: boolean) =>
        [
            "flex items-center justify-center h-11 w-11 transition-colors",
            enabled
                ? "text-darkDefault cursor-pointer hover:text-darkDefault/80"
                : "text-neutralLighter cursor-not-allowed",
        ].join(" ");

    const PrevIcon = LeftArrowIcon;
    const NextIcon = RightArrowIcon;

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
                        aria-label={isArabic ? "السابق" : "Previous"}
                        className={arrowButtonClasses(canPrev)}
                    >
                        <PrevIcon width={48} height={48} />
                    </button>
                    <button
                        type="button"
                        onClick={goNext}
                        disabled={!canNext}
                        aria-label={isArabic ? "التالي" : "Next"}
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

            <div
                ref={containerRef}
                className="overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing px-4 mx-auto max-w-7xl w-full mt-6 select-none scrollbar-hide"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    scrollBehavior: "smooth",
                    WebkitOverflowScrolling: "touch",
                    touchAction: "pan-y",
                    userSelect: "none",
                }}
            >
                <div className="flex flex-row flex-nowrap items-stretch gap-8">
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