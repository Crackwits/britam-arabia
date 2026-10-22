// Saves form submissions to Strapi (v5) from the server. The token only needs
// `create` on the submission collections plus the Upload plugin's `upload` —
// it is deliberately separate from STRAPI_API_TOKEN, which the site uses for reads.

import { STRAPI_URL as PUBLIC_STRAPI_URL } from "@/components/lib/settings";

const STRAPI_URL = (process.env.STRAPI_URL || PUBLIC_STRAPI_URL).replace(/\/+$/, "");

export type SubmissionCollection =
    | "management-applications"
    | "firefighter-applications"
    | "business-inquiries"
    | "homepage-inquiries";

export interface SubmissionFile {
    filename: string;
    content: Buffer;
    contentType: string;
}

export function isStrapiSubmissionsConfigured() {
    return Boolean(STRAPI_URL && process.env.STRAPI_FORMS_API_TOKEN);
}

const authHeader = () => ({ Authorization: `Bearer ${process.env.STRAPI_FORMS_API_TOKEN}` });

async function uploadFile(file: SubmissionFile): Promise<number> {
    const form = new FormData();
    form.append(
        "files",
        new Blob([new Uint8Array(file.content)], { type: file.contentType }),
        file.filename
    );

    const res = await fetch(`${STRAPI_URL}/api/upload`, {
        method: "POST",
        headers: authHeader(),
        body: form,
    });
    if (!res.ok) {
        throw new Error(`Strapi upload failed: ${res.status} ${await res.text()}`);
    }
    const [uploaded] = (await res.json()) as { id: number }[];
    return uploaded.id;
}

/**
 * Creates an entry in `collection`. Every entry gets submittedAt / sourcePage / reviewStatus
 * (not `status`, which Strapi 5 reserves for Draft & Publish).
 * When `file` is given it is uploaded first and linked through the `cv` media field;
 * if only the upload fails, the entry is still saved without it.
 */
export async function saveSubmission(
    collection: SubmissionCollection,
    data: Record<string, unknown>,
    { sourcePage, file }: { sourcePage: string; file?: SubmissionFile }
) {
    if (!isStrapiSubmissionsConfigured()) {
        throw new Error("Strapi submissions are not configured (STRAPI_URL / STRAPI_FORMS_API_TOKEN)");
    }

    let cv: number | undefined;
    if (file) {
        try {
            cv = await uploadFile(file);
        } catch (error) {
            console.error(`Strapi ${collection}: CV upload failed, saving entry without it:`, error);
        }
    }

    const res = await fetch(`${STRAPI_URL}/api/${collection}`, {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({
            data: {
                ...data,
                ...(cv !== undefined ? { cv } : {}),
                submittedAt: new Date().toISOString(),
                sourcePage,
                reviewStatus: "new",
            },
        }),
    });
    if (!res.ok) {
        throw new Error(`Strapi create ${collection} failed: ${res.status} ${await res.text()}`);
    }
}
