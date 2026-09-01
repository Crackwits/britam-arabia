'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';

interface WhatsAppInquiryContextValue {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

const WhatsAppInquiryContext = createContext<WhatsAppInquiryContextValue | null>(null);

export function useWhatsAppInquiry() {
    const ctx = useContext(WhatsAppInquiryContext);
    if (!ctx) {
        throw new Error('useWhatsAppInquiry must be used inside <WhatsAppInquiryProvider>');
    }
    return ctx;
}

export function WhatsAppInquiryProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    // Remember whatever element opened the dialog so focus can go back to it
    const openerRef = useRef<HTMLElement | null>(null);

    const open = useCallback(() => {
        openerRef.current = document.activeElement as HTMLElement | null;
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        // Restore focus to the trigger (footer icon or floating button)
        requestAnimationFrame(() => openerRef.current?.focus());
    }, []);

    const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

    return (
        <WhatsAppInquiryContext.Provider value={value}>
            {children}
        </WhatsAppInquiryContext.Provider>
    );
}