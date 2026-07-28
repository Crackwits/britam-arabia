"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Capabilities, MediaItem } from "@/components/lib/types";
import { STRAPI_URL } from "@/components/lib/settings";
import Link from "next/link";
import HeadingTriangle from "@/public/svg/headingtriangle";

interface Props {
    lang: string;
    isArabic: boolean;
    services_entry_heading: string;
    services_entry_subheading: string;
    services_entry_items: Capabilities[];
}

const getMediaUrl = (url?: string) => (url ? `${STRAPI_URL}${url}` : "");

interface CardProps {
    item: Capabilities;
    index: number;
    isArabic: boolean;
    lang: string;
    visible: boolean;

    // ── New: uniform image-height synchronization ──
    // Shared height (px) computed by the parent from the smallest
    // available image area across all cards. `null` until the first
    // measurement completes, in which case the card falls back to its
    // original flex-1/min-h-0 sizing — no hardcoded height is ever used.
    imageHeight: number | null;
    // Callback refs so the parent can measure this card's root element
    // and its text block without the card owning any measurement logic.
    cardRef: (el: HTMLElement | null) => void;
    textBlockRef: (el: HTMLDivElement | null) => void;
    // Fired on image load/error so the parent knows when every card's
    // image has a real, rendered box worth measuring.
    onImageLoad: () => void;
}

/* ──────────────────────────────────────────────────────────
   Card — same visual structure/animations as the original.
   Its own fade/slide-in stagger transform lives on this element,
   completely independent from the horizontal scroll transform
   that is applied to its parent track. The two transforms never
   collide because they sit on different nodes.

   The only functional additions are: a ref on the card root and on
   the text block (purely for the parent's height measurement), and
   an explicit height applied to the image container once the parent
   has computed a shared value.
────────────────────────────────────────────────────────── */
function ServiceCard({
    item,
    index,
    isArabic,
    lang,
    visible,
    imageHeight,
    cardRef,
    textBlockRef,
    onImageLoad,
}: CardProps) {
    const imageUrl = getMediaUrl(item.image?.url);
    const isEven = index % 2 === 0;

    return (
        <motion.article
            ref={cardRef}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className={[
                "group flex flex-col flex-shrink-0 transition-all duration-700 ease-out h-full",
                // fixed/responsive card width for the horizontal track
                "w-[88vw] sm:w-[70vw] lg:w-[520px]",
                index === 0
                    ? "delay-[0ms]"
                    : index === 1
                    ? "delay-[150ms]"
                    : index === 2
                    ? "delay-[300ms]"
                    : "delay-[450ms]",
                visible
                    ? "opacity-100 translate-x-0"
                    : isEven
                    ? "opacity-0 -translate-x-8"
                    : "opacity-0 translate-x-8",
            ].join(" ")}
        >
            <Link
                href={`/${lang}/capabilities/${item.slug}`}
                className={[
                    "relative w-full overflow-hidden flex-shrink-0",
                    // Pre-measurement fallback: same flex-1/min-h-0 behavior
                    // as the original, so nothing shifts before the shared
                    // height is known. Once imageHeight is set we switch to
                    // an explicit px height and stop stretching to fill the
                    // remaining card space.
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
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    onLoad={onImageLoad}
                    onError={onImageLoad}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
            </Link>

            <div ref={textBlockRef} className="mt-4 flex flex-col flex-shrink-0">
                <Link href={`/${lang}/capabilities/${item.slug}`}>
                    <h3 className="text-2xl font-medium tracking-[-0.48px] text-richNavy mb-1">
                        {item.title}
                    </h3>
                    <p className="text-base text-darkLight mb-4">{item.description}</p>
                </Link>
                <Link
                    href={`/${lang}/capabilities/${item.slug}`}
                    className="pb-2 uppercase group inline-flex items-center gap-2 text-darkDefault font-medium tracking-[0.84px] text-sm transition-transform duration-200 focus:outline-none focus-visible:underline"
                >
                    {isArabic ? "استكشف" : "Explore"}
                    <span
                        className={[
                            "transition-transform duration-300 ease-out",
                            isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1",
                        ].join(" ")}
                        aria-hidden="true"
                    >
                        {isArabic ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        )}
                    </span>
                </Link>
                <span className="w-12 h-[1px] bg-[#ED0000] block" aria-hidden="true" />
            </div>
        </motion.article>
    );
}

// Height of the fixed/sticky site navbar in px. The whole pinned block
// (heading + carousel) sticks at `top: NAVBAR_HEIGHT` so it sits directly
// below the navbar instead of underneath it. Adjust this to match your
// actual navbar height (check it in devtools — it may also differ between
// mobile/desktop navbar layouts, in which case swap this for a small
// resize-aware measurement).
const NAVBAR_HEIGHT = 100;

export default function ServicesEntry({
    lang,
    isArabic,
    services_entry_heading,
    services_entry_subheading,
    services_entry_items,
}: Props) {
    // The spacer/pin element — gets the expanded height and the sticky
    // child. useScroll below targets this, not the whole section, so
    // scrollYProgress covers just the pinned portion.
    const pinRef = useRef<HTMLDivElement>(null);

    // The flex row that holds all the cards. We measure its natural
    // (unclipped) width via `scrollWidth` — overflow-hidden on an
    // ancestor doesn't affect this measurement.
    const trackRef = useRef<HTMLDivElement>(null);

    // Static (never transformed) wrapper around the track, constrained to
    // the same max-w-7xl/mx-auto/px-4 box as the heading. Its left edge
    // tells us how far the track's starting position is inset from the
    // viewport edge — without this the translation math assumes the track
    // starts flush at x:0, which is wrong on any screen wide enough for
    // the centered max-w-7xl gutter, and the last card ends up short of
    // the viewport edge.
    const trackOffsetRef = useRef<HTMLDivElement>(null);

    // Small sentinel used purely for the heading/stagger reveal,
    // fired once as the section first enters the viewport — kept
    // separate from the scroll-linked horizontal transform.
    const revealRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    const [trackWidth, setTrackWidth] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(0);
    const [edgeOffset, setEdgeOffset] = useState(0);

    // ── Uniform image-height synchronization ──
    // Per-card refs to the card root and the text block beneath its
    // image. Plain mutable arrays (not state) since they're just DOM
    // handles — only the derived height value below goes into state.
    const cardRefs = useRef<(HTMLElement | null)[]>([]);
    const textBlockRefs = useRef<(HTMLDivElement | null)[]>([]);

    // The single shared height (px) applied to every card's image
    // container. Stays `null` (→ original flex-1/min-h-0 behavior) until
    // the first successful measurement, so no hardcoded fallback height
    // is ever introduced.
    const [imageHeight, setImageHeight] = useState<number | null>(null);

    // How many of the current items' images have finished loading (or
    // errored). We only measure once every image has a real, rendered
    // box — measuring earlier would just capture placeholder/empty state.
    const loadedCountRef = useRef(0);

    // Computes, for every card, the space left for its image once its own
    // text block is accounted for (card height − text height − the text
    // block's top margin), then takes the smallest of those values and
    // applies it to every card. Cards whose text is shorter simply end up
    // with a bit of breathing room below the text — the card itself stays
    // the same total height either way, since that height is already fixed
    // by the track's `items-stretch` layout, independent of this image
    // height. Cards with the longest text are what set the ceiling.
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
            // Wait two frames so layout (reveal transitions, font swap
            // reflow, etc.) has fully settled before we measure — measuring
            // mid-transition would capture a transient height.
            requestAnimationFrame(() => requestAnimationFrame(recalcImageHeight));
        }
    }, [services_entry_items.length, recalcImageHeight]);

    // Reset load tracking and the computed height whenever the set of
    // items changes, so a new content set is measured from scratch instead
    // of inheriting a stale height from the previous items. Also covers
    // the case where images are served from cache (onLoad still fires on
    // a freshly-mounted <img>, but this guards against any edge case where
    // it doesn't) by scheduling a fallback measurement.
    useEffect(() => {
        loadedCountRef.current = 0;
        setImageHeight(null);
        const fallback = requestAnimationFrame(() =>
            requestAnimationFrame(recalcImageHeight),
        );
        return () => cancelAnimationFrame(fallback);
    }, [services_entry_items, recalcImageHeight]);

    // Re-measure on window resize and whenever the track's own box size
    // changes (breakpoint shifts change card width, which changes text
    // wrapping, which changes text height, which changes available image
    // height).
    useEffect(() => {
        const onResize = () => recalcImageHeight();
        window.addEventListener("resize", onResize);

        const resizeObserver = new ResizeObserver(() => recalcImageHeight());
        if (trackRef.current) resizeObserver.observe(trackRef.current);

        return () => {
            window.removeEventListener("resize", onResize);
            resizeObserver.disconnect();
        };
    }, [recalcImageHeight]);

    // ── Reveal animation (heading + card stagger), same as original ──
    useEffect(() => {
        const el = revealRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // ── Measure track + viewport widths, react to resize ──
    const updateMeasurements = useCallback(() => {
        if (trackRef.current) {
            setTrackWidth(trackRef.current.scrollWidth);
        }
        if (trackOffsetRef.current) {
            setEdgeOffset(trackOffsetRef.current.getBoundingClientRect().left);
        }
        setViewportWidth(window.innerWidth);
    }, []);

    useEffect(() => {
        updateMeasurements();

        // ResizeObserver catches track-width changes (breakpoint shifts,
        // font loading, item count changes) that a plain resize listener
        // on `window` would miss.
        const resizeObserver = new ResizeObserver(() => updateMeasurements());
        if (trackRef.current) resizeObserver.observe(trackRef.current);

        window.addEventListener("resize", updateMeasurements);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateMeasurements);
        };
    }, [updateMeasurements, services_entry_items]);

    // Horizontal distance the track has to travel so its last card
    // ends up flush with the edge of the viewport. `edgeOffset` accounts
    // for the track's starting inset inside the centered max-w-7xl box —
    // without it the last card stops short by exactly that inset.
    const scrollDistance = Math.max(trackWidth + edgeOffset - viewportWidth, 0);

    // Only pin/hijack scroll when there's actually excess width to
    // travel (e.g. mobile with few cards may not need it at all).
    const isCarousel = scrollDistance > 0;

    // ── Scroll-linked horizontal transform ──
    // offset ["start start", "end end"] maps scrollYProgress 0→1 across
    // exactly the extra height we add to the section below, so the
    // sticky child stays pinned for precisely as long as the track
    // needs to finish translating.
    const { scrollYProgress } = useScroll({
        target: pinRef,
        offset: ["start start", "end end"],
    });

    const rawX = useTransform(
        scrollYProgress,
        [0, 1],
        isArabic ? [0, scrollDistance] : [0, -scrollDistance],
    );

    // Light spring smoothing keeps the motion buttery at 60fps without
    // decoupling it from scroll position (it still tracks scrollYProgress,
    // just with inertia instead of 1:1 snapping).
    const x = useSpring(rawX, { stiffness: 300, damping: 40, mass: 0.2 });

    // ── Heading block, reused both inside and outside the pinned view ──
    const heading = (
        <div ref={revealRef} className="px-4 mx-auto max-w-7xl w-full">
            {services_entry_subheading && (
                <div className="inline-flex gap-2 mb-4" aria-hidden="false">
                    <HeadingTriangle />
                    <span className="text-primaryDefault text-xl md:text-lg font-medium uppercase">
                        {services_entry_subheading}
                    </span>
                </div>
            )}

            <h2
                id="services-entry-heading"
                className={[
                    "text-navy900 font-medium tracking-[-1.92px] pb-4 text-4xl lg:text-5xl",
                    "transition-all duration-700 ease-out",
                    visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
                ].join(" ")}
            >
                {services_entry_heading}
            </h2>
        </div>
    );

    return (
        <section className="relative w-full bg-white">
            {/* ── Pin spacer ──
                Its height is expanded by scrollDistance so scrolling
                through it drives the horizontal translate below. Once
                scrollYProgress hits 1, the sticky child releases and
                normal scrolling resumes for whatever comes after.

                The heading now lives INSIDE this pinned block (when it's
                actually pinned) so it sticks in place together with the
                carousel instead of scrolling past it. The card track is
                a flex-1/min-h-0 child underneath it, so it automatically
                fills whatever height is left in the viewport once the
                heading has taken its share — no manual height math needed. */}
            <div
                ref={pinRef}
                className="relative w-full"
                style={
                    isCarousel
                        ? { height: `calc(100vh - ${NAVBAR_HEIGHT}px + ${scrollDistance}px)` }
                        : undefined
                }
            >
                <div
                    className={[
                        "flex flex-col py-4 md:py-8",
                        isCarousel ? "sticky overflow-hidden" : "",
                    ].join(" ")}
                    // pt-15 md:pt-25 pb-6 md:pb-10
                    style={
                        isCarousel
                            ? { top: `${NAVBAR_HEIGHT}px`, height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }
                            : undefined
                    }
                >
                    {/* Sticky heading — shrink-0 so it keeps its natural
                        height and never gets squashed by the flex-1 track
                        below it. */}
                    <div className="shrink-0">{heading}</div>

                    {/* ── Horizontal track ──
                        flex-1/min-h-0 makes this fill exactly whatever
                        vertical space remains under the heading, inside
                        the fixed `100vh - NAVBAR_HEIGHT` sticky box.
                        trackOffsetRef is the static reference box (same
                        mx-auto/max-w-7xl/px-4 inset as the heading) used only
                        to measure edgeOffset — it never receives a transform,
                        so its position stays reliable at any scroll progress.
                        The inner motion.div is what actually translates; its
                        content is free to overflow past the box on both sides,
                        which is what lets cards travel edge-to-edge. */}
                    <div className="flex-1 min-h-0 px-4 mt-6">
                        <div
                            ref={trackOffsetRef}
                            className="mx-auto max-w-7xl w-full h-full flex items-stretch"
                        >
                            <motion.div
                                ref={trackRef}
                                style={isCarousel ? { x } : undefined}
                                className={[
                                    // Always non-wrapping: scrollWidth must reflect the
                                    // true, unwrapped width of every card so scrollDistance
                                    // can be measured correctly. Tailwind's `flex` is
                                    // nowrap by default, but we set it explicitly so a
                                    // stray `flex-wrap` never sneaks back in here.
                                    "flex flex-nowrap items-stretch gap-8 h-full",
                                    isArabic ? "flex-row-reverse" : "flex-row",
                                ].join(" ")}
                            >
                                {services_entry_items.map((item, index) => (
                                    <ServiceCard
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        isArabic={isArabic}
                                        lang={lang}
                                        visible={visible}
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
                                {/* Trailing spacer — appended last so it always ends
                                    up as the outer bookend in the scroll direction
                                    (right-most for LTR, left-most under
                                    flex-row-reverse for RTL). Counted automatically
                                    in trackRef's scrollWidth, so scrollDistance
                                    already accounts for it — no extra math needed. */}
                                <div className="flex-shrink-0 w-4 sm:w-6 lg:w-8" aria-hidden="true" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}