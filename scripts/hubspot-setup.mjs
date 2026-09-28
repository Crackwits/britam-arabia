// One-time setup: creates the custom "Inquiry Source" deal property used by lib/hubspot.ts.
// Needs the crm.schemas.deals.write scope. Safe to re-run.
//
//   node --env-file=.env.local scripts/hubspot-setup.mjs

const token = process.env.HUBSPOT_ACCESS_TOKEN;
if (!token) {
    console.error("HUBSPOT_ACCESS_TOKEN is not set");
    process.exit(1);
}

const res = await fetch("https://api.hubapi.com/crm/v3/properties/deals", {
    method: "POST",
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: "inquiry_source",
        label: "Inquiry Source",
        description: "Website form the deal came from",
        groupName: "dealinformation",
        type: "enumeration",
        fieldType: "select",
        // Values must match InquirySource in lib/hubspot.ts
        options: [
            { label: "Inquiry Form", value: "inquiry_form", displayOrder: 0 },
            { label: "Contact Form", value: "contact_form", displayOrder: 1 },
            { label: "Assess Your Risk", value: "assess_your_risk", displayOrder: 2 },
        ],
    }),
});

if (res.status === 409) {
    console.log("Inquiry Source property already exists");
} else if (!res.ok) {
    console.error(`Failed to create property: ${res.status} ${await res.text()}`);
    process.exit(1);
} else {
    console.log("Created Inquiry Source deal property");
}
