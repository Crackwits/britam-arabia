// Basic spam protection for the public form endpoints: a honeypot field and an
// in-memory per-IP rate limit. The limit is per server instance, which is enough
// to stop casual floods; put a shared store (e.g. Redis) behind it if that changes.

import type { NextRequest } from "next/server";

/** Name of the hidden field real users never fill in. Keep in sync with the Honeypot component. */
export const HONEYPOT_FIELD = "website";

export const isHoneypotFilled = (value: unknown) =>
    typeof value === "string" && value.trim() !== "";

const hits = new Map<string, number[]>();

export function getClientIp(req: NextRequest) {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip")?.trim() ||
        "unknown"
    );
}

/** Returns true when this IP has used up its submissions for `key` in the window. */
export function isRateLimited(req: NextRequest, key: string, limit = 5, windowMs = 10 * 60 * 1000) {
    const now = Date.now();
    const id = `${key}:${getClientIp(req)}`;
    const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);

    if (recent.length >= limit) {
        hits.set(id, recent);
        return true;
    }
    recent.push(now);
    hits.set(id, recent);

    // Drop stale IPs now and then so the map can't grow without bound
    if (hits.size > 5000) {
        for (const [k, times] of hits) {
            if (times.every((t) => now - t >= windowMs)) hits.delete(k);
        }
    }
    return false;
}

/** Trims, strips control characters (keeping newlines/tabs) and caps the length. */
export const clean = (value: unknown, max = 500) =>
    String(value ?? "")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
        .trim()
        .slice(0, max);
