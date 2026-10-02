'use client';
import Script from 'next/script';
import { useCookieConsent } from '@/components/lib/cookieconsent';
export default function Analytics() {
    const consent = useCookieConsent();
    if (!consent?.analytics) return null;
    return (
        <>
            <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXX" strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-XXXX');`}</Script>
        </>
    );
}