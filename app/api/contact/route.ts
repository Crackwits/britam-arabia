import { NextRequest, NextResponse } from "next/server";
import { isMailConfigured, sendMail } from "@/lib/mail";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { inquiryType, name, email, phone, companyName, message, lang } = body;

        // ── Validation ────────────────────────────────────────────────────────────
        if (!inquiryType || !name || !email || !phone || !companyName || !message) {
            return NextResponse.json(
                { success: false, error: "All fields are required." },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { success: false, error: "Invalid email address." },
                { status: 400 }
            );
        }

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
        if (!recipient || !isMailConfigured()) {
            console.error("Contact form: missing mail config (HR_BUSINESS_EMAIL / MS_TENANT_ID / MS_CLIENT_ID / MS_CLIENT_SECRET / MS_SENDER)");
            return NextResponse.json(
                { success: false, error: "Mail service is not configured." },
                { status: 500 }
            );
        }

        await sendMail({
            to: recipient,
            replyTo: email,
            subject: `BRITAM ARABIA - New Contact Inquiry — ${inquiryType}`,
            html: emailHtml,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact form submission error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}