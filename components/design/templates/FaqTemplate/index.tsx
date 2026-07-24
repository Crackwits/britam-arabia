'use client';

import { FAQAttributes } from '@/components/lib/types';
import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import Navbar from "../../organisms/layout/Navbar";
import FAQItem from '../../organisms/sections/FaqItem';

interface FAQProps {
    data: FAQAttributes;
    lang: string;
    allowMultipleOpen?: boolean;
    defaultOpenId?: number | null;
}

export default function FAQTemplate({ data, lang, allowMultipleOpen = false, defaultOpenId }: FAQProps) {
    const { title, subtitle, faqs } = data;
    const isArabic = lang === 'ar';
    const locale: "ar" | "en" = lang === "ar" ? "ar" : "en";
    const [activeSection, setActiveSection] = useState('');
    const [visibleSections, setVisibleSections] = useState(new Set());
    const [scrollProgress, setScrollProgress] = useState(0);

    // Refs for sections
    const pagecontentRef = useRef<HTMLElement | null>(null);
    const initialOpenId = defaultOpenId !== undefined ? defaultOpenId : faqs[0]?.id ?? null;
    const [openIds, setOpenIds] = useState<Set<number>>(
        initialOpenId !== null ? new Set([initialOpenId]) : new Set()
    );

    const handleToggle = (id: number) => {
        setOpenIds((prev) => {
            const next = new Set(allowMultipleOpen ? prev : []);
            if (prev.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    if (!faqs || faqs.length === 0) {
        return null;
    }

    return (
        <>
            <Navbar activeSection={activeSection} lang={lang} />
            <section ref={pagecontentRef} id="pagecontent" aria-labelledby="faq-heading" className='pt-21'>
                <div className="pb-20 px-4 w-full bg-white pt-15 overflow-hidden">
                    <div className="max-w-5xl mx-auto">
                        <div>
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


                        <div className="border-t border-neutralLight">
                            {faqs.map((item) => (
                                <FAQItem
                                    key={item.id}
                                    item={item}
                                    isArabic={isArabic}
                                    isOpen={openIds.has(item.id)}
                                    onToggle={handleToggle}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}