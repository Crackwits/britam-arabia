import { NextRequest, NextResponse } from "next/server";
import { isMailConfigured, sendMail } from "@/lib/mail";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Keep in sync with REQUIRE_CV in components/lib/applicationSchema.ts */
const REQUIRE_CV: Record<string, boolean> = {
    management: true,
    firefighters: true,
};

interface SubmissionField {
    label: string;
    value: string;
}

interface SubmissionPayload {
    formType: "management" | "firefighters";
    position: string;
    slug: string;
    city: string;
    fields: SubmissionField[];
    certifications?: { name: string; status: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const escapeHtml = (value: unknown) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

function isValidPayload(value: unknown): value is SubmissionPayload {
    if (typeof value !== "object" || value === null) return false;
    const p = value as Record<string, unknown>;
    return (
        (p.formType === "management" || p.formType === "firefighters") &&
        Array.isArray(p.fields) &&
        p.fields.every(
            (f) =>
                typeof f === "object" &&
                f !== null &&
                typeof (f as SubmissionField).label === "string" &&
                typeof (f as SubmissionField).value === "string"
        )
    );
}

function buildHtml(payload: SubmissionPayload) {
    const rows = payload.fields
        .map(
            (f) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e5e5;background:#fafafa;width:220px;">
            <strong>${escapeHtml(f.label)}</strong>
          </td>
          <td style="padding:8px 12px;border:1px solid #e5e5e5;">${escapeHtml(f.value) || "—"}</td>
        </tr>`
        )
        .join("");

    const certRows = (payload.certifications ?? [])
        .map(
            (c) => `
        <tr>
          <td style="padding:6px 12px;border:1px solid #e5e5e5;">${escapeHtml(c.name)}</td>
          <td style="padding:6px 12px;border:1px solid #e5e5e5;">${escapeHtml(c.status)}</td>
        </tr>`
        )
        .join("");

    const certSection = payload.certifications
        ? `
      <h3 style="font-family:Arial,sans-serif;margin:24px 0 8px;">Certifications</h3>
      ${certRows
            ? `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
                   <tr>
                     <th style="padding:6px 12px;border:1px solid #e5e5e5;background:#fafafa;text-align:left;">Certification</th>
                     <th style="padding:6px 12px;border:1px solid #e5e5e5;background:#fafafa;text-align:left;">Status</th>
                   </tr>
                   ${certRows}
                 </table>`
            : `<p style="font-family:Arial,sans-serif;font-size:14px;">No certifications declared.</p>`
        }`
        : "";

    return `
    <div style="font-family:Arial,sans-serif;color:#10224A;">
      <h2 style="margin:0 0 4px;">New Job Application</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#666;">
        ${escapeHtml(payload.formType === "firefighters" ? "Firefighters" : "Management")} form
        &middot; ${escapeHtml(payload.position || "N/A")}
        ${payload.city ? `&middot; ${escapeHtml(payload.city)}` : ""}
      </p>
      <table style="border-collapse:collapse;font-size:14px;">${rows}</table>
      ${certSection}
    </div>`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const raw = formData.get("data");
        if (typeof raw !== "string") {
            return NextResponse.json(
                { success: false, error: "Missing submission data." },
                { status: 400 }
            );
        }

        let payload: unknown;
        try {
            payload = JSON.parse(raw);
        } catch {
            return NextResponse.json(
                { success: false, error: "Malformed submission data." },
                { status: 400 }
            );
        }

        if (!isValidPayload(payload)) {
            return NextResponse.json(
                { success: false, error: "Missing or invalid required fields." },
                { status: 400 }
            );
        }

        // ── File validation ──
        const file = formData.get("cv");
        const cvRequired = REQUIRE_CV[payload.formType];

        if (!(file instanceof File)) {
            if (cvRequired) {
                return NextResponse.json(
                    { success: false, error: "Resume file is required." },
                    { status: 400 }
                );
            }
        } else {
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { success: false, error: "File must be smaller than 5MB." },
                    { status: 400 }
                );
            }
            if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { success: false, error: "Only PDF, DOC, and DOCX files are accepted." },
                    { status: 400 }
                );
            }
        }

        const attachments =
            file instanceof File
                ? [
                    {
                        filename: file.name,
                        content: Buffer.from(await file.arrayBuffer()),
                        contentType: file.type,
                    },
                ]
                : [];

        // ── Reply-to: first email-looking answer in the payload ──
        const replyTo = payload.fields.find((f) => /\S+@\S+\.\S+/.test(f.value))?.value;

        const recipient = process.env.HR_CAREERS_EMAIL;
        if (!recipient || !isMailConfigured()) {
            console.error("Careers form: missing mail config (HR_CAREERS_EMAIL / MS_TENANT_ID / MS_CLIENT_ID / MS_CLIENT_SECRET / MS_SENDER)");
            return NextResponse.json(
                { success: false, error: "Mail service is not configured." },
                { status: 500 }
            );
        }

        const positionLabel = payload.position?.trim() || "N/A";
        const formLabel = payload.formType === "firefighters" ? "Firefighters" : "Management";

        await sendMail({
            to: recipient,
            replyTo,
            subject: `BRITAM ARABIA - New ${formLabel} Application - ${positionLabel}`,
            html: buildHtml(payload),
            attachments,
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