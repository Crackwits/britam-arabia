import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { inquiryType, name, email, phone, message, lang } = body;

        // ── Validation ────────────────────────────────────────────────────────────
        if (!inquiryType || !name || !email || !phone || !message) {
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
        const emailBody = `
New contact inquiry received.

Inquiry Type: ${inquiryType}
Name: ${name}
Email: ${email}
Phone: ${phone}
Language: ${lang ?? "en"}

Message:
${message}
    `.trim();

        const emailHtml = `
      <h2 style="color:#001239;">New Contact Inquiry</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Inquiry Type</td><td style="font-weight:600;color:#001239;">${inquiryType}</td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Name</td><td style="font-weight:600;color:#001239;">${name}</td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Email</td><td style="font-weight:600;color:#001239;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Phone</td><td style="font-weight:600;color:#001239;">${phone}</td></tr>
        <tr><td style="color:#6E6F89;font-size:12px;text-transform:uppercase;">Language</td><td style="font-weight:600;color:#001239;">${lang ?? "en"}</td></tr>
      </table>
      <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;" />
      <p style="color:#6E6F89;font-size:12px;text-transform:uppercase;margin-bottom:4px;">Message</p>
      <p style="color:#001239;white-space:pre-line;">${message}</p>
    `;

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
            subject: `BRITAM ARABIA - New Contact Inquiry — ${inquiryType}`,
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