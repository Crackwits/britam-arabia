'use client';
import { useEffect } from 'react';
import Script from 'next/script';
import { useCookieConsent } from '@/components/lib/cookieconsent';

// Google tag (gtag.js) IDs: the script loads once (with the first ID) and each ID gets its own config
const GOOGLE_TAG_IDS = ['G-S6VWEXZ3MF', 'GTM-58WD4JJM'];

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

export default function Analytics() {
    const consent = useCookieConsent();
    const analytics = !!consent?.analytics;
    const marketing = !!consent?.marketing;

    // The tag stays loaded once a visitor has accepted; when they change their
    // choice later, pass it on so Google stops (or resumes) using cookies.
    useEffect(() => {
        window.gtag?.('consent', 'update', {
            analytics_storage: analytics ? 'granted' : 'denied',
            ad_storage: marketing ? 'granted' : 'denied',
            ad_user_data: marketing ? 'granted' : 'denied',
            ad_personalization: marketing ? 'granted' : 'denied',
        });
    }, [analytics, marketing]);

    // Nothing from Google loads until the visitor accepts analytics cookies
    if (!analytics) return null;

    return (
        <>
            {/* Google tag (gtag.js) */}
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_IDS[0]}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{analytics_storage:'granted',ad_storage:'${marketing ? 'granted' : 'denied'}',ad_user_data:'${marketing ? 'granted' : 'denied'}',ad_personalization:'${marketing ? 'granted' : 'denied'}'});gtag('js',new Date());${GOOGLE_TAG_IDS.map((id) => `gtag('config','${id}');`).join('')}`}</Script>
        </>
    );
}
