import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isMailConfigured, sendMail } from "@/lib/mail";
import { saveSubmission } from "@/lib/strapi-submissions";
import { clean, HONEYPOT_FIELD, isHoneypotFilled, isRateLimited } from "@/lib/spam";

export const runtime = "nodejs";

// Mirrors the client schema in components/design/organisms/sections/HpContact
const inquirySchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(254),
  phoneNumber: z.string().min(7).max(30).regex(/^[+0-9()\s-]+$/),
  companyName: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, "inquiry")) {
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
    const parsed = inquirySchema.safeParse({
      fullName: clean(body?.fullName, 120),
      email: clean(body?.email, 254),
      phoneNumber: clean(body?.phoneNumber, 30),
      companyName: clean(body?.companyName, 200),
      message: clean(body?.message, 5000),
    });
    if (!parsed.success) {
      const emailInvalid = parsed.error.issues.every((i) => i.path[0] === "email");
      return NextResponse.json(
        { success: false, error: emailInvalid ? "Invalid email address." : "All fields are required." },
        { status: 400 }
      );
    }
    const { fullName, email, phoneNumber, companyName, message } = parsed.data;
    const locale = body?.locale === "ar" ? "ar" : "en";

    const safeName = escapeHtml(fullName);
    const safecompanyName = escapeHtml(companyName);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phoneNumber);
    const safeMessage = escapeHtml(message);
    // const safeLang = escapeHtml(locale ?? "en");

    // ── Build email body ──────────────────────────────────────────────────────
    const emailHtml = `
      <h2 style="color:#001239;">New Inquiry</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Name</td><td style="font-weight:600;color:#001239;">${safeName}</td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Email</td><td style="font-weight:600;color:#001239;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Phone</td><td style="font-weight:600;color:#001239;">${safePhone}</td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Company Name</td><td style="font-weight:600;color:#001239;">${safecompanyName}</td></tr>
        </table>
      <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;" />
      <p style="color:#6E6F89;font-size:12px;text-transform:uppercase;margin-bottom:4px;">Message</p>
      <p style="color:#001239;white-space:pre-line;">${safeMessage}</p>
    `;

    const recipient = process.env.HR_INFO_EMAIL || process.env.HR_BUSINESS_EMAIL;

    // Strapi and the email are independent: the inquiry counts as received if either gets it
    const [mailResult, strapiResult] = await Promise.allSettled([
      (async () => {
        if (!recipient || !isMailConfigured()) {
          throw new Error("Missing mail config (HR_INFO_EMAIL / MS_TENANT_ID / MS_CLIENT_ID / MS_CLIENT_SECRET / MS_SENDER)");
        }
        await sendMail({
          to: recipient,
          replyTo: email,
          subject: `BRITAM ARABIA - New Inquiry — ${fullName}`,
          html: emailHtml,
        });
      })(),
      saveSubmission(
        "homepage-inquiries",
        { fullName, email, phoneNumber, companyName, message, language: locale },
        { sourcePage: `/${locale}` }
      ),
    ]);

    if (mailResult.status === "rejected") console.error("Inquiry form: email failed:", mailResult.reason);
    if (strapiResult.status === "rejected") console.error("Inquiry form: Strapi save failed:", strapiResult.reason);
    if (mailResult.status === "rejected" && strapiResult.status === "rejected") {
      throw new Error("Inquiry form: email and Strapi both failed");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inquiry form submission error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

/*
 ─── Required environment variables (.env.local) ───────────────────────────

 MS_TENANT_ID=<Directory (tenant) ID>
 MS_CLIENT_ID=<Application (client) ID>
 MS_CLIENT_SECRET=<client secret value>
 MS_SENDER=mailbox@yourdomain.com
 HR_INFO_EMAIL=inbox@yourdomain.com

 See lib/mail.ts for the Entra app registration this relies on.
*/