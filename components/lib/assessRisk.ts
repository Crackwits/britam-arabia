/**
 * Destination for the "Assess Your Risk" CTAs (header + homepage).
 *
 * Temporary override: set NEXT_PUBLIC_ASSESS_RISK_MAILTO to an email address
 * and every CTA becomes a mailto: link instead of the /assess-risk form.
 * Leave it unset to route to the form. Build-time flag — redeploy to change.
 */

export const ASSESS_RISK_MAILTO =
    process.env.NEXT_PUBLIC_ASSESS_RISK_MAILTO?.trim() || "";

const MAILTO_SUBJECT = "Risk Assessment Request";

export function assessRiskHref(lang: string): string {
    if (ASSESS_RISK_MAILTO) {
        return `mailto:${ASSESS_RISK_MAILTO}?subject=${encodeURIComponent(MAILTO_SUBJECT)}`;
    }
    return `/${lang}/assess-risk`;
}
