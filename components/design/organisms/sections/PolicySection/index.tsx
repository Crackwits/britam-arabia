"use client";

import { title } from "process";
import { useEffect, useRef } from "react";
import { PrivacyPolicyAttributes, TermsAndConditionsAttributes, CookiePolicyAttributes } from "@/components/lib/types";

type PolicySectionProps = {
    data: PrivacyPolicyAttributes | TermsAndConditionsAttributes | CookiePolicyAttributes;
    lang: string;
};

export default function PolicySection({ data, lang }: PolicySectionProps) {
    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = contentRef.current;
        const header = headerRef.current;
        if (!header || !el) return;
        // Entrance animation via CSS class toggle
        requestAnimationFrame(() => {
            header.classList.add("hero-visible");
        });
        // Stagger-reveal each heading and paragraph
        const children = el.querySelectorAll("h3, p, strong");
        children.forEach((child, i) => {
            (child as HTMLElement).style.transitionDelay = `${i * 60}ms`;
            (child as HTMLElement).classList.add("content-block");
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("content-block-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );

        children.forEach((child) => observer.observe(child));

        return () => observer.disconnect();
    }, [data.content]);

    return (
        <section className="pb-20 px-4 w-full bg-white pt-15 overflow-hidden">
            <div className="max-w-5xl mx-auto">
                <div
                    ref={headerRef}
                    aria-label="Project header"
                >
                    {data.subtitle && (
                        <p className="font-base text-darkLight pb-3">
                            {data.subtitle}
                        </p>
                    )}
                    {data.title && (
                        <h1 className="font-medium text-darkDefault max-w-4xl pb-12 tracking-[-0.96px] text-4xl sm:text-5xl lg:text-6xl">
                            {data.title}
                        </h1>
                    )}
                </div>
                <div
                    ref={contentRef}
                    className="project-content"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                />
            </div>
        </section>
    );
}