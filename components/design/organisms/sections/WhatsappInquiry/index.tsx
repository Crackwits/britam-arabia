'use client';

import React, {
    useEffect,
    useRef,
    useState,
    type MouseEvent,
    type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useWhatsAppInquiry } from '../WhatsAppInquiryProvider';

type Language = 'en' | 'ar';
type InquiryIcon = 'lightning' | 'people';

const BRAND = '#0034A5';

interface WhatsAppInquiryProps {
    businessPhone?: string;
    /** Recruitment goes to email (CV submissions) rather than WhatsApp */
    recruitmentEmail?: string;
    businessMessage?: string;
    recruitmentSubject?: string;
    language?: Language;
    /** Tailwind position utilities for the floating button, e.g. "bottom-8 right-8" */
    buttonPosition?: string;
    showBadge?: boolean;
    hideAfterDelay?: number | null;
}

const translations = {
    en: {
        buttonLabel: 'Open WhatsApp inquiry',
        title: 'WhatsApp Inquiry',
        headerNote: "We'll get back to you shortly",
        subtitle: 'How can we help you?',
        newBusiness: 'New Business',
        businessDesc: 'Inquire about our services',
        recruitment: 'Recruitment',
        recruitmentDesc: 'Explore career opportunities with us',
        closeBtn: 'Close',
        closeLabel: 'Close dialog',
        footer: '💬 Reply time: usually within 1–2 hours',
    },
    ar: {
        buttonLabel: 'فتح استفسار واتساب',
        title: 'استفسار واتساب',
        headerNote: 'سنرد عليك قريبًا',
        subtitle: 'كيف يمكننا مساعدتك؟',
        newBusiness: 'أعمال جديدة',
        businessDesc: 'استفسر عن منتجاتنا وخدماتنا',
        recruitment: 'التوظيف',
        recruitmentDesc: 'استكشف فرص الوظائف لدينا',
        closeBtn: 'إغلاق',
        closeLabel: 'إغلاق النافذة',
        footer: '💬 وقت الرد: عادة خلال ١-٢ ساعة',
    },
} as const;

const WhatsAppInquiry: React.FC<WhatsAppInquiryProps> = ({
    businessPhone = '1234567890',
    recruitmentEmail = 'cv@britamarabia.com',
    businessMessage = 'Hi, I am interested in your business services.',
    recruitmentSubject = 'Career opportunities at Britam Arabia',
    language = 'en',
    buttonPosition = 'bottom-8 right-8',
    showBadge = false,
    hideAfterDelay = null,
}) => {
    // Open state lives in the provider so the footer icon can trigger the same dialog
    const { isOpen, open, close } = useWhatsAppInquiry();

    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    const isArabic = language === 'ar';
    const direction = isArabic ? 'rtl' : 'ltr';
    const t = translations[language];

    // Portal target is only available on the client
    useEffect(() => setIsMounted(true), []);

    // ESC to close
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, close]);

    // Lock background scroll while the dialog is open
    useEffect(() => {
        if (!isOpen) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isOpen]);

    // Move focus into the dialog. Returning focus to whatever opened it
    // (floating button or footer icon) is handled by the provider.
    useEffect(() => {
        if (isOpen) closeRef.current?.focus();
    }, [isOpen]);

    // Keep Tab focus inside the dialog
    const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Tab' || !dialogRef.current) return;

        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    // Auto-hide the launcher, but never while the dialog is open.
    // The footer icon keeps working after the launcher disappears.
    useEffect(() => {
        if (!hideAfterDelay || isOpen) return;

        const timer = setTimeout(() => setIsButtonVisible(false), hideAfterDelay);
        return () => clearTimeout(timer);
    }, [hideAfterDelay, isOpen]);

    const getWhatsAppLink = (phone: string, message: string) =>
        `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    const getMailtoLink = (email: string, subject: string) =>
        `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    const positionClass = isArabic
        ? 'bottom-8 left-8'//buttonPosition.replace('right-', 'left-')
        : buttonPosition;

    const dialog = (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 animate-fadeIn"
            onClick={(e: MouseEvent<HTMLDivElement>) => {
                if (e.target === e.currentTarget) close();
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="whatsapp-inquiry-title"
                dir={direction}
                onKeyDown={handleDialogKeyDown}
                className="w-full max-w-sm overflow-hidden bg-white shadow-2xl animate-slideUp"
            >
                {/* Header */}
                <div
                    className="px-6 py-5 bg-primaryDefault"
                // style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #003399 100%)` }}
                >
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 id="whatsapp-inquiry-title" className="text-lg font-medium text-white">
                                {t.title}
                            </h2>
                            <p className="mt-1 text-xs text-white">{t.headerNote}</p>
                        </div>
                        <button
                            ref={closeRef}
                            type="button"
                            onClick={close}
                            aria-label={t.closeLabel}
                            className="border-0 bg-transparent p-0 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
                        >

                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="space-y-3 p-6">
                    {/* <p className="mb-4 text-center text-sm font-medium text-gray-600">{t.subtitle}</p> */}

                    <InquiryOption
                        icon="lightning"
                        title={t.newBusiness}
                        description={t.businessDesc}
                        link={getWhatsAppLink(businessPhone, businessMessage)}
                        isArabic={isArabic}
                    />

                    <InquiryOption
                        icon="people"
                        title={t.recruitment}
                        description={t.recruitmentDesc}
                        link={getMailtoLink(recruitmentEmail, recruitmentSubject)}
                        isArabic={isArabic}
                        external={false}
                    />
                </div>

                {/* Footer */}
                <div className="border-t border-neutralLighter bg-white px-6 py-4">
                    <p className="text-center text-xs text-darkLight">{t.footer}</p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {isButtonVisible && (
                <button
                    type="button"
                    onClick={open}
                    aria-label={t.buttonLabel}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    className={`fixed ${positionClass} z-40 flex h-14 w-14 items-center justify-center rounded-full border-0 bg-transparent p-0 text-white shadow-lg outline-none ring-0 transition-transform duration-300 hover:scale-110 active:scale-95 focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0`}
                    style={{ backgroundColor: BRAND }}
                >
                    <svg width="32" height="32" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
                        <path d="M92 250C92 158 165 92 256 92H300C391 92 464 158 464 250C464 342 391 408 300 408H218L110 458L136 378C108 344 92 300 92 250Z" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="190" cy="250" r="12" fill="#FFFFFF" />
                        <circle cx="256" cy="250" r="12" fill="#FFFFFF" />
                        <circle cx="322" cy="250" r="12" fill="#FFFFFF" />
                    </svg>

                    {showBadge && (
                        <span
                            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
                            aria-hidden="true"
                        >
                            1
                        </span>
                    )}
                </button>
            )}

            {isOpen && isMounted ? createPortal(dialog, document.body) : null}

            <style>{`
                @keyframes waFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes waSlideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fadeIn { animation: waFadeIn 0.2s ease-out; }
                .animate-slideUp { animation: waSlideUp 0.25s ease-out; }
                @media (prefers-reduced-motion: reduce) {
                    .animate-fadeIn, .animate-slideUp { animation: none; }
                }
            `}</style>
        </>
    );
};

interface InquiryOptionProps {
    icon: InquiryIcon;
    title: string;
    description: string;
    link: string;
    isArabic: boolean;
    /** Open in a new tab (default). Set false for mailto: links. */
    external?: boolean;
}

// Record<InquiryIcon, ReactNode> avoids the global JSX namespace entirely.
const icons: Record<InquiryIcon, ReactNode> = {
    lightning: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    people: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 15H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
    ),
};

const InquiryOption: React.FC<InquiryOptionProps> = ({ icon, title, description, link, isArabic, external = true }) => (
    <a
        href={link}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group block border-1 border-neutralLighter p-4 transition-all duration-200 hover:border-[#0034A5] hover:shadow-md focus:outline-none focus-visible:border-[#0034A5] focus-visible:ring-2 focus-visible:ring-[#0034A5]"
    >
        <div className="flex items-start gap-3">
            {/* <div className="mt-1 flex-shrink-0" style={{ color: BRAND }}>
                {icons[icon]}
            </div> */}
            <div className="min-w-0 flex-1">
                <h3 className="font-medium text-primaryDefault text-base">
                    {title}
                </h3>
                <p className="mt-1 text-sm text-darkLight">{description}</p>
            </div>
            <svg
                className={`mt-1 h-5 w-5 flex-shrink-0 ${isArabic ? 'rotate-180' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ color: BRAND }}
                aria-hidden="true"
            >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
        </div>
    </a>
);

export default WhatsAppInquiry;