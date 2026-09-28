// Sends mail through Microsoft Graph as MS_SENDER, using an Entra app registration
// (client credentials) with the Mail.Send application permission.

const GRAPH_URL = "https://graph.microsoft.com/v1.0";

// Graph rejects sendMail requests over 4MB, so anything larger is sent as a draft
// with its attachments uploaded in chunks (this path also needs Mail.ReadWrite).
const INLINE_ATTACHMENTS_LIMIT = 3 * 1024 * 1024;
const UPLOAD_CHUNK_SIZE = 3 * 1024 * 1024;

export interface MailAttachment {
    filename: string;
    content: Buffer;
    contentType?: string;
}

export interface MailOptions {
    /** One address, or several separated by commas */
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
    attachments?: MailAttachment[];
}

export function isMailConfigured() {
    return Boolean(
        process.env.MS_TENANT_ID &&
        process.env.MS_CLIENT_ID &&
        process.env.MS_CLIENT_SECRET &&
        process.env.MS_SENDER
    );
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken() {
    if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

    const res = await fetch(
        `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}/oauth2/v2.0/token`,
        {
            method: "POST",
            body: new URLSearchParams({
                client_id: process.env.MS_CLIENT_ID!,
                client_secret: process.env.MS_CLIENT_SECRET!,
                scope: "https://graph.microsoft.com/.default",
                grant_type: "client_credentials",
            }),
        }
    );
    if (!res.ok) {
        throw new Error(`Graph token request failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    // Refresh a minute early so a token never expires mid-request
    cachedToken = {
        value: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };
    return data.access_token;
}

async function graphPost(token: string, path: string, body?: unknown) {
    const sender = encodeURIComponent(process.env.MS_SENDER!);
    const res = await fetch(`${GRAPH_URL}/users/${sender}${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
        throw new Error(`Graph POST ${path} failed: ${res.status} ${await res.text()}`);
    }
    return res;
}

const toRecipients = (addresses: string) =>
    addresses
        .split(",")
        .map((address) => address.trim())
        .filter(Boolean)
        .map((address) => ({ emailAddress: { address } }));

const toFileAttachment = (attachment: MailAttachment) => ({
    "@odata.type": "#microsoft.graph.fileAttachment",
    name: attachment.filename,
    contentType: attachment.contentType || "application/octet-stream",
    contentBytes: attachment.content.toString("base64"),
});

async function uploadLargeAttachment(token: string, messageId: string, attachment: MailAttachment) {
    const res = await graphPost(
        token,
        `/messages/${messageId}/attachments/createUploadSession`,
        {
            AttachmentItem: {
                attachmentType: "file",
                name: attachment.filename,
                size: attachment.content.length,
                contentType: attachment.contentType || "application/octet-stream",
            },
        }
    );
    const { uploadUrl } = (await res.json()) as { uploadUrl: string };
    const size = attachment.content.length;

    for (let start = 0; start < size; start += UPLOAD_CHUNK_SIZE) {
        const end = Math.min(start + UPLOAD_CHUNK_SIZE, size);
        // The upload URL is pre-authorised; sending a bearer token to it is rejected
        const chunkRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Range": `bytes ${start}-${end - 1}/${size}`,
            },
            body: new Uint8Array(attachment.content.subarray(start, end)),
        });
        if (!chunkRes.ok) {
            throw new Error(`Graph attachment upload failed: ${chunkRes.status} ${await chunkRes.text()}`);
        }
    }
}

export async function sendMail({ to, subject, html, replyTo, attachments = [] }: MailOptions) {
    const token = await getAccessToken();

    const message = {
        subject,
        body: { contentType: "HTML", content: html },
        toRecipients: toRecipients(to),
        ...(replyTo ? { replyTo: toRecipients(replyTo) } : {}),
    };

    const attachmentsSize = attachments.reduce((total, a) => total + a.content.length, 0);

    if (attachmentsSize <= INLINE_ATTACHMENTS_LIMIT) {
        await graphPost(token, "/sendMail", {
            message: { ...message, attachments: attachments.map(toFileAttachment) },
            saveToSentItems: true,
        });
        return;
    }

    const draftRes = await graphPost(token, "/messages", message);
    const { id } = (await draftRes.json()) as { id: string };

    for (const attachment of attachments) {
        // Upload sessions only accept files of 3MB or more
        if (attachment.content.length < INLINE_ATTACHMENTS_LIMIT) {
            await graphPost(token, `/messages/${id}/attachments`, toFileAttachment(attachment));
        } else {
            await uploadLargeAttachment(token, id, attachment);
        }
    }

    await graphPost(token, `/messages/${id}/send`);
}
