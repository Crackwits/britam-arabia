import {
    ACCEPTED_FILE_TYPES,
    MAX_FILE_SIZE,
} from "../Applicationschema";
import type { FormType, Lang } from "../Formoptions";

export interface SubmissionField {
    label: string;
    value: string;
}

export interface SubmissionPayload {
    formType: FormType;
    position: string;
    slug: string;
    city: string;
    /** Ordered, human-readable answers — the API renders them straight into the email. */
    fields: SubmissionField[];
    /** Firefighters only: rows the applicant did not mark as "None". */
    certifications?: { name: string; status: string }[];
}

export async function submitApplication(payload: SubmissionPayload, cvFile: File | null) {
    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));
    if (cvFile) formData.append("cv", cvFile);

    const response = await fetch("/api/careers", { method: "POST", body: formData });
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error || "Submission failed");
    }
    return result;
}

/** Returns an error message, or undefined when the file is acceptable. */
export function validateCv(
    file: File | null,
    lang: Lang,
    required: boolean
): string | undefined {
    const isArabic = lang === "ar";

    if (!file) {
        if (!required) return undefined;
        return isArabic ? "يرجى إرفاق السيرة الذاتية" : "Please attach your resume";
    }
    if (file.size > MAX_FILE_SIZE) {
        return isArabic
            ? "يجب أن يكون حجم الملف أقل من 5 ميجابايت"
            : "File must be smaller than 5MB";
    }
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        return isArabic
            ? "يُقبل فقط ملفات PDF أو DOC أو DOCX"
            : "Only PDF, DOC, and DOCX files are accepted";
    }
    return undefined;
}