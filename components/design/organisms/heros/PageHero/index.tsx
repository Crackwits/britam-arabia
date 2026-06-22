"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CoverType, HomePageAttributes } from "@/components/lib/types";
import { STRAPI_URL } from "@/components/lib/settings";
interface PageHeroProps {
    image: CoverType | null;
    title: string;
}

const getMediaUrl = (url?: string) =>
    url ? `${STRAPI_URL}${url}` : "";

const isVideo = (mime?: string, url?: string): boolean => {
    if (mime) return mime.startsWith("video/");
    if (url) return /\.(mp4|webm|ogg|mov)$/i.test(url);
    return false;
};

export default function PageHero({ image, title }: PageHeroProps) {
    const mediaUrl = getMediaUrl(image?.url);
    const mediaIsVideo = isVideo(image?.mime, image?.url);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80);
        return () => clearTimeout(t);
    }, []);

    return (
        <section className="relative h-screen w-full overflow-hidden flex items-end" aria-label="Hero">

            {/* z-0 — background media: parent must be relative/absolute for fill to work */}
            <div className="absolute inset-0 z-0">
                {mediaIsVideo ? (
                    <video
                        className="h-full w-full object-cover"
                        src={mediaUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        aria-hidden="true"
                    />
                ) : mediaUrl ? (
                    // Parent div is absolute (non-static) so fill is valid here
                    <Image
                        src={mediaUrl}
                        alt={image?.alternativeText ?? "Hero background"}
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                ) : null}
            </div>

            {/* z-10 — dark overlay */}
            <div className="absolute inset-0 z-10 bg-black/50" aria-hidden="true" />
            <div className="relative z-10 py-9 md:py-16 px-4 max-w-7xl mx-auto w-full">
                <div className="max-w-[730px] w-full">
                    <h1
                        className={[
                            "text-white font-medium tracking-[-1.92px] pb-8",
                            "text-4xl sm:text-5xl lg:text-7xl",
                            "transition-all duration-700 ease-out",
                            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                        ].join(" ")}
                    >
                        {title}
                    </h1>
                </div>
            </div>
        </section>
    );
}