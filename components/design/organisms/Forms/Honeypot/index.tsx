"use client";

import type { BaseSyntheticEvent } from "react";

/**
 * Spam trap: hidden from people and screen readers, but naive bots fill it in.
 * The API routes silently drop any submission where it has a value.
 * The name must match HONEYPOT_FIELD in lib/spam.ts.
 */
export default function Honeypot() {
    return (
        <div aria-hidden="true" className="sr-only">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
    );
}

/** Reads the trap's value from the submit event react-hook-form passes to onSubmit. */
export function readHoneypot(event?: BaseSyntheticEvent) {
    const form = event?.target;
    if (!(form instanceof HTMLFormElement)) return "";
    const value = new FormData(form).get("website");
    return typeof value === "string" ? value : "";
}
