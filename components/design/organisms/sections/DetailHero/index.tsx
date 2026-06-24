"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { STRAPI_URL } from "@/components/lib/settings";
import { CoverType } from "@/components/lib/types";

type DetailHeroProps = {
    subheading: string;
    heading: string;
    cover: CoverType;
};

export default function DetailHero({ subheading, heading, cover }: DetailHeroProps) {
    const headerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const header = headerRef.current;
        const image = imageRef.current;
        if (!header || !image) return;

        // Entrance animation via CSS class toggle
        requestAnimationFrame(() => {
            header.classList.add("hero-visible");
            setTimeout(() => {
                image.classList.add("image-visible");
            }, 200);
        });
    }, []);

    const getMediaUrl = (url?: string) =>
        url ? `${STRAPI_URL}${url}` : '';
    const imageUrl = getMediaUrl(cover?.url);

    return (
        <section className="w-full bg-white py-15 md:py-25 overflow-hidden">
            {/* Industry label + Project title */}
            <div
                ref={headerRef}
                className="max-w-5xl mx-auto px-4"
                aria-label="Project header"
            >
                <p className="font-base text-darkLight pb-3">
                    {subheading}
                </p>
                <h1 className="font-medium text-darkDefault pb-12 tracking-[-0.96px] text-4xl sm:text-5xl lg:text-6xl">
                    {heading}
                </h1>
            </div>

            <div className="md:max-w-7xl mx-auto md:px-4 mb-12">
                {/* Cover Image */}
                <div
                    ref={imageRef}
                    className="relative w-full aspect-[3/2] md:aspect-[5/2] overflow-hidden"
                >
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt={cover?.alternativeText || heading}
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                        />
                    )}
                </div>
            </div>
        </section>
    );
}