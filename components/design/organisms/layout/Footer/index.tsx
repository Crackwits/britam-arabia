'use client';
import Image from 'next/image';
import Link from 'next/link';       // ← next-intl Link (locale-aware)
import BritamFooter from '@/public/britam-footer.png';
import NPFA from "@/public/clients/npfa.png";
import FPA from "@/public/clients/fpa.png";
import ISO from "@/public/clients/iso.png";
import IOSH from "@/public/clients/iosh.png";
import Nebosh from "@/public/clients/nebosh.png";
import FireService from "@/public/clients/fireservicecollege.png";
import BritamLogoLight from '@/public/Britam-logo-light.svg';

import { FACEBOOK_URL, INSTAGRAM_URL, TWITTER_URL, LINKEDIN_URL, YOUTUBE_URL, WHATSAPP_URL } from "@/utils/consts";

const socialLinks = [
    { icon: "f", href: FACEBOOK_URL, label: "Facebook" },
    { icon: "ig", href: INSTAGRAM_URL, label: "Instagram" },
    { icon: "x", href: TWITTER_URL, label: "X" },
    { icon: "in", href: LINKEDIN_URL, label: "LinkedIn" },
    { icon: "yt", href: YOUTUBE_URL, label: "YouTube" },
    { icon: "wt", href: WHATSAPP_URL, label: "Whatsapp" },
];

const SocialIcon = ({ type }: { type: string }) => {
    const icons: Record<string, React.ReactElement> = {
        f: <svg width="11" height="17" viewBox="0 0 11 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.45614 9.37441L9.99008 6.35952H6.70099V4.39985C6.70099 3.57547 7.16018 2.76993 8.62853 2.76993H10.1449V0.202563C9.26185 0.0774173 8.36954 0.00971395 7.47521 0C4.76812 0 3.00076 1.4462 3.00076 4.06067V6.35952H0V9.37441H3.00076V16.6667H6.70099V9.37441H9.45614Z" fill="white" />
        </svg>,
        ig: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.25867 7.88265C5.25867 6.43155 6.43541 5.25489 7.88738 5.25489C9.33935 5.25489 10.5167 6.43155 10.5167 7.88265C10.5167 9.33375 9.33935 10.5104 7.88738 10.5104C6.43541 10.5104 5.25867 9.33375 5.25867 7.88265ZM3.8373 7.88265C3.8373 10.1182 5.65052 11.9303 7.88738 11.9303C10.1242 11.9303 11.9375 10.1182 11.9375 7.88265C11.9375 5.64713 10.1242 3.835 7.88738 3.835C5.65052 3.835 3.8373 5.64713 3.8373 7.88265ZM11.1513 3.67451C11.1512 3.8616 11.2067 4.0445 11.3106 4.2001C11.4145 4.3557 11.5623 4.477 11.7352 4.54866C11.9082 4.62032 12.0985 4.63913 12.2821 4.60271C12.4657 4.56628 12.6344 4.47626 12.7668 4.34402C12.8992 4.21179 12.9894 4.04328 13.026 3.8598C13.0626 3.67633 13.0439 3.48613 12.9724 3.31325C12.9008 3.14038 12.7795 2.9926 12.6239 2.8886C12.4683 2.7846 12.2854 2.72905 12.0982 2.72897H12.0978C11.8469 2.72909 11.6062 2.82873 11.4288 3.00602C11.2513 3.18331 11.1515 3.42374 11.1513 3.67451ZM4.70088 14.2989C3.93189 14.2639 3.51392 14.1359 3.23616 14.0278C2.86791 13.8845 2.60517 13.7139 2.32892 13.4381C2.05267 13.1624 1.88168 12.9001 1.73895 12.5321C1.63067 12.2546 1.50258 11.8368 1.46762 11.0682C1.42938 10.2374 1.42175 9.98776 1.42175 7.88271C1.42175 5.77767 1.43001 5.52876 1.46762 4.69718C1.50264 3.92865 1.63168 3.51163 1.73895 3.23334C1.88231 2.86531 2.05305 2.60272 2.32892 2.32664C2.60479 2.05056 2.86728 1.87967 3.23616 1.73702C3.5138 1.62881 3.93189 1.50079 4.70088 1.46586C5.53227 1.42764 5.78202 1.42001 7.88738 1.42001C9.99274 1.42001 10.2427 1.42827 11.0748 1.46586C11.8438 1.50086 12.2611 1.62982 12.5395 1.73702C12.9078 1.87967 13.1705 2.05094 13.4468 2.32664C13.723 2.60235 13.8934 2.86531 14.0368 3.23334C14.145 3.51081 14.2731 3.92865 14.3081 4.69718C14.3463 5.52876 14.354 5.77767 14.354 7.88271C14.354 9.98776 14.3463 10.2367 14.3081 11.0682C14.2731 11.8368 14.1443 12.2545 14.0368 12.5321C13.8934 12.9001 13.7227 13.1627 13.4468 13.4381C13.1709 13.7136 12.9078 13.8845 12.5395 14.0278C12.2619 14.136 11.8438 14.264 11.0748 14.2989C10.2434 14.3372 9.99369 14.3448 7.88738 14.3448C5.78107 14.3448 5.53202 14.3372 4.70088 14.2989ZM4.63557 0.0477373C3.79591 0.0859524 3.22215 0.219011 2.72108 0.413871C2.20216 0.615099 1.76286 0.885064 1.32388 1.32309C0.884901 1.76111 0.615468 2.20084 0.414119 2.71945C0.219143 3.22054 0.086004 3.79364 0.047766 4.63279C0.00889696 5.47327 0 5.74197 0 7.88265C0 10.0233 0.00889696 10.292 0.047766 11.1325C0.086004 11.9717 0.219143 12.5448 0.414119 13.0458C0.615468 13.5641 0.884964 14.0044 1.32388 14.4422C1.7628 14.88 2.20216 15.1496 2.72108 15.3514C3.2231 15.5463 3.79591 15.6793 4.63557 15.7176C5.477 15.7558 5.74542 15.7653 7.88738 15.7653C10.0293 15.7653 10.2982 15.7564 11.1392 15.7176C11.9789 15.6793 12.5523 15.5463 13.0537 15.3514C13.5723 15.1496 14.0119 14.8802 14.4509 14.4422C14.8899 14.0042 15.1587 13.5641 15.3606 13.0458C15.5556 12.5448 15.6894 11.9717 15.727 11.1325C15.7652 10.2914 15.7741 10.0233 15.7741 7.88265C15.7741 5.74197 15.7652 5.47327 15.727 4.63279C15.6888 3.79357 15.5556 3.22022 15.3606 2.71945C15.1587 2.20115 14.8892 1.7618 14.4509 1.32309C14.0126 0.88437 13.5723 0.615099 13.0543 0.413871C12.5523 0.219011 11.9788 0.0853218 11.1398 0.0477373C10.2988 0.00952224 10.03 0 7.88801 0C5.74605 0 5.477 0.00889163 4.63557 0.0477373Z" fill="white" />
        </svg>,
        x: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.0329772 0L5.25369 7.45839L0 13.5207H1.18306L5.78133 8.2115L9.49745 13.5207H13.5207L8.00729 5.64389L12.8962 0H11.7152L7.47966 4.88858L4.05826 0H0.0329772ZM1.77253 0.929271H3.62132L11.7832 12.5892H9.9344L1.77253 0.929271Z" fill="white" />
        </svg>,
        in: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.06924 13.0697V4.25107H0.170841V13.0697H3.06955H3.06924ZM1.62065 3.04725C2.63117 3.04725 3.26029 2.37008 3.26029 1.52381C3.24137 0.658266 2.63117 0 1.63987 0C0.647881 0 0 0.658266 0 1.52374C0 2.37 0.62889 3.04717 1.60166 3.04717H1.62042L1.62065 3.04725ZM4.67355 13.0697H7.57172V8.1455C7.57172 7.88229 7.59064 7.61838 7.66721 7.43038C7.87663 6.90357 8.35352 6.35824 9.15439 6.35824C10.2029 6.35824 10.6226 7.16686 10.6226 8.35248V13.0697H13.5207V8.01336C13.5207 5.30477 12.091 4.04432 10.1841 4.04432C8.62075 4.04432 7.93414 4.92801 7.55266 5.52988H7.57195V4.25138H4.6737C4.71153 5.07867 4.67347 13.07 4.67347 13.07L4.67355 13.0697Z" fill="white" />
        </svg>,
        yt: <svg width="17" height="13" viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.8307 2.80505C16.8307 2.80505 16.6646 1.53069 16.1533 0.971119C15.5059 0.234657 14.782 0.231047 14.45 0.187726C12.0727 -1.03286e-07 8.50332 0 8.50332 0H8.49668C8.49668 0 4.92734 -1.03286e-07 2.55 0.187726C2.21797 0.231047 1.49414 0.234657 0.84668 0.971119C0.335352 1.53069 0.172656 2.80505 0.172656 2.80505C0.172656 2.80505 0 4.30325 0 5.79783V7.19855C0 8.69314 0.169336 10.1913 0.169336 10.1913C0.169336 10.1913 0.335351 11.4657 0.843359 12.0253C1.49082 12.7617 2.34082 12.7365 2.71934 12.8159C4.08066 12.9567 8.5 13 8.5 13C8.5 13 12.0727 12.9928 14.45 12.8087C14.782 12.7653 15.5059 12.7617 16.1533 12.0253C16.6646 11.4657 16.8307 10.1913 16.8307 10.1913C16.8307 10.1913 17 8.69675 17 7.19855V5.79783C17 4.30325 16.8307 2.80505 16.8307 2.80505ZM6.74356 8.89892V3.70397L11.3355 6.31047L6.74356 8.89892Z" fill="white" />
        </svg>,
        wt: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 13.52L0.954879 10.0482C0.36565 9.03192 0.0560362 7.87991 0.0566022 6.6986C0.0583003 3.00538 3.07803 0 6.7883 0C8.58882 0.000563333 10.279 0.698533 11.5502 1.96491C12.821 3.23128 13.5206 4.91452 13.52 6.70479C13.5183 10.3986 10.4986 13.404 6.7883 13.404C5.66192 13.4034 4.55195 13.1223 3.56877 12.5882L0 13.52ZM3.73405 11.3754C4.6827 11.9359 5.58833 12.2717 6.78604 12.2722C9.86972 12.2722 12.3817 9.7744 12.3834 6.70367C12.3846 3.62674 9.88444 1.1323 6.79057 1.13117C3.70461 1.13117 1.19431 3.62899 1.19317 6.69916C1.19261 7.95258 1.56165 8.89109 2.18145 9.87298L1.61599 11.928L3.73405 11.3754ZM10.1793 8.29734C10.1375 8.22748 10.0254 8.1858 9.85671 8.10186C9.6886 8.01792 8.86164 7.61289 8.70712 7.55712C8.55316 7.50135 8.44108 7.47318 8.32845 7.64105C8.21637 7.80836 7.89374 8.1858 7.79582 8.29734C7.6979 8.40888 7.59941 8.42296 7.4313 8.33902C7.26319 8.25509 6.72094 8.07876 6.07851 7.50811C5.57871 7.0642 5.2408 6.51608 5.14287 6.3482C5.04495 6.18089 5.13269 6.0902 5.21646 6.00682C5.2923 5.9319 5.38457 5.81135 5.4689 5.71333C5.55437 5.61643 5.58211 5.54658 5.63871 5.43448C5.69475 5.32294 5.66701 5.22492 5.62456 5.14098C5.58211 5.05761 5.24589 4.23345 5.10608 3.89827C4.96911 3.5721 4.83043 3.61604 4.72742 3.61097L4.40478 3.60533C4.29271 3.60533 4.11045 3.64702 3.95649 3.81489C3.80254 3.98277 3.36783 4.38724 3.36783 5.2114C3.36783 6.03555 3.97064 6.83154 4.05441 6.94308C4.13875 7.05462 5.24023 8.74575 6.92754 9.47076C7.32885 9.64314 7.64243 9.74623 7.88638 9.82341C8.28939 9.95072 8.65617 9.93269 8.94598 9.88988C9.26917 9.842 9.94104 9.48484 10.0814 9.09389C10.2218 8.70237 10.2218 8.36719 10.1793 8.29734Z" fill="white" />
        </svg>
    };
    return icons[type] || null;
};

interface FooterSectionProps {
    lang: string;
    isArabic: boolean;
}

interface FooterLink {
    label: { en: string; ar: string };
    href: string;
}

// ─── Static Data (hardcoded per current requirements) ─────────────────────────

const FOOTER_LINKS_COL_1: FooterLink[] = [
    { label: { en: "Our Journey", ar: "مسيرتنا" }, href: "/our-journey" },
    { label: { en: "Our Approach", ar: "منهجنا" }, href: "/our-approach" },
    { label: { en: "Insights", ar: "رؤى" }, href: "/insights" },
];

const FOOTER_LINKS_COL_2: FooterLink[] = [
    { label: { en: "Life at Britam", ar: "الحياة في بريتام" }, href: "/life-at-britam" },
    { label: { en: "FAQ", ar: "الأسئلة الشائعة" }, href: "/faq" },
    { label: { en: "General Inquiry", ar: "استعلام عام" }, href: "/contact-us" },
];

const LEGAL_LINKS: FooterLink[] = [
    { label: { en: "Privacy Policy", ar: "سياسة الخصوصية" }, href: "/privacy-policy" },
    { label: { en: "Terms of Service", ar: "شروط الخدمة" }, href: "/terms-conditions" },
    { label: { en: "Cookie Settings", ar: "إعدادات ملفات تعريف الارتباط" }, href: "/cookies-policy" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Prefixes a relative path with the current locale segment.
 * e.g. withLocale("en", "/our-journey") -> "/en/our-journey"
 *      withLocale("en", "/")            -> "/en"
 */
function withLocale(lang: string, path: string): string {
    if (path === "/") return `/${lang}`;
    return `/${lang}${path}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FooterSection({ lang, isArabic }: FooterSectionProps) {
    const year = new Date().getFullYear();

    return (
        <footer

            className="relative w-full bg-footerbg px-4 py-12 footer-clip"
        >
            {/* ── Top row: logo + link columns ── */}
            <div className="mx-auto flex max-w-7xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
                {/* Logo with diagonal clipped corner */}
                <div
                    className={`
            relative flex w-fit items-center 
         
          `}
                >
                    <Link href={withLocale(lang, "/")} className="shrink-0">
                        <Image src={BritamLogoLight} alt="Britam" className="h-[58px] w-auto" />
                    </Link>

                </div>

                {/* Link columns */}
                <nav
                    aria-label={isArabic ? "روابط التذييل" : "Footer navigation"}
                    className={`
            grid grid-cols-2 gap-x-12 gap-y-3 text-sm
            sm:gap-x-16
            ${isArabic ? "text-right" : "text-left"}
          `}
                >
                    <ul className="flex flex-col gap-3">
                        {FOOTER_LINKS_COL_1.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={withLocale(lang, link.href)}
                                    className="
                    text-white text-sm transition-colors duration-200
                    hover:text-lightLighter focus-visible:outline-none
                    focus-visible:underline focus-visible:text-white
                  "
                                >
                                    {isArabic ? link.label.ar : link.label.en}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <ul className="flex flex-col gap-3">
                        {FOOTER_LINKS_COL_2.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={withLocale(lang, link.href)}
                                    className="
                    text-white text-sm transition-colors duration-200
                    hover:text-lightLighter focus-visible:outline-none
                    focus-visible:underline focus-visible:text-white
                  "
                                >
                                    {isArabic ? link.label.ar : link.label.en}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* ── Middle row: certifications + social icons ── */}
            <div className="mx-auto flex max-w-7xl flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
                {/* Certification badges */}
                <div className='md:order-1 order-2 md:pe-8 pe-0'>
                    <div
                        className="flex flex-wrap justify-center items-center gap-8"
                        role="list"
                        aria-label={isArabic ? "الشهادات والاعتمادات" : "Certifications and accreditations"}
                    >
                        <Image src={FPA} alt="Fire Protection Association" width={110} height={20} className="h-5 w-auto object-contain" />
                        <Image src={NPFA} alt="NFPA" width={45} height={35} className="h-9 w-auto object-contain" />
                        <Image src={FireService} alt="Fire Service College" width={62} height={62} className="h-15 w-auto object-contain" />
                        <Image src={IOSH} alt='IOSH' width={45} height={40} className='h-10 w-auto object-contain' />
                        <Image src={ISO} alt="ISO 9001" width={52} height={48} className="h-12 w-auto object-contain" />
                        <Image src={Nebosh} alt="NEBOSH" width={41} height={50} className="h-12 w-auto object-contain" />
                    </div>
                </div>

                <div className='md:order-2 order-1 pb-12 md:pb-0'>
                    {/* Social icons */}
                    <div className="flex items-center gap-3 ">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                className="
                flex h-9 w-9 items-center justify-center rounded-full border-[0.5px] border-darkDefault text-white transition-colors duration-200
                hover:bg-white/20 focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-white/60
              "
                            >
                                <SocialIcon type={social.icon} />
                            </a>
                        ))}
                    </div>
                </div>

            </div>

            {/* ── Divider ── */}
            <div className="mx-auto mt-10 max-w-7xl border-t border-white/10" />

            {/* ── Bottom row: copyright + legal links ── */}
            <div
                className="mx-auto flex flex-col max-w-7xl items-center gap-4
                            py-7 text-xs text-lightLighter
                            md:flex-row md:justify-between">
                <p>
                    {isArabic ? (
                        <>© {year}   <span className="text-white">بريتام أرابيا</span>. جميع الحقوق محفوظة.</>
                    ) : (
                        <>
                            © {year} <span className="text-white">Britam Arabia</span>. All
                            rights reserved.
                        </>
                    )}
                </p>

                <ul className="flex items-center gap-6">
                    {LEGAL_LINKS.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={withLocale(lang, link.href)}
                                className="text-xs text-lightLight cursor-pointer
                  transition-colors duration-200 hover:text-white"
                            >
                                {isArabic ? link.label.ar : link.label.en}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    );
}