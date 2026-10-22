import { NextRequest, NextResponse } from "next/server";
import { isMailConfigured, sendMail } from "@/lib/mail";
import { saveSubmission } from "@/lib/strapi-submissions";
import { clean, HONEYPOT_FIELD, isHoneypotFilled, isRateLimited } from "@/lib/spam";
import {
    buildFirefighterSchema,
    buildManagementSchema,
} from "@/components/design/organisms/Forms/Applicationschema";
import {
    ALL_CERTIFICATIONS,
    CERT_STATUSES,
    CITIES,
    ENGLISH_LEVELS,
    FIREFIGHTER_POSITIONS,
    findLabel,
    KSA_LOCATIONS,
    LICENSE_TYPES,
    MANAGEMENT_POSITIONS,
    RELIGIONS,
} from "@/components/design/organisms/Forms/Formoptions";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_FILE_EXTENSIONS = [".pdf", ".doc", ".docx"];

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
    values: Record<string, unknown>;
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
        typeof p.values === "object" &&
        p.values !== null &&
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

/**
 * Re-validates the raw form values with the same zod schemas the forms use and maps
 * them 1:1 to the Strapi fields (select values stored as their English labels).
 * Returns null when the values don't pass validation.
 */
function toStrapiEntry(payload: SubmissionPayload) {
    const job = { jobTitle: clean(payload.position, 200) };

    if (payload.formType === "management") {
        const parsed = buildManagementSchema("en").safeParse(payload.values);
        if (!parsed.success) return null;
        const v = parsed.data;
        return {
            collection: "management-applications" as const,
            data: {
                fullName: clean(v.fullName, 120),
                nationality: v.nationality,
                city: findLabel(CITIES, v.city),
                email: clean(v.email, 254),
                phone: clean(v.phone, 20),
                appliedPosition: findLabel(MANAGEMENT_POSITIONS, v.appliedPosition),
                ...job,
            },
        };
    }

    const parsed = buildFirefighterSchema("en").safeParse(payload.values);
    if (!parsed.success) return null;
    const v = parsed.data;
    return {
        collection: "firefighter-applications" as const,
        data: {
            fullName: clean(v.fullName, 120),
            nationality: v.nationality,
            age: Number(v.age),
            religion: findLabel(RELIGIONS, v.religion),
            primaryEmail: clean(v.primaryEmail, 254),
            secondaryEmail: clean(v.secondaryEmail, 254),
            phone: clean(v.phone, 20),
            appliedPositions: v.appliedPositions.map((p) => findLabel(FIREFIGHTER_POSITIONS, p)).join(", "),
            englishProficiency: findLabel(ENGLISH_LEVELS, v.englishProficiency),
            ksaLocation: findLabel(KSA_LOCATIONS, v.ksaLocation),
            hasDrivingLicense: v.hasDrivingLicense === "yes",
            licenseType:
                v.hasDrivingLicense === "yes" && v.licenseType
                    ? findLabel(LICENSE_TYPES, v.licenseType)
                    : null,
            // Same rows as the email: only certifications the applicant holds
            certifications: ALL_CERTIFICATIONS.filter(
                (c) => v.certifications[c.value] && v.certifications[c.value] !== "none"
            ).map((c) => ({
                name: c.name,
                status: findLabel(CERT_STATUSES, v.certifications[c.value]),
            })),
            jobCity: clean(payload.city, 100),
            ...job,
        },
    };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        if (isRateLimited(req, "careers")) {
            return NextResponse.json(
                { success: false, error: "Too many submissions. Please try again later." },
                { status: 429 }
            );
        }

        const formData = await req.formData();

        // Bots that fill the hidden field get a normal-looking success and nothing else
        if (isHoneypotFilled(formData.get(HONEYPOT_FIELD))) {
            return NextResponse.json({ success: true });
        }

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

        payload.position = clean(payload.position, 200);
        payload.slug = clean(payload.slug, 200);
        payload.city = clean(payload.city, 100);
        payload.fields = payload.fields.map((f) => ({
            label: clean(f.label, 100),
            value: clean(f.value, 1000),
        }));
        payload.certifications = payload.certifications?.map((c) => ({
            name: clean(c.name, 200),
            status: clean(c.status, 50),
        }));

        const entry = toStrapiEntry(payload);
        if (!entry) {
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
            const fileName = file.name.toLowerCase();
            if (
                !ACCEPTED_FILE_TYPES.includes(file.type) ||
                !ACCEPTED_FILE_EXTENSIONS.some((ext) => fileName.endsWith(ext))
            ) {
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

        const positionLabel = payload.position?.trim() || "N/A";
        const formLabel = payload.formType === "firefighters" ? "Firefighters" : "Management";

        const sendEmail = async () => {
            const recipient = process.env.HR_CAREERS_EMAIL;
            if (!recipient || !isMailConfigured()) {
                throw new Error("Careers form: missing mail config (HR_CAREERS_EMAIL / MS_TENANT_ID / MS_CLIENT_ID / MS_CLIENT_SECRET / MS_SENDER)");
            }
            await sendMail({
                to: recipient,
                replyTo,
                subject: `BRITAM ARABIA - New ${formLabel} Application - ${positionLabel}`,
                html: buildHtml(payload),
                attachments,
            });
        };

        // Strapi and the email are independent: the application counts as received if either gets it
        const [strapiResult, mailResult] = await Promise.allSettled([
            saveSubmission(entry.collection, entry.data, {
                sourcePage: `/careers/${payload.slug}`,
                file: attachments[0],
            }),
            sendEmail(),
        ]);

        if (strapiResult.status === "rejected") console.error("Careers form: Strapi save failed:", strapiResult.reason);
        if (mailResult.status === "rejected") console.error("Careers form: email failed:", mailResult.reason);
        if (strapiResult.status === "rejected" && mailResult.status === "rejected") {
            throw new Error("Careers form: Strapi and email both failed");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Career application submission error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}