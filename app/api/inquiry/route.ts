import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
    const { fullName, email, phoneNumber, message, locale } = body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!fullName || !email || !phoneNumber || !message) {
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
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phoneNumber);
    const safeMessage = escapeHtml(message);
    // const safeLang = escapeHtml(locale ?? "en");

    // ── Build email body ──────────────────────────────────────────────────────
    const emailBody = `
New inquiry received.

Name: ${fullName}
Email: ${email}
Phone: ${phoneNumber}

Message:
${message}
    `.trim();

    const emailHtml = `
      <h2 style="color:#001239;">New Inquiry</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Name</td><td style="font-weight:600;color:#001239;">${safeName}</td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Email</td><td style="font-weight:600;color:#001239;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Phone</td><td style="font-weight:600;color:#001239;">${safePhone}</td></tr>
      </table>
      <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;" />
      <p style="color:#6E6F89;font-size:12px;text-transform:uppercase;margin-bottom:4px;">Message</p>
      <p style="color:#001239;white-space:pre-line;">${safeMessage}</p>
    `;

   console.log(emailBody);
    // ── Nodemailer transport ──────────────────────────────────────────────────
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.HR_EMAIL,
        replyTo: email,
        subject: `BRITAM ARABIA - New Inquiry — ${fullName}`,
        text: emailBody,
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

/*
 ─── Required environment variables (.env.local) ───────────────────────────

 SMTP_HOST=smtp.yourprovider.com
 SMTP_PORT=587
 SMTP_USER=your-smtp-username
 SMTP_PASS=your-smtp-password
 CONTACT_RECEIVER_EMAIL=inbox@yourdomain.com

 Install nodemailer if not already present:
   npm install nodemailer
   npm install -D @types/nodemailer
*/