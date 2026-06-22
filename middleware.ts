import { NextRequest, NextResponse } from "next/server";

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPPORTED_LOCALES = ["en", "ar"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: SupportedLocale = "en";
const LOCALE_COOKIE = "NEXT_LOCALE";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parses the Accept-Language header and returns the best matching
 * supported locale, falling back to DEFAULT_LOCALE if none match.
 *
 * Accept-Language example: "ar-SA,ar;q=0.9,en-US;q=0.8,en;q=0.7"
 */
function detectLocaleFromHeader(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  // Split into [{ code: "ar-SA", q: 1 }, { code: "ar", q: 0.9 }, ...] sorted by q desc
  const preferences = acceptLanguage
    .split(",")
    .map((part) => {
      const [rawCode, qPart] = part.trim().split(";q=");
      const q = qPart ? parseFloat(qPart) : 1;
      return { code: rawCode.toLowerCase(), q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of preferences) {
    // Match either exact ("ar") or primary subtag ("ar-SA" -> "ar")
    const primary = code.split("-")[0];
    const match = SUPPORTED_LOCALES.find(
      (locale) => locale === code || locale === primary
    );
    if (match) return match;
  }

  return DEFAULT_LOCALE;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files, and Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // e.g. favicon.ico, .well-known files, images
  ) {
    return NextResponse.next();
  }

  // If the path already starts with a supported locale, do nothing
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Prefer a previously saved cookie (e.g. user manually switched language)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value as
    | SupportedLocale
    | undefined;

  const locale =
    cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)
      ? cookieLocale
      : detectLocaleFromHeader(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  // Persist the detected/used locale so subsequent visits are consistent
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return response;
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /api routes
     * - /_next (static files, image optimization)
     * - files with an extension (favicon.ico, robots.txt, sitemap.xml, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};