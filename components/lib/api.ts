import { STRAPI_API_TOKEN, STRAPI_URL } from "./settings";

export async function fetchStrapi(
    path: string,
    locale: string = 'en',
    options: RequestInit = {}
) {
    // Append locale as query param — Strapi i18n uses ?locale=ar
    const separator = path.includes('?') ? '&' : '?';
    const url = `${STRAPI_URL}/api${path}${separator}locale=${locale}`;

    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 }, // ISR — revalidate every 60s
        ...options,
    });

    if (!res.ok) throw new Error(`Strapi error on ${url}: ${res.status}`);
    return res.json();
}


const strapiHeaders = {
    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    "Content-Type": "application/json",
};

// ─── Generic fetcher ──────────────────────────────────────────────────────────

export async function strapiGet<T>(
    endpoint: string,
    params?: Record<string, string>
): Promise<T> {
    const url = new URL(`${STRAPI_URL}/api/${endpoint}`);

    if (params) {
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    // console.log(url.toString());
    const res = await fetch(url.toString(), {
        headers: strapiHeaders,
        next: { revalidate: 60 }, // ISR - adjust per content type
    });

    if (!res.ok) throw new Error(`Strapi error: ${res.status} ${endpoint}`);
    return res.json();
}



export async function getSingleType<T>(
    contentType: string,
    lang: string,
    // populate = "*"
    populate: string | Record<string, unknown> = "*"  // ← change default
): Promise<T | null> {  // ← return null instead of throwing
    try {
        const url = new URL(`${STRAPI_URL}/api/${contentType}`);
        url.searchParams.set("locale", lang);
        // url.searchParams.set("populate", populate);
        // Handle both string ("*", "deep") and object (granular populate)
        if (typeof populate === "string") {
            url.searchParams.set("populate", populate);
        } else {
            // Serialize object as: populate[hero][populate][image]=true etc.
            const flatParams = flattenPopulate(populate);
            flatParams.forEach(([key, value]) => url.searchParams.set(key, value));
        }
        // console.log(url);
        const res = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            },
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            console.error(`Strapi ${res.status} for "${contentType}" [${lang}]`);
            return null;  // ← don't throw, return null
        }

        const data = await res.json();
        return data.data ?? null;
    } catch (err) {
        console.error(`Strapi fetch failed for "${contentType}" [${lang}]:`, err);
        return null;
    }
}

function flattenPopulate(
    obj: Record<string, unknown>,
    prefix = "populate"
): [string, string][] {
    const result: [string, string][] = [];
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = `${prefix}[${key}]`;
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            result.push(...flattenPopulate(value as Record<string, unknown>, fullKey));
        } else {
            result.push([fullKey, String(value)]);
        }
    }
    return result;
}
// ─── Collection Type (all entries) ───────────────────────────────────────────

export async function getCollectionold<T>(
    contentType: string,
    locale: string,
    populate = "*",
    filters?: Record<string, string>
): Promise<T[]> {
    const params: Record<string, string> = {
        locale,
        populate,
        "pagination[pageSize]": "100",
    };

    if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
            params[`filters[${k}][$eq]`] = v;
        });
    }

    const data = await strapiGet<{ data: T[] }>(contentType, params);
    return data.data;
}

export async function getCollection<T>(
    contentType: string,
    locale: string,
    populate: string | Record<string, unknown> = "*",
    filters?: Record<string, unknown>
): Promise<T[]> {
    const params: Record<string, string> = {
        locale,
        "pagination[pageSize]": "100",
    };

    // ── Populate ──────────────────────────────────────────────────────────────
    if (typeof populate === "string") {
        // Simple wildcard or field name: populate=* or populate=image
        params["populate"] = populate;
    } else {
        // Nested object: flatten to dot-bracket notation Strapi understands
        // e.g. { hero: { image: true } } → populate[hero][image]=true
        const flatParams = flattenPopulate(populate);
        flatParams.forEach(([key, value]) => {
            params[key] = value;
        });
    }

    // ── Filters ───────────────────────────────────────────────────────────────
    // if (filters) {
    //     Object.entries(filters).forEach(([k, v]) => {
    //         params[`filters[${k}][$eq]`] = v;
    //     });
    // }

    if (filters) {
        const flattenFilters = (
            obj: Record<string, unknown>,
            prefix = "filters"
        ) => {
            Object.entries(obj).forEach(([k, v]) => {
                const key = `${prefix}[${k}]`;
                if (typeof v === "object" && v !== null) {
                    flattenFilters(v as Record<string, unknown>, key);
                } else {
                    params[key] = String(v);
                }
            });
        };
        flattenFilters(filters);
    }

    const data = await strapiGet<{ data: T[] }>(contentType, params);
    return data.data;
}
// ─── Collection Type (single entry by slug) ───────────────────────────────────

export async function getBySlug0<T>(
    contentType: string,
    slug: string,
    locale: string,
    populate = "*"
): Promise<T | null> {
    const data = await strapiGet<{ data: T[] }>(contentType, {
        locale,
        populate,
        "filters[slug][$eq]": slug,
    });

    return data.data?.[0] ?? null;
}

export async function getBySlug<T>(
    contentType: string,
    slug: string,          // slug is second, locale is third — matches call sites above
    locale: string,
    populate: string | Record<string, unknown> = "*"
): Promise<T | null> {
    const params: Record<string, string> = {
        locale,
        "filters[slug][$eq]": slug,
    };

    if (typeof populate === "string") {
        params["populate"] = populate;
    } else {
        const flatParams = flattenPopulate(populate);
        flatParams.forEach(([key, value]) => {
            params[key] = value;
        });
    }

    // console.log(params);
    const data = await strapiGet<{ data: T[] }>(contentType, params);
    return data.data?.[0] ?? null;
}