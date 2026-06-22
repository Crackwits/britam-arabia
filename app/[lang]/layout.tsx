import type { Metadata } from "next";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import { Noto_Kufi_Arabic } from 'next/font/google';
import '../globals.css';
import FooterSection from "@/components/design/organisms/layout/Footer";

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
      path: "../fonts/Gotham-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Gotham-LightItalic.woff2",
      weight: "300",
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
    {
      path: "../fonts/Gotham-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/Gotham-ThinItalic.woff2",
      weight: "100",
      style: "italic",
    },
  ],
  variable: "--font-en",
});

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ar' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const isArabic = lang === 'ar';

  return (
    <html
      lang={lang}
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${gotham.variable} ${notoKufiArabic.variable}`}
    >
      <body className={isArabic ? 'font-ar' : 'font-en'}>
        {children}
        <FooterSection lang={lang} isArabic={isArabic} />
      </body>
    </html>
  );
}