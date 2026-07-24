'use client';

import { WhatYouGetItem } from "@/components/lib/types";

interface FAQItemProps {
    item: WhatYouGetItem;
    isArabic:boolean;
    isOpen: boolean;
    onToggle: (id: number) => void;
}

export default function FAQItem({ item,isArabic, isOpen, onToggle }: FAQItemProps) {
    const panelId = `faq-panel-${item.id}`;
    const buttonId = `faq-trigger-${item.id}`;

    return (
        <div className="border-b border-neutralLight last:border-b-0">
            <h3>
                <button
                    id={buttonId}
                    type="button"
                    onClick={() => onToggle(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full justify-between gap-6 py-5"
                >
                    <h3 className={`${isArabic ? "text-right" : "text-left"} text-2xl  font-medium text-richNavy tracking-[-0.48px] pb-2`}>
                        {item.title}
                    </h3>
                    <span
                        aria-hidden="true"
                        className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-neutralLight text-neutralLight transition-transform duration-300 ease-out"
                        style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </span>
                </button>
            </h3>

            <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`${isArabic ? "text-right" : "text-left"} grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
            >
                <div className="overflow-hidden">
                    <p
                        className={`${isArabic ? "text-right" : "text-left"} pb-5 text-sm font-medium tracking-[0.84px] text-darkLight`}>

                        {item.description}
                    </p>
                </div>
            </div>
        </div>
    );
}