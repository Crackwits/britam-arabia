'use client';

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    type MouseEvent,
    type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type Language = 'en' | 'ar';
type InquiryIcon = 'lightning' | 'people';

const BRAND = '#0034A5';

interface WhatsAppInquiryProps {
    businessPhone?: string;
    recruitmentPhone?: string;
    businessMessage?: string;
    recruitmentMessage?: string;
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
        businessDesc: 'Inquire about our products and services',
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
    recruitmentPhone = '1234567890',
    businessMessage = 'Hi, I am interested in your business services.',
    recruitmentMessage = 'Hi, I am interested in career opportunities with your company.',
    language = 'en',
    buttonPosition = 'bottom-8 right-8',
    showBadge = false,
    hideAfterDelay = null,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    const isArabic = language === 'ar';
    const direction = isArabic ? 'rtl' : 'ltr';
    const t = translations[language];

    const close = useCallback(() => setIsOpen(false), []);

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

    // Move focus into the dialog, and back to the trigger when it closes
    useEffect(() => {
        if (isOpen) {
            closeRef.current?.focus();
        } else if (document.activeElement === document.body) {
            triggerRef.current?.focus();
        }
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

    // Auto-hide the launcher, but never while the dialog is open
    useEffect(() => {
        if (!hideAfterDelay || isOpen) return;

        const timer = setTimeout(() => setIsButtonVisible(false), hideAfterDelay);
        return () => clearTimeout(timer);
    }, [hideAfterDelay, isOpen]);

    const getWhatsAppLink = (phone: string, message: string) =>
        `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

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
                        link={getWhatsAppLink(recruitmentPhone, recruitmentMessage)}
                        isArabic={isArabic}
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
                    ref={triggerRef}
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label={t.buttonLabel}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    className={`fixed ${positionClass} z-40 flex h-14 w-14 items-center justify-center rounded-full border-0 bg-transparent p-0 text-white shadow-lg outline-none ring-0 transition-transform duration-300 hover:scale-110 active:scale-95 focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0`}
                    style={{ backgroundColor: BRAND }}
                >
                    <svg width="24" height="24" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
                        <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z" />
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

const InquiryOption: React.FC<InquiryOptionProps> = ({ icon, title, description, link, isArabic }) => (
    <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
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