export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "https://cms.britamarabia.com";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.britamarabia.com";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Britam Arabia";
// Optional: when unset, Strapi requests go out unauthenticated and rely on the Public role.
export const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN?.trim() || "";
