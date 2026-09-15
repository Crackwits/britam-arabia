/**
 * Single source of truth for which locales the frontend exposes.
 *
 * Arabic is gated behind NEXT_PUBLIC_ENABLE_ARABIC so it can be switched on
 * once the Strapi content is ready. NEXT_PUBLIC_* is inlined at build time,
 * so flipping the flag requires a redeploy.
 *
 *   NEXT_PUBLIC_ENABLE_ARABIC=true   -> /en and /ar, language toggle shown
 *   NEXT_PUBLIC_ENABLE_ARABIC=false  -> /en only, /ar/* redirects to /en/*
 */

export const ALL_LOCALES = ["en", "ar"] as const;
export type Locale = (typeof ALL_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const ARABIC_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ARABIC === "true";

export const SUPPORTED_LOCALES: readonly Locale[] = ARABIC_ENABLED
    ? ALL_LOCALES
    : [DEFAULT_LOCALE];

export function isSupportedLocale(value: string | undefined): value is Locale {
    return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
