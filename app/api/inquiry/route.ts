import { NextRequest, NextResponse } from "next/server";
import { isMailConfigured, sendMail } from "@/lib/mail";
import { createHubSpotLead, isHubSpotConfigured } from "@/lib/hubspot";

export const runtime = "nodejs";

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
    const body = await req.json();
    const { fullName, email, phoneNumber, companyName, message, locale } = body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!fullName || !email || !phoneNumber || !companyName || !message) {
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
    if (!recipient || !isMailConfigured() || !isHubSpotConfigured()) {
      console.error("Inquiry form: missing config (HR_INFO_EMAIL / MS_TENANT_ID / MS_CLIENT_ID / MS_CLIENT_SECRET / MS_SENDER / HUBSPOT_ACCESS_TOKEN)");
      return NextResponse.json(
        { success: false, error: "Mail service is not configured." },
        { status: 500 }
      );
    }

    // The submission counts as received if either the email or HubSpot gets it
    const [mailResult, hubspotResult] = await Promise.allSettled([
      sendMail({
        to: recipient,
        replyTo: email,
        subject: `BRITAM ARABIA - New Inquiry — ${fullName}`,
        html: emailHtml,
      }),
      createHubSpotLead({
        source: "inquiry_form",
        fullName,
        email,
        phone: phoneNumber,
        companyName,
        dealName: `${companyName} — Website Inquiry`,
        description: `Inquiry type: Make an Inquiry (homepage form)\n\nMessage:\n${message}`,
      }),
    ]);

    if (mailResult.status === "rejected") console.error("Inquiry form: email failed:", mailResult.reason);
    if (hubspotResult.status === "rejected") console.error("Inquiry form: HubSpot failed:", hubspotResult.reason);
    if (mailResult.status === "rejected" && hubspotResult.status === "rejected") {
      throw new Error("Inquiry form: email and HubSpot both failed");
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
 HUBSPOT_ACCESS_TOKEN=pat-...

 See lib/mail.ts for the Entra app registration this relies on.
*/