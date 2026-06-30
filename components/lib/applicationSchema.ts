import { z } from "zod";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ACCEPTED_FILE_EXTENSIONS = [".pdf", ".doc", ".docx"];

// ─── Translations (validation messages) ───────────────────────────────────────

const messages = {
    en: {
        name: "Please enter your full name (min. 2 characters)",
        email: "Please enter a valid email address",
        phone: "Please enter a valid phone number",
        cvRequired: "Please attach your resume",
        cvSize: "File must be smaller than 5MB",
        cvType: "Only PDF, DOC, and DOCX files are accepted",
    },
    ar: {
        name: "يرجى إدخال الاسم الكامل (حرفان على الأقل)",
        email: "يرجى إدخال بريد إلكتروني صحيح",
        phone: "يرجى إدخال رقم هاتف صحيح",
        cvRequired: "يرجى إرفاق السيرة الذاتية",
        cvSize: "يجب أن يكون حجم الملف أقل من 5 ميجابايت",
        cvType: "يُقبل فقط ملفات PDF أو DOC أو DOCX",
    },
} as const;

// ─── Schema builder (locale-aware error messages) ─────────────────────────────

export function buildApplicationSchema(locale: "en" | "ar" = "en") {
    const t = messages[locale];

    return z.object({
        name: z.string().trim().min(2, t.name),
        email: z.string().trim().email(t.email),
        phone: z
            .string()
            .trim()
            .min(6, t.phone)
            .regex(/^[+0-9()\s-]+$/, t.phone),
        cv: z
            .custom<File>((file) => file instanceof File, t.cvRequired)
            .refine((file) => file.size <= MAX_FILE_SIZE, t.cvSize)
            .refine(
                (file) =>
                    ACCEPTED_FILE_TYPES.includes(
                        file.type as (typeof ACCEPTED_FILE_TYPES)[number]
                    ),
                t.cvType
            ),
    });
}

export type ApplicationFormValues = z.infer<
    ReturnType<typeof buildApplicationSchema>
>;