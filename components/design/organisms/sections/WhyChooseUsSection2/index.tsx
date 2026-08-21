"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { WhyChooseUs } from "@/components/lib/types";
import { STRAPI_URL } from "@/components/lib/settings";

const AUTO_PROGRESS_INTERVAL = 6000;
const IMAGE_TRANSITION_MS = 800;

export interface WhyChooseUsSectionProps {
    title: string;
    why_choose_us: WhyChooseUs[];
}

const getMediaUrl = (url?: string) => (url ? `${STRAPI_URL}${url}` : "");

export default function WhyChooseUsSection2({
    title,
    why_choose_us,
}: WhyChooseUsSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState<number | null>(null);
    const [progressWidth, setProgressWidth] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Refs for managing timer
    const sectionRef = useRef<HTMLDivElement>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isHoveringRef = useRef(false);
    const isFocusedRef = useRef(false);
    const prefersReducedMotion = useRef(false);

    // Check for prefers-reduced-motion
    useEffect(() => {
        const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
        prefersReducedMotion.current = mql.matches;
        const handler = () => {
            prefersReducedMotion.current = mql.matches;
        };
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    // Main autoplay timer
    useEffect(() => {
        // Clean up existing timers
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);

        // Don't run if paused or single item
        if (isPaused || why_choose_us.length <= 1) {
            setProgressWidth(0);
            return;
        }

        setProgressWidth(0);

        if (prefersReducedMotion.current) {
            // For users who prefer reduced motion, just use a basic interval
            autoplayIntervalRef.current = setInterval(() => {
                setActiveIndex((prev) =>
                    prev === why_choose_us.length - 1 ? 0 : prev + 1
                );
                setProgressWidth(0);
            }, AUTO_PROGRESS_INTERVAL);
        } else {
            // Smooth progress animation
            let progress = 0;
            const step = (16 / AUTO_PROGRESS_INTERVAL) * 100; // ~60fps

            progressIntervalRef.current = setInterval(() => {
                progress += step;

                if (progress >= 100) {
                    setPreviousIndex(activeIndex);
                    setActiveIndex((prev) =>
                        prev === why_choose_us.length - 1 ? 0 : prev + 1
                    );
                    progress = 0;
                } else {
                    setProgressWidth(progress);
                }
            }, 16);
        }

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
        };
    }, [isPaused, why_choose_us.length, activeIndex]);

    const goToIndex = useCallback((index: number) => {
        if (index !== activeIndex) {
            setPreviousIndex(activeIndex);
            setProgressWidth(0);
            setActiveIndex(index);
        }
    }, [activeIndex]);

    const handleItemClick = useCallback(
        (index: number) => {
            goToIndex(index);
        },
        [goToIndex]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, index: number) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleItemClick(index);
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const nextIndex =
                    index === why_choose_us.length - 1 ? 0 : index + 1;
                goToIndex(nextIndex);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                const prevIndex =
                    index === 0 ? why_choose_us.length - 1 : index - 1;
                goToIndex(prevIndex);
            }
        },
        [goToIndex, why_choose_us.length, handleItemClick]
    );

    const handleMouseEnter = () => {
        isHoveringRef.current = true;
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        isHoveringRef.current = false;
        setIsPaused(isFocusedRef.current);
    };

    const handleFocus = () => {
        isFocusedRef.current = true;
        setIsPaused(true);
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        const nextFocusTarget = e.relatedTarget as Node | null;
        if (!nextFocusTarget || !e.currentTarget.contains(nextFocusTarget)) {
            isFocusedRef.current = false;
            setIsPaused(isHoveringRef.current);
        }
    };

    if (why_choose_us.length === 0) return null;

    const activeItem = why_choose_us[activeIndex];
    const previousItem = previousIndex !== null ? why_choose_us[previousIndex] : null;

    const currentImageUrl = getMediaUrl(activeItem.image?.url);
    const previousImageUrl = previousItem ? getMediaUrl(previousItem.image?.url) : null;

    // Preload all images
    const preloadUrls = why_choose_us
        .map((item) => getMediaUrl(item.image?.url))
        .filter(Boolean);

    return (
        <section ref={sectionRef} className="w-full bg-white py-20 px-6">
            {/* Image Preloads */}
            <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
                {preloadUrls.map((url) => (
                    <Image
                        key={url}
                        src={url}
                        alt=""
                        width={1}
                        height={1}
                        loading="eager"
                    />
                ))}
            </div>

            <div className="mx-auto max-w-7xl">
                {/* Title */}
                <h2 className="text-navy900 uppercase font-medium tracking-[-0.96px] pb-4 text-4xl sm:text-5xl mb-10">
                    {title}
                </h2>

                {/* Main Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Left Column - Items */}
                    <div
                        className="flex flex-col"
                        role="tablist"
                        aria-label={title}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    >
                        <div className="space-y-0">
                            {why_choose_us.map((item, index) => {
                                const isActive = activeIndex === index;
                                const itemIconUrl = getMediaUrl(item.icon?.url);

                                return (
                                    <div key={item.id}>
                                        {/* Tab Button */}
                                        <button
                                            role="tab"
                                            id={`why-choose-tab-${item.id}`}
                                            aria-selected={isActive}
                                            aria-controls={`why-choose-panel-${item.id}`}
                                            tabIndex={isActive ? 0 : -1}
                                            onClick={() => handleItemClick(index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            className={`w-full text-left text-2xl tracking-[-0.48px] px-0 py-4 transition-all duration-300 ${isActive
                                                    ? "text-richNavy font-medium"
                                                    : "text-darkDefault hover:text-richNavy/70"
                                                }`}
                                        >
                                            {/* Icon Container */}
                                            <div
                                                className={`overflow-hidden transition-all duration-500 ${isActive
                                                        ? "max-h-12 opacity-100 mb-4"
                                                        : "max-h-0 opacity-0 mb-0"
                                                    }`}
                                            >
                                                {itemIconUrl && (
                                                    <Image
                                                        src={itemIconUrl}
                                                        alt={
                                                            item.icon?.alternativeText ||
                                                            item.title
                                                        }
                                                        width={42}
                                                        height={38}
                                                    />
                                                )}
                                            </div>

                                            {item.title}
                                        </button>

                                        {/* Expandable Description */}
                                        <div
                                            id={`why-choose-panel-${item.id}`}
                                            role="tabpanel"
                                            aria-labelledby={`why-choose-tab-${item.id}`}
                                            className={`grid transition-[grid-template-rows] duration-700 ${isActive
                                                    ? "grid-rows-[1fr]"
                                                    : "grid-rows-[0fr]"
                                                }`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="text-xl tracking-[-0.48px] text-darkLight pb-[10px] transition-opacity duration-500">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {isActive ? (
                                            <div className="h-[1px] my-[6px] overflow-hidden bg-neutralLight">
                                                <div
                                                    className="h-[1px] bg-primaryDefault"
                                                    style={{
                                                        width: `${progressWidth}%`,
                                                        transition: "width 16ms linear",
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-[1px] my-[6px] bg-neutralLight" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column - Dual Image Container for Crossfade */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-full">
                            <div
                                className="relative w-full overflow-hidden"
                                style={{
                                    aspectRatio: "1 / 1",
                                    clipPath:
                                        "polygon(80px 0, 100% 0, 100% 100%, 0 100%, 0 80px)",
                                }}
                            >
                                {/* Previous Image - Fades Out */}
                                {previousImageUrl && (
                                    <Image
                                        key={`prev-${previousIndex}`}
                                        src={previousImageUrl}
                                        alt=""
                                        aria-hidden="true"
                                        fill
                                        className="object-cover absolute inset-0 opacity-0 pointer-events-none"
                                        style={{
                                            opacity: 1,
                                            animation: `fadeOut ${IMAGE_TRANSITION_MS}ms ease-in-out forwards`,
                                        }}
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                )}

                                {/* Current Image - Fades In */}
                                {currentImageUrl && (
                                    <Image
                                        key={`current-${activeIndex}`}
                                        src={currentImageUrl}
                                        alt={
                                            activeItem.image?.alternativeText ??
                                            activeItem.title
                                        }
                                        fill
                                        className="object-cover absolute inset-0"
                                        style={{
                                            opacity: previousImageUrl ? 0 : 1,
                                            animation: previousImageUrl
                                                ? `fadeIn ${IMAGE_TRANSITION_MS}ms ease-in-out forwards`
                                                : "none",
                                        }}
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        priority={activeIndex === 0}
                                    />
                                )}
                            </div>

                            <style jsx>{`
                                @keyframes fadeIn {
                                    from {
                                        opacity: 0;
                                    }
                                    to {
                                        opacity: 1;
                                    }
                                }

                                @keyframes fadeOut {
                                    from {
                                        opacity: 1;
                                    }
                                    to {
                                        opacity: 0;
                                    }
                                }

                                @media (prefers-reduced-motion: reduce) {
                                    @keyframes fadeIn {
                                        from {
                                            opacity: 1;
                                        }
                                        to {
                                            opacity: 1;
                                        }
                                    }

                                    @keyframes fadeOut {
                                        from {
                                            opacity: 1;
                                        }
                                        to {
                                            opacity: 1;
                                        }
                                    }
                                }
                            `}</style>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}