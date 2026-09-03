import { z } from "zod";
import {
    CITIES,
    FIREFIGHTER_POSITIONS,
    MANAGEMENT_POSITIONS,
    NATIONALITIES,
    type Lang,
} from "../Formoptions";

// ─── File constraints (shared with the API route) ─────────────────────────────

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_EXTENSIONS = [".pdf", ".doc", ".docx"];
export const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Flip to false if the firefighter form should not demand a CV. */
export const REQUIRE_CV: Record<"management" | "firefighters", boolean> = {
    management: true,
    firefighters: true,
};

// ─── Messages ─────────────────────────────────────────────────────────────────

const m = (lang: Lang) => ({
    required: lang === "ar" ? "هذا الحقل مطلوب" : "This field is required",
    name: lang === "ar" ? "يرجى إدخال الاسم الكامل" : "Please enter your full name",
    email: lang === "ar" ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email address",
    phone: lang === "ar" ? "يرجى إدخال رقم هاتف صحيح" : "Please enter a valid phone number",
    nationality: lang === "ar" ? "يرجى اختيار الجنسية" : "Please select your nationality",
    city: lang === "ar" ? "يرجى اختيار المدينة" : "Please select a city",
    position: lang === "ar" ? "يرجى اختيار الوظيفة" : "Please select a position",
    positions: lang === "ar" ? "يرجى اختيار وظيفة واحدة على الأقل" : "Please select at least one position",
    age: lang === "ar" ? "يجب أن يكون العمر بين ١٨ و ٦٥" : "Age must be between 18 and 65",
    ageNumber: lang === "ar" ? "يجب أن تكون القيمة رقمًا" : "The value must be a number",
    sameEmail:
        lang === "ar"
            ? "يجب أن يختلف البريد الإلكتروني الثانوي عن الأساسي"
            : "Secondary email must be different from the primary one",
    licenseType:
        lang === "ar" ? "يرجى تحديد نوع رخصة القيادة" : "Please select your driving license type",
});

// ─── Option value tuples ──────────────────────────────────────────────────────

const PHONE_RE = /^[+()\-\s\d]{7,20}$/;

const nationalityValues = NATIONALITIES as unknown as [string, ...string[]];
const cityValues = CITIES.map((c) => c.value) as [string, ...string[]];
const managementPositionValues = MANAGEMENT_POSITIONS.map((p) => p.value) as [string, ...string[]];
const firefighterPositionValues = FIREFIGHTER_POSITIONS.map((p) => p.value) as [string, ...string[]];

// ─── Management schema ────────────────────────────────────────────────────────

export function buildManagementSchema(lang: Lang) {
    const msg = m(lang);

    return z.object({
        fullName: z.string().trim().min(2, msg.name).max(120),
        nationality: z.enum(nationalityValues, { message: msg.nationality }),
        city: z.enum(cityValues, { message: msg.city }),
        email: z.string().trim().min(1, msg.required).email(msg.email),
        phone: z.string().trim().min(1, msg.required).regex(PHONE_RE, msg.phone),
        appliedPosition: z.enum(managementPositionValues, { message: msg.position }),
    });
}

export type ManagementFormValues = z.infer<ReturnType<typeof buildManagementSchema>>;

// ─── Firefighters schema ──────────────────────────────────────────────────────

export function buildFirefighterSchema(lang: Lang) {
    const msg = m(lang);

    return z
        .object({
            fullName: z.string().trim().min(2, msg.name).max(120),
            nationality: z.enum(nationalityValues, { message: msg.nationality }),
            // city: z.enum(cityValues, { message: msg.city }),
            // Kept as a string so the schema's input and output types match —
            // z.coerce.number() types its input as unknown and breaks zodResolver.
            age: z
                .string()
                .trim()
                .min(1, msg.required)
                .regex(/^\d{1,3}$/, msg.ageNumber)
                .refine((v) => Number(v) >= 18 && Number(v) <= 65, msg.age),
            religion: z.enum(["muslim", "non-muslim"], { message: msg.required }),
            primaryEmail: z.string().trim().min(1, msg.required).email(msg.email),
            secondaryEmail: z.string().trim().min(1, msg.required).email(msg.email),
            phone: z.string().trim().min(1, msg.required).regex(PHONE_RE, msg.phone),
            appliedPositions: z.array(z.enum(firefighterPositionValues)).min(1, msg.positions),
            englishProficiency: z.enum(["poor", "good", "excellent"], { message: msg.required }),
            ksaLocation: z.enum(["in", "out"], { message: msg.required }),
            hasDrivingLicense: z.enum(["yes", "no"], { message: msg.required }),
            licenseType: z.enum(["private", "light", "heavy"]).optional(),
            // The matrix is controlled outside RHF and every row is pre-filled,
            // so a record is enough here.
            certifications: z.record(
                z.string(),
                z.enum(["certified", "non-certified", "none"])
            ),
        })
        .superRefine((data, ctx) => {
            if (data.hasDrivingLicense === "yes" && !data.licenseType) {
                ctx.addIssue({
                    code: "custom",
                    path: ["licenseType"],
                    message: msg.licenseType,
                });
            }
            if (
                data.secondaryEmail &&
                data.primaryEmail.toLowerCase() === data.secondaryEmail.toLowerCase()
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["secondaryEmail"],
                    message: msg.sameEmail,
                });
            }
        });
}

export type FirefighterFormValues = z.infer<ReturnType<typeof buildFirefighterSchema>>;