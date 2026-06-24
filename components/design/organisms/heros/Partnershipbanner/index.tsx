"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HomePageAttributes } from "@/components/lib/types";
import { STRAPI_URL } from "@/components/lib/settings";

interface PartnershipBannerProps {
    homedata: HomePageAttributes;
}

const getMediaUrl = (url?: string) =>
    url ? `${STRAPI_URL}${url}` : "";

export default function PartnershipBanner({ homedata }: PartnershipBannerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const partnerImageUrl = getMediaUrl(homedata.partner_image?.url);

    return (
        <section
            ref={ref}
            className="w-full bg-neutralLighter py-8 px-4"
            aria-label="Partnership"
        >
            <div
                className={[
                    "max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8",
                    "transition-all duration-700 ease-out",
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                ].join(" ")}
            >
                {/* Left: text */}
                <div className="flex-1 text-center md:rtl:text-right md:ltr:text-left order-2 md:order-1">
                    {homedata.partner_headline && (
                        <p className="text-darkDefault text-sm sm:text-2xl font-medium tracking-[-0.48] uppercase pb-2">
                            {homedata.partner_headline}
                        </p>
                    )}
                    {homedata.partner_subheadline && (
                        <p className="text-darkDefault text-xs sm:text-base max-w-[1000px] w-full">
                            {homedata.partner_subheadline}
                        </p>
                    )}
                </div>

                {/* Right: partner logo — width AND height both set, auto on the other axis via CSS */}
                {partnerImageUrl && (
                    <div className="flex-shrink-0 order-1 md:order-2">
                        <Image
                            src={partnerImageUrl}
                            alt={homedata.partner_image?.alternativeText ?? "Partner logo"}
                            width={180}
                            height={72}
                            style={{ width: "auto", height: "5rem" }}
                            className="object-contain"
                        />
                    </div>
                )}
            </div>
        </section>
    );
}