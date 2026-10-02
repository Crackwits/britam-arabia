'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLenis } from "@/components/providers/SmoothScrollProvider";


/* ------------------------------------------------------------------ *
 * Config
 * ------------------------------------------------------------------ */
const CONSENT_COOKIE = 'britam_cookie_consent';
const CONSENT_DAYS = 180;
const CONSENT_VERSION = 2; // bump to ask everyone again
const DEFAULT_OPTIONAL_ON = false; // true = toggles start ON (reference design)

const POLICY_URL = { en: '/en/cookies-policy', ar: '/ar/cookies-policy' };

// Cookies removed when a category is refused (add your real cookie names)
const COOKIES_BY_CATEGORY: Record<string, string[]> = {
    analytics: ['_ga', '_gid', '_gat', '_gat_gtag_*'],
    marketing: ['_fbp', 'fr', 'IDE', '_gcl_au'],
    functional: [],
};

/* ------------------------------------------------------------------ *
 * Types + texts
 * ------------------------------------------------------------------ */
type Lang = 'en' | 'ar';
type Cat = 'analytics' | 'marketing' | 'functional';
export type Consent = { v: number; necessary: true; analytics: boolean; marketing: boolean; functional: boolean; ts: string };

const CATS: Cat[] = ['analytics', 'marketing', 'functional'];

const TEXT = {
    en: {
        msg: 'This website uses cookies to provide you with a great user experience. By using it, you accept our ',
        policy: 'use of cookies',
        acceptAll: 'Accept all cookies',
        settings: 'Cookie settings',
        hide: 'Hide settings',
        necessaryOnly: 'Necessary cookies only',
        save: 'Save preferences',
        always: 'Always-on',
        necessary: ['Necessary', 'Necessary cookies help make a website usable by enabling basic functions like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.'],
        analytics: ['Analytics', 'Analytics cookies help website owners to understand how visitors interact with websites by collecting and reporting information anonymously.'],
        marketing: ['Marketing', 'Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third party advertisers.'],
        functional: ['Functional', 'Functional cookies remember your choices, such as language and display preferences, to give you a more personal experience.'],
    },
    ar: {
        msg: 'يستخدم هذا الموقع ملفات تعريف الارتباط (الكوكيز) لتقديم تجربة مستخدم رائعة لك. باستخدامك للموقع فإنك توافق على ',
        policy: 'استخدام ملفات تعريف الارتباط',
        acceptAll: 'قبول جميع الكوكيز',
        settings: 'إعدادات الكوكيز',
        hide: 'إخفاء الإعدادات',
        necessaryOnly: 'الكوكيز الضرورية فقط',
        save: 'حفظ التفضيلات',
        always: 'مفعّلة دائماً',
        necessary: ['ضرورية', 'تساعد الكوكيز الضرورية في جعل الموقع قابلاً للاستخدام من خلال تمكين الوظائف الأساسية مثل التنقل بين الصفحات والوصول إلى المناطق الآمنة. لا يمكن للموقع أن يعمل بشكل صحيح بدونها.'],
        analytics: ['التحليلات', 'تساعد كوكيز التحليلات أصحاب الموقع على فهم كيفية تفاعل الزوار مع الموقع من خلال جمع المعلومات والإبلاغ عنها بشكل مجهول الهوية.'],
        marketing: ['التسويق', 'تُستخدم كوكيز التسويق لتتبع الزوار عبر المواقع. والهدف هو عرض إعلانات مناسبة وجذابة لكل مستخدم، وبالتالي أكثر قيمة للناشرين والمعلنين.'],
        functional: ['الوظيفية', 'تتذكر الكوكيز الوظيفية اختياراتك مثل اللغة وخيارات العرض لتمنحك تجربة أكثر خصوصية.'],
    },
} as const;

/* ------------------------------------------------------------------ *
 * Cookie helpers (client only – never call during server render)
 * ------------------------------------------------------------------ */
export function setCookie(name: string, value: string, days?: number) {
    if (typeof document === 'undefined') return;
    let c = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
    if (days) c += `; max-age=${days * 86400}; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`;
    if (location.protocol === 'https:') c += '; Secure';
    document.cookie = c;
}

export function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const key = `${encodeURIComponent(name)}=`;
    const hit = document.cookie.split('; ').find((p) => p.startsWith(key));
    if (!hit) return null;
    try { return decodeURIComponent(hit.slice(key.length)); } catch { return hit.slice(key.length); }
}

export function deleteCookie(name: string, domain?: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${domain ? `; domain=${domain}` : ''}`;
}

export function getConsent(): Consent | null {
    const raw = getCookie(CONSENT_COOKIE);
    if (!raw) return null;
    try {
        const c = JSON.parse(raw);
        return c.v === CONSENT_VERSION ? c : null;
    } catch { return null; }
}

export function hasConsent(cat: 'necessary' | Cat): boolean {
    if (cat === 'necessary') return true;
    return !!getConsent()?.[cat];
}

/** Call from anywhere (e.g. footer link) to reopen the settings. */
export function openCookieSettings() {
    window.dispatchEvent(new Event('britam:open-cookie-settings'));
}

/** Hook: returns the current consent (null until the user chooses). Use it to load GA, pixels, etc. */
export function useCookieConsent() {
    const [consent, setConsent] = useState<Consent | null>(null);
    useEffect(() => {
        setConsent(getConsent());
        const on = (e: Event) => setConsent((e as CustomEvent<Consent>).detail);
        window.addEventListener('britam:cookie-consent', on);
        return () => window.removeEventListener('britam:cookie-consent', on);
    }, []);
    return consent;
}

function clearCategoryCookies(cat: Cat) {
    const names = COOKIES_BY_CATEGORY[cat] || [];
    const host = location.hostname;
    const domains = [undefined, host, '.' + host.replace(/^www\./, '')];
    const existing = document.cookie ? document.cookie.split('; ').map((p) => decodeURIComponent(p.split('=')[0])) : [];
    names.forEach((pattern) => {
        const wild = pattern.endsWith('*');
        const prefix = wild ? pattern.slice(0, -1) : pattern;
        existing.forEach((n) => {
            if (wild ? n.startsWith(prefix) : n === prefix) domains.forEach((d) => deleteCookie(n, d));
        });
    });
}

export function useLockBodyScroll(locked: boolean) {
    const lenis = useLenis();

    useEffect(() => {
        if (!locked) return;

        // Pause Lenis's own scroll handling while the modal is open
        lenis?.stop();

        // Also lock native scroll as a fallback (e.g. before Lenis mounts)
        const { style: htmlStyle } = document.documentElement;
        const { style: bodyStyle } = document.body;
        const prevHtmlOverflow = htmlStyle.overflow;
        const prevBodyOverflow = bodyStyle.overflow;
        htmlStyle.overflow = "hidden";
        bodyStyle.overflow = "hidden";

        return () => {
            lenis?.start();
            htmlStyle.overflow = prevHtmlOverflow;
            bodyStyle.overflow = prevBodyOverflow;
        };
    }, [locked, lenis]);
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */
export default function CookieConsent({ locale }: { locale?: Lang }) {
    const pathname = usePathname();
    const lang: Lang = locale ?? (pathname?.startsWith('/ar') ? 'ar' : 'en');
    const t = TEXT[lang];

    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false); // popup shown
    const [showSettings, setShowSettings] = useState(false);
    const [choices, setChoices] = useState<Record<Cat, boolean>>({
        analytics: DEFAULT_OPTIONAL_ON,
        marketing: DEFAULT_OPTIONAL_ON,
        functional: DEFAULT_OPTIONAL_ON,
    });
    useLockBodyScroll(visible);

    // Run only in the browser, after hydration
    useEffect(() => {
        const saved = getConsent();
        if (saved) {
            setChoices({ analytics: saved.analytics, marketing: saved.marketing, functional: saved.functional });
        } else {
            setVisible(true); // first visit -> show popup
        }
        setMounted(true);

        const reopen = () => {
            const c = getConsent();
            if (c) setChoices({ analytics: c.analytics, marketing: c.marketing, functional: c.functional });
            setShowSettings(true);
            setVisible(true);
        };
        window.addEventListener('britam:open-cookie-settings', reopen);
        return () => window.removeEventListener('britam:open-cookie-settings', reopen);
    }, []);

    const finish = useCallback((c: Record<Cat, boolean>) => {
        const consent: Consent = { v: CONSENT_VERSION, necessary: true, ...c, ts: new Date().toISOString() };
        setCookie(CONSENT_COOKIE, JSON.stringify(consent), CONSENT_DAYS);
        CATS.forEach((cat) => { if (!c[cat]) clearCategoryCookies(cat); });

        // Google Consent Mode v2 (ignored if gtag isn't on the page)
        const w = window as unknown as { gtag?: (...a: unknown[]) => void };
        if (typeof w.gtag === 'function') {
            w.gtag('consent', 'update', {
                analytics_storage: c.analytics ? 'granted' : 'denied',
                ad_storage: c.marketing ? 'granted' : 'denied',
                ad_user_data: c.marketing ? 'granted' : 'denied',
                ad_personalization: c.marketing ? 'granted' : 'denied',
                functionality_storage: c.functional ? 'granted' : 'denied',
            });
        }

        window.dispatchEvent(new CustomEvent('britam:cookie-consent', { detail: consent }));
        setChoices(c);
        setShowSettings(false);
        setVisible(false);
    }, []);

    if (!mounted) return null; // avoids hydration mismatch

    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const linkBtn =
        'border-b border-current pb-0.5 text-sm font-medium text-darkDefault hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primaryDefault';

    // Small tab after the user has chosen
    //   if (!visible) {
    //     return (
    //       <button
    //         type="button"
    //         dir={dir}
    //         onClick={() => { setShowSettings(true); setVisible(true); }}
    //         className="fixed bottom-2 left-2 z-[9999] border-b-2 border-[#d9a95f] bg-[#efefef] px-3 py-1.5 text-sm text-[#7a5200] shadow-md sm:bottom-4 sm:left-4"
    //       >
    //         {t.settings}
    //       </button>
    //     );
    //   }
    if (visible) {
        return (
            <div
                role="dialog"
                aria-label={t.settings}
                dir={dir}
                lang={lang}
                data-lenis-prevent="true"
                className="fixed bottom-2 left-2 z-[9999] max-h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-[620px] overflow-y-auto bg-neutralLighter p-4 text-darkDefault shadow-[0_6px_28px_rgba(0,0,0,0.28)] sm:bottom-4 sm:left-4 sm:max-h-[calc(100vh-2rem)] sm:w-[calc(100vw-2rem)]"
            >
                <p className="mb-6 text-sm">
                    {t.msg}
                    <a href={POLICY_URL[lang]} className="border-b border-current pb-px">{t.policy}</a>
                </p>

                {showSettings && (
                    <div className="-mt-1 mb-4 border-t border-neutralLight">
                        {/* Necessary */}
                        <div className="flex items-start justify-between gap-4 border-b border-neutralLight py-4">
                            <div>
                                <h4 className="mb-1 text-sm font-medium">{t.necessary[0]}</h4>
                                <p className="text-xs">{t.necessary[1]}</p>
                            </div>
                            <span className="shrink-0 whitespace-nowrap pt-1 text-xs uppercase">{t.always}</span>
                        </div>

                        {CATS.map((cat, i) => (
                            <div key={cat} className={`flex items-start justify-between gap-4 py-4 ${i < CATS.length - 1 ? 'border-b border-neutralLight' : ''}`}>
                                <div>
                                    <h4 className="mb-1 text-sm font-medium">{t[cat][0]}</h4>
                                    <p className="text-xs">{t[cat][1]}</p>
                                </div>
                                <label className="relative mt-0.5 inline-flex h-[30px] w-[50px] shrink-0 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={choices[cat]}
                                        onChange={(e) => setChoices((p) => ({ ...p, [cat]: e.target.checked }))}
                                        aria-label={t[cat][0]}
                                    />
                                    <span className="absolute inset-0 rounded-full bg-neutralLight transition-colors peer-checked:bg-primaryDefault peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#2b2b2b]" />
                                    <span className="absolute start-1 top-1 h-[22px] w-[22px] rounded-full bg-white transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
                                </label>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap gap-x-6 gap-y-3">
                    <button type="button" className={linkBtn} onClick={() => finish({ analytics: true, marketing: true, functional: true })}>
                        {t.acceptAll}
                    </button>
                    <button
                        type="button"
                        className={`${linkBtn} !text-primaryDefault`}
                        aria-expanded={showSettings}
                        onClick={() => setShowSettings((s) => !s)}
                    >
                        {showSettings ? t.hide : t.settings}
                    </button>
                    <button type="button" className={linkBtn} onClick={() => finish({ analytics: false, marketing: false, functional: false })}>
                        {t.necessaryOnly}
                    </button>
                    {showSettings && (
                        <button type="button" className={linkBtn} onClick={() => finish(choices)}>
                            {t.save}
                        </button>
                    )}
                </div>
            </div>
        );
    }
}