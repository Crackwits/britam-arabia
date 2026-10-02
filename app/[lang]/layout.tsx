import type { Metadata } from "next";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { Noto_Kufi_Arabic } from 'next/font/google';
import '../globals.css';
import FooterSection from "@/components/design/organisms/layout/Footer";
import WhatsAppInquiry from "@/components/design/organisms/sections/WhatsappInquiry";
import { WhatsAppInquiryProvider } from "@/components/design/organisms/sections/WhatsAppInquiryProvider";
import Script from "next/script";
import { notFound } from "next/navigation";
import { SUPPORTED_LOCALES, isSupportedLocale } from "@/components/lib/locales";
import CookieConsent from "@/components/lib/cookieconsent";
import Analytics from "@/components/design/organisms/cookies/Analytics";
// const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-en' });
const notoKufiArabic = Noto_Kufi_Arabic({ subsets: ['arabic'], variable: '--font-ar' });

const gotham = localFont({
  src: [
    {
      path: "../fonts/Gotham-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Gotham-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "../fonts/Gotham-Book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Gotham-BookItalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/Gotham-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Gotham-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
  ],
  variable: "--font-en",
});

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // Anything that isn't a locale (e.g. /ads.txt) lands here — 404 it, don't render
  if (!isSupportedLocale(lang)) notFound();

  const isArabic = lang === 'ar';
  const language = lang as 'en' | 'ar'; // ✅ Cast to proper type
  return (
    <html
      lang={lang}
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${gotham.variable} ${notoKufiArabic.variable}`}
    >

      <head>
        {/* Google Analytics */}
        <Analytics />

        {/* Google Search Console Verification */}
        <meta
          name="google-site-verification"
          content="G-S6VWEXZ3MF"
        />
      </head>
      <body className={isArabic ? 'font-ar' : 'font-en'}>
        <WhatsAppInquiryProvider>
          <SmoothScrollProvider duration={1.4} wheelMultiplier={0.8}>
            {children}
          </SmoothScrollProvider>
          <CookieConsent locale={lang === 'ar' ? 'ar' : 'en'} />
          <FooterSection lang={lang} isArabic={isArabic} />
          <WhatsAppInquiry language={language} businessPhone="966551765460" recruitmentEmail="cv@britamarabia.com" />
        </WhatsAppInquiryProvider>
      </body>
    </html>
  );
}