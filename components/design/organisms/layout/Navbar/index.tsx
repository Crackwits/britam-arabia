'use client';

import { AnimatePresence, motion, type Variants, type Transition } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BritamWhite from '@/public/britam-white.svg';
import { usePathname } from 'next/navigation';
import { FACEBOOK_URL, INSTAGRAM_URL, TWITTER_URL, LINKEDIN_URL, YOUTUBE_URL } from '@/utils/consts';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = { activeSection: string; lang: string };

// ─── i18n — no external library needed ───────────────────────────────────────

const TRANSLATIONS: Record<string, Record<string, string>> = {
    en: {
        ourJourney: 'Our Journey',
        ourApproach: 'Our Approach',
        insights: 'Insights',
        lifeAtBritam: 'Life at Britam',
        inquireNow: 'Inquire Now',
        menu: 'Menu',
        openMenu: 'Open navigation menu',
        close: 'Close',
        followUs: 'Follow Us',
    },
    ar: {
        ourJourney: 'رحلتنا',
        ourApproach: 'نهجنا',
        insights: 'رؤى',
        lifeAtBritam: 'الحياة في بريتام',
        inquireNow: 'استفسر الآن',
        menu: 'القائمة',
        openMenu: 'فتح قائمة التنقل',
        close: 'إغلاق',
        followUs: 'تابعنا',
    },
};

function useT(lang: string) {
    return (key: string) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['en'][key] ?? key;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LOCALES = ['en', 'ar'] as const;
type Locale = (typeof LOCALES)[number];

const NAV_LINK_KEYS = [
    { key: 'ourJourney', href: '/our-journey' },
    { key: 'ourApproach', href: '/our-approach' },
    { key: 'insights', href: '/insights' },
    { key: 'lifeAtBritam', href: '/life-at-britam' },
] as const;

const SOCIAL_LINKS = [
    { icon: 'f', href: FACEBOOK_URL, label: 'Facebook' },
    { icon: 'ig', href: INSTAGRAM_URL, label: 'Instagram' },
    { icon: 'x', href: TWITTER_URL, label: 'X' },
    { icon: 'in', href: LINKEDIN_URL, label: 'LinkedIn' },
    { icon: 'yt', href: YOUTUBE_URL, label: 'YouTube' },
];

const TRANSPARENT_SECTIONS = new Set(['insights-banner', 'homehero']);
const SOLID_BG = '#22285C';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLocale(pathname: string): Locale {
    const seg = pathname.split('/')[1] as Locale;
    return LOCALES.includes(seg) ? seg : 'en';
}

function swapLocale(pathname: string, to: Locale): string {
    const parts = pathname.split('/');
    if (LOCALES.includes(parts[1] as Locale)) {
        parts[1] = to;
    } else {
        parts.splice(1, 0, to);
    }
    return parts.join('/') || `/${to}`;
}

function withLocale(pathname: string, href: string): string {
    if (href.startsWith('http') || href.startsWith('#')) return href;
    return `/${getLocale(pathname)}${href}`;
}

// ─── Social icons ─────────────────────────────────────────────────────────────

const SOCIAL_ICONS: Record<string, React.ReactElement> = {
    f: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    ),
    ig: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    ),
    x: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    in: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    ),
    yt: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
        </svg>
    ),
};

const SocialIcon = ({ type }: { type: string }) => SOCIAL_ICONS[type] ?? null;

// ─── Animation variants (typed correctly) ────────────────────────────────────

const springTransition: Transition = { type: 'spring', stiffness: 100, damping: 20 };

const headerVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: springTransition },
    scrolled: { paddingTop: '0.5rem', paddingBottom: '0.5rem', transition: { duration: 0.3 } },
};

const tweenInOut: Transition = { type: 'tween', duration: 0.35, ease: 'easeInOut' };

const panelVariants: Variants = {
    hidden: { x: '100%', transition: tweenInOut },
    visible: { x: 0, transition: tweenInOut },
};

const panelVariantsRTL: Variants = {
    hidden: { x: '-100%', transition: tweenInOut },
    visible: { x: 0, transition: tweenInOut },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: 0.1 + i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
};

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
};

// ─── Main component ───────────────────────────────────────────────────────────

const MotionLink = motion(Link);

export default function Navbar({ activeSection, lang }: Props) {
    const pathname = usePathname();
    const t = useT(lang);

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setMenuOpen] = useState(false);

    const currentLocale = getLocale(pathname);
    const isArabic = currentLocale === 'ar';
    const oppLocale = isArabic ? 'en' : 'ar';
    const langPath = swapLocale(pathname, oppLocale);

    const bgColor = useMemo(
        () => (TRANSPARENT_SECTIONS.has(activeSection) ? 'rgba(0,0,0,0)' : SOLID_BG),
        [activeSection],
    );

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setMenuOpen(false); }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        document.body.dir = isArabic ? 'rtl' : 'ltr';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen, isArabic]);

    const LangToggle = ({ onClick }: { onClick?: () => void }) => (
        <Link
            href={langPath}
            onClick={onClick}
            className="text-white text-sm font-medium tracking-[0.84px] uppercase hover:opacity-60 transition-opacity whitespace-nowrap"
        >
            {oppLocale.toUpperCase()}
        </Link>
    );

    return (
        <div className="text-white">

            {/* ── Fixed header ─────────────────────────────────────────────────── */}
            <motion.header
                initial="hidden"
                animate={['visible', isScrolled ? 'scrolled' : '']}
                variants={headerVariants}
                className="fixed left-0 right-0 top-0 text-white"
                style={{
                    zIndex: isMobileMenuOpen ? 9997 : 60,
                    pointerEvents: isMobileMenuOpen ? 'none' : 'auto',
                }}
            >
                <motion.div
                    animate={{ backgroundColor: bgColor }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="absolute inset-0"
                    style={{ zIndex: -1 }}
                />

                <div className="mx-auto flex max-w-7xl [@media(min-width:1600px)]:max-w-none items-center justify-between px-6 py-4">
                    <Link
                        href={`/${currentLocale}`}
                        className="relative"
                        style={{ zIndex: 9997, pointerEvents: 'auto' }}
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Image
                                src={BritamWhite}
                                width={133}
                                height={48}
                                alt="Britam Arabia"
                                quality={100}
                                className="w-auto object-contain h-12"
                                priority
                            />
                        </motion.div>
                    </Link>

                    <AnimatePresence>
                        {!isMobileMenuOpen && (
                            <motion.div
                                className="flex items-center gap-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <LangToggle />

                                <MotionLink
                                    href={withLocale(pathname, '/contact-us')}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="hidden sm:flex px-6 py-3 items-center justify-center border border-white text-white hover:text-[#22285C] hover:bg-white text-sm uppercase tracking-[0.84px] font-medium transition-colors whitespace-nowrap"
                                >
                                    {t('inquireNow')}
                                </MotionLink>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setMenuOpen(true)}
                                    className="flex items-center gap-3 text-white text-sm tracking-[0.84px] uppercase font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                                    aria-label={t('openMenu')}
                                    aria-expanded={isMobileMenuOpen}
                                    aria-controls="mobile-nav-panel"
                                >
                                    <span className="hidden sm:inline">{t('menu')}</span>
                                    <span className="flex flex-col gap-[5px] w-5" aria-hidden="true">
                                        <span className="block h-px bg-white w-full" />
                                        <span className="block h-px bg-white w-full" />
                                    </span>
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.header>

            {/* ── Slide-in panel ───────────────────────────────────────────────── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            onClick={() => setMenuOpen(false)}
                            aria-hidden="true"
                            style={{
                                position: 'fixed', inset: 0, zIndex: 9998,
                                backdropFilter: 'blur(6px)',
                                WebkitBackdropFilter: 'blur(6px)',
                                backgroundColor: 'rgba(0,0,0,0.35)',
                                pointerEvents: 'auto',
                            }}
                        />

                        <motion.div
                            id="mobile-nav-panel"
                            role="dialog"
                            aria-modal="true"
                            aria-label={t('menu')}
                            variants={isArabic ? panelVariantsRTL : panelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            style={{
                                position: 'fixed', top: 0, bottom: 0,
                                ...(isArabic ? { left: 0 } : { right: 0 }),
                                width: '100%', maxWidth: '480px',
                                zIndex: 9999, backgroundColor: '#1c2151',
                                overflowY: 'auto', pointerEvents: 'auto',
                            }}
                        >
                            <div className="flex flex-col h-full p-6 max-w-[400px] w-full mx-auto">

                                <div className="flex items-center justify-start mb-20 gap-8">
                                    <LangToggle onClick={() => setMenuOpen(false)} />

                                    <Link
                                        href={withLocale(pathname, '/contact-us')}
                                        onClick={() => setMenuOpen(false)}
                                        className="px-4 py-3 border border-white text-white text-sm tracking-[0.84px] uppercase font-medium hover:text-[#22285C] hover:bg-white transition-colors"
                                    >
                                        {t('inquireNow')}
                                    </Link>

                                    <button
                                        onClick={() => setMenuOpen(false)}
                                        className="text-white font-medium text-sm tracking-[0.84px] flex items-center gap-3 hover:opacity-60 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                                        aria-label={t('close')}
                                    >
                                        {t('close')} <span aria-hidden="true">✕</span>
                                    </button>
                                </div>

                                <nav aria-label="Main navigation">
                                    <ul className="flex flex-col gap-4 list-none p-0 m-0">
                                        {NAV_LINK_KEYS.map((item, index) => (
                                            <motion.li
                                                key={item.key}
                                                custom={index}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                            >
                                                <Link
                                                    href={withLocale(pathname, item.href)}
                                                    onClick={() => setMenuOpen(false)}
                                                    className="block text-white text-3xl font-medium tracking-[-0.68px] hover:opacity-60 transition-opacity focus:outline-none focus-visible:underline"
                                                >
                                                    {t(item.key)}
                                                </Link>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </nav>

                                <motion.div
                                    custom={NAV_LINK_KEYS.length}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="mt-auto pt-10"
                                >
                                    <p className="text-white/50 text-xs uppercase tracking-widest mb-4">
                                        {t('followUs')}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        {SOCIAL_LINKS.map((s) => (
                                            <a
                                                key={s.label}
                                                href={s.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={s.label}
                                                className="w-9 h-9 border border-white/30 flex items-center justify-center text-white/70 hover:border-white hover:text-white hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                            >
                                                <SocialIcon type={s.icon} />
                                            </a>
                                        ))}
                                    </div>
                                </motion.div>

                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}