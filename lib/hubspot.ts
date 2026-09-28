// Records website form submissions in HubSpot as a Contact + Company + Deal,
// all associated with each other. Authenticates with a HubSpot Service Key
// (pat- bearer token) that has the contacts/companies/deals write scopes.

const HUBSPOT_URL = "https://api.hubapi.com";

// "Deals pipeline" → "Lead Qualified (SQL)" stage
const DEAL_PIPELINE = "default";
const DEAL_STAGE = "appointmentscheduled";

// HubSpot-defined association type IDs
const DEAL_TO_CONTACT = 3;
const DEAL_TO_PRIMARY_COMPANY = 5;

/** Option values of the custom "Inquiry Source" deal property (scripts/hubspot-setup.mjs) */
export type InquirySource = "inquiry_form" | "contact_form" | "assess_your_risk";

export interface HubSpotLead {
    source: InquirySource;
    fullName: string;
    email: string;
    phone?: string;
    companyName: string;
    jobTitle?: string;
    dealName: string;
    /** Plain text; shown as the Deal Description */
    description: string;
}

export function isHubSpotConfigured() {
    return Boolean(process.env.HUBSPOT_ACCESS_TOKEN);
}

async function hubspot<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${HUBSPOT_URL}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
        throw new Error(`HubSpot ${method} ${path} failed: ${res.status} ${text}`);
    }
    return (text ? JSON.parse(text) : undefined) as T;
}

function splitName(fullName: string) {
    const [firstname, ...rest] = fullName.trim().split(/\s+/);
    return { firstname, lastname: rest.join(" ") };
}

/** Creates the contact, or updates the existing one with the same email */
async function upsertContact(lead: HubSpotLead) {
    const { results } = await hubspot<{ results: { id: string }[] }>(
        "POST",
        "/crm/v3/objects/contacts/batch/upsert",
        {
            inputs: [
                {
                    idProperty: "email",
                    id: lead.email.trim().toLowerCase(),
                    properties: {
                        ...splitName(lead.fullName),
                        company: lead.companyName,
                        ...(lead.phone ? { phone: lead.phone } : {}),
                        ...(lead.jobTitle ? { jobtitle: lead.jobTitle } : {}),
                    },
                },
            ],
        }
    );
    return results[0].id;
}

/** Reuses a company with exactly the same name, so repeat submissions don't create duplicates */
async function findOrCreateCompany(name: string) {
    const { results } = await hubspot<{ results: { id: string }[] }>(
        "POST",
        "/crm/v3/objects/companies/search",
        {
            filterGroups: [{ filters: [{ propertyName: "name", operator: "EQ", value: name }] }],
            properties: ["name"],
            limit: 1,
        }
    );
    if (results.length) return results[0].id;

    const company = await hubspot<{ id: string }>("POST", "/crm/v3/objects/companies", {
        properties: { name },
    });
    return company.id;
}

export async function createHubSpotLead(lead: HubSpotLead) {
    const [contactId, companyId] = await Promise.all([
        upsertContact(lead),
        findOrCreateCompany(lead.companyName.trim()),
    ]);

    await hubspot(
        "PUT",
        `/crm/v4/objects/contact/${contactId}/associations/default/company/${companyId}`
    );

    const association = (id: string, typeId: number) => ({
        to: { id },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: typeId }],
    });

    await hubspot("POST", "/crm/v3/objects/deals", {
        properties: {
            dealname: lead.dealName,
            pipeline: DEAL_PIPELINE,
            dealstage: DEAL_STAGE,
            description: lead.description,
            inquiry_source: lead.source,
        },
        associations: [
            association(contactId, DEAL_TO_CONTACT),
            association(companyId, DEAL_TO_PRIMARY_COMPANY),
        ],
    });
}
