import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isMailConfigured, sendMail } from "@/lib/mail";
import { createHubSpotLead, isHubSpotConfigured } from "@/lib/hubspot";
import { saveSubmission } from "@/lib/strapi-submissions";
import { clean, HONEYPOT_FIELD, isHoneypotFilled, isRateLimited } from "@/lib/spam";

export const runtime = "nodejs";

// Mirrors the client schema in components/design/organisms/sections/ContactSection
const contactSchema = z.object({
    inquiryType: z.string().min(1).max(100),
    name: z.string().min(2).max(120),
    email: z.string().email().max(254),
    companyName: z.string().min(2).max(200),
    phone: z.string().min(6).max(30).regex(/^[+0-9()\s-]+$/),
    message: z.string().min(10).max(5000),
    lang: z.enum(["en", "ar"]).optional(),
});

export async function POST(req: NextRequest) {
    try {
        if (isRateLimited(req, "contact")) {
            return NextResponse.json(
                { success: false, error: "Too many submissions. Please try again later." },
                { status: 429 }
            );
        }

        const body = await req.json();

        // Bots that fill the hidden field get a normal-looking success and nothing else
        if (isHoneypotFilled(body?.[HONEYPOT_FIELD])) {
            return NextResponse.json({ success: true });
        }

        // ── Validation ────────────────────────────────────────────────────────────
        const parsed = contactSchema.safeParse({
            inquiryType: clean(body?.inquiryType, 100),
            name: clean(body?.name, 120),
            email: clean(body?.email, 254),
            phone: clean(body?.phone, 30),
            companyName: clean(body?.companyName, 200),
            message: clean(body?.message, 5000),
            lang: body?.lang === "ar" ? "ar" : body?.lang === "en" ? "en" : undefined,
        });
        if (!parsed.success) {
            const emailInvalid = parsed.error.issues.some((i) => i.path[0] === "email");
            return NextResponse.json(
                { success: false, error: emailInvalid ? "Invalid email address." : "All fields are required." },
                { status: 400 }
            );
        }
        const { inquiryType, name, email, phone, companyName, message, lang } = parsed.data;

        // ── Build email body ──────────────────────────────────────────────────────
        const emailHtml = `
      <h2 style="color:#001239;">New Contact Inquiry</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Inquiry Type</td><td style="font-weight:600;color:#001239;">${inquiryType}</td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Name</td><td style="font-weight:600;color:#001239;">${name}</td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Email</td><td style="font-weight:600;color:#001239;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Phone</td><td style="font-weight:600;color:#001239;">${phone}</td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Company Name</td><td style="font-weight:600;color:#001239;">${companyName}</td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Language</td><td style="font-weight:600;color:#001239;">${lang ?? "en"}</td></tr>
      </table>
      <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;" />
      <p style="color:#6E6F89;font-size:12px;text-transform:uppercase;margin-bottom:4px;">Message</p>
      <p style="color:#001239;white-space:pre-line;">${message}</p>
    `;

        const recipient = process.env.HR_BUSINESS_EMAIL || process.env.HR_INFO_EMAIL;

        // The submission counts as received if the email, HubSpot or Strapi gets it
        const [mailResult, hubspotResult, strapiResult] = await Promise.allSettled([
            (async () => {
                if (!recipient || !isMailConfigured()) {
                    throw new Error("Missing mail config (HR_BUSINESS_EMAIL / MS_TENANT_ID / MS_CLIENT_ID / MS_CLIENT_SECRET / MS_SENDER)");
                }
                await sendMail({
                    to: recipient,
                    replyTo: email,
                    subject: `BRITAM ARABIA - New Contact Inquiry — ${inquiryType}`,
                    html: emailHtml,
                });
            })(),
            (async () => {
                if (!isHubSpotConfigured()) throw new Error("Missing HubSpot config (HUBSPOT_ACCESS_TOKEN)");
                await createHubSpotLead({
                    source: "contact_form",
                    fullName: name,
                    email,
                    phone,
                    companyName,
                    dealName: `${companyName} — ${inquiryType}`,
                    description: `Inquiry type: ${inquiryType}\nLanguage: ${lang ?? "en"}\n\nMessage:\n${message}`,
                });
            })(),
            saveSubmission(
                "business-inquiries",
                { inquiryType, name, email, phone, companyName, message, language: lang ?? "en" },
                { sourcePage: `/${lang ?? "en"}/contact-us` }
            ),
        ]);

        if (mailResult.status === "rejected") console.error("Contact form: email failed:", mailResult.reason);
        if (hubspotResult.status === "rejected") console.error("Contact form: HubSpot failed:", hubspotResult.reason);
        if (strapiResult.status === "rejected") console.error("Contact form: Strapi save failed:", strapiResult.reason);
        if (
            mailResult.status === "rejected" &&
            hubspotResult.status === "rejected" &&
            strapiResult.status === "rejected"
        ) {
            throw new Error("Contact form: email, HubSpot and Strapi all failed");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact form submission error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
