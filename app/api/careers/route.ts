import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // const name = formData.get("name");
        // const email = formData.get("email");
        // const phone = formData.get("phone");
        const position = formData.get("position");
        const slug = formData.get("slug");
        const file = formData.get("cv");

        // ── Field presence validation ──
        // if (
        //     typeof name !== "string" ||
        //     typeof email !== "string" ||
        //     typeof phone !== "string" ||
        //     !name.trim() ||
        //     !email.trim() ||
        //     !phone.trim()
        // ) {
        //     return NextResponse.json(
        //         { success: false, error: "Missing or invalid required fields." },
        //         { status: 400 }
        //     );
        // }

        if (!(file instanceof File)) {
            return NextResponse.json(
                { success: false, error: "Resume file is required." },
                { status: 400 }
            );
        }

        // ── File validation ──
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: "File must be smaller than 5MB." },
                { status: 400 }
            );
        }

        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Only PDF, DOC, and DOCX files are accepted.",
                },
                { status: 400 }
            );
        }

        // ── Convert file to buffer for attachment ──
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // ── Build transporter ──
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            requireTLS: true, // add this for Gmail specifically
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const positionLabel =
            typeof position === "string" && position.trim() ? position : "N/A";
        const slugLabel = typeof slug === "string" && slug.trim() ? slug : "N/A";

        // ── Send email ──
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.HR_EMAIL,
            // replyTo: email,
            subject: `New Job Application - ${positionLabel}`,
            text: `
New job application received.

Position: ${positionLabel}
Slug: ${slugLabel}
      `.trim(),
            html: `
        <h2>New Job Application</h2>
        <p><strong>Position:</strong> ${positionLabel}</p>
        <p><strong>Slug:</strong> ${slugLabel}</p>
        <hr />
      `,
            attachments: [
                {
                    filename: file.name,
                    content: buffer,
                },
            ],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Career application submission error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}