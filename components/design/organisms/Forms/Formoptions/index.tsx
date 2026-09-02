// ─── Shared option lists for the career application forms ─────────────────────

export type Lang = "en" | "ar";

export interface Option {
    value: string;
    en: string;
    ar: string;
}

/** Which form a job posting renders. Comes from the CMS on the career entry. */
export type FormType = "management" | "firefighters";

export const label = (opt: Option, lang: Lang) => (lang === "ar" ? opt.ar : opt.en);

export const findLabel = (options: readonly Option[], value: string, lang: Lang = "en") =>
    options.find((o) => o.value === value)?.[lang] ?? value;

// ─── Nationalities (from the BA Applicant Data Collection form) ───────────────

export const NATIONALITIES: readonly string[] = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
    "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
    "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
    "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
    "Congo, Democratic Republic of the", "Costa Rica", "Croatia", "Cuba", "Cyprus",
    "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
    "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
    "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran",
    "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo",
    "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
    "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
    "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
    "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
    "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan",
    "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru",
    "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
    "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
    "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka",
    "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
    "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
    "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
    "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
    "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
    "Zambia", "Zimbabwe",
] as const;

// ─── Cities ───────────────────────────────────────────────────────────────────

export const CITIES: readonly Option[] = [
    { value: "jeddah", en: "Jeddah", ar: "جدة" },
    { value: "riyadh", en: "Riyadh", ar: "الرياض" },
    { value: "northern-region", en: "Northern Region", ar: "المنطقة الشمالية" },
    { value: "eastern-region", en: "Eastern Region", ar: "المنطقة الشرقية" },
] as const;

// ─── Management form ──────────────────────────────────────────────────────────

export const MANAGEMENT_POSITIONS: readonly Option[] = [
    { value: "accounting", en: "Accounting", ar: "المحاسبة" },
    { value: "finance", en: "Finance", ar: "المالية" },
    { value: "hr", en: "HR", ar: "الموارد البشرية" },
    { value: "business-development", en: "Business Development", ar: "تطوير الأعمال" },
    { value: "operations", en: "Operations", ar: "العمليات" },
    { value: "supply-chain", en: "Supply Chain", ar: "سلسلة الإمداد" },
    { value: "admin-support", en: "Admin Support", ar: "الدعم الإداري" },
] as const;

// ─── Firefighters form ────────────────────────────────────────────────────────

export const FIREFIGHTER_POSITIONS: readonly Option[] = [
    { value: "dispatcher", en: "Dispatcher", ar: "منسق عمليات" },
    { value: "firefighter", en: "Firefighter", ar: "رجل إطفاء" },
    { value: "driver-operator", en: "Driver Operator", ar: "سائق مشغل" },
    { value: "captain", en: "Captain", ar: "قائد فرقة" },
    { value: "station-commander", en: "Station Commander", ar: "قائد محطة" },
    { value: "fire-inspector", en: "Fire Inspector", ar: "مفتش حريق" },
] as const;

export const RELIGIONS: readonly Option[] = [
    { value: "muslim", en: "Muslim", ar: "مسلم" },
    { value: "non-muslim", en: "Non-Muslim", ar: "غير مسلم" },
] as const;

export const ENGLISH_LEVELS: readonly Option[] = [
    { value: "poor", en: "Poor", ar: "ضعيف" },
    { value: "good", en: "Good", ar: "جيد" },
    { value: "excellent", en: "Excellent", ar: "ممتاز" },
] as const;

export const KSA_LOCATIONS: readonly Option[] = [
    { value: "in", en: "In", ar: "داخل المملكة" },
    { value: "out", en: "Out", ar: "خارج المملكة" },
] as const;

export const YES_NO: readonly Option[] = [
    { value: "yes", en: "Yes", ar: "نعم" },
    { value: "no", en: "No", ar: "لا" },
] as const;

export const LICENSE_TYPES: readonly Option[] = [
    { value: "private", en: "Private", ar: "خصوصي" },
    { value: "light", en: "Light", ar: "خفيف" },
    { value: "heavy", en: "Heavy", ar: "ثقيل" },
] as const;

// ─── Certifications matrix ────────────────────────────────────────────────────

export const CERT_STATUSES: readonly Option[] = [
    { value: "certified", en: "Certified", ar: "معتمد" },
    { value: "non-certified", en: "Non-Certified", ar: "غير معتمد" },
    { value: "none", en: "None", ar: "لا يوجد" },
] as const;

export type CertStatus = "certified" | "non-certified" | "none";

/** Certification names stay in English in both locales — they are proper credential titles. */
export interface Certification {
    value: string;
    name: string;
}

export const CERTIFICATIONS_GROUP_1: readonly Certification[] = [
    { value: "hazmat-awareness", name: "HazMat Awareness" },
    { value: "hazmat-operations", name: "HazMat Operations" },
    { value: "hazmat-technician", name: "HazMat Technician" },
    { value: "firefighter-i", name: "Firefighter I" },
    { value: "firefighter-ii", name: "Firefighter II" },
    { value: "airport-firefighter", name: "Airport Firefighter" },
    { value: "public-telecommunicator-i", name: "Public Telecommunicator I" },
    { value: "public-telecommunicator-ii", name: "Public Telecommunicator II" },
    { value: "driver-operator-pumper", name: "Driver Operator Pumper" },
    { value: "fire-instructor-i", name: "Fire Instructor I" },
    { value: "fire-instructor-ii", name: "Fire Instructor II" },
    { value: "fire-instructor-iii", name: "Fire Instructor III" },
    { value: "fire-officer-i", name: "Fire Officer I" },
    { value: "fire-officer-ii", name: "Fire Officer II" },
    { value: "fire-officer-iii", name: "Fire Officer III" },
] as const;

export const CERTIFICATIONS_GROUP_2: readonly Certification[] = [
    { value: "fire-inspector-i", name: "Fire Inspector I" },
    { value: "fire-inspector-ii", name: "Fire Inspector II" },
    { value: "ics-100", name: "ICS 100" },
    { value: "ics-200", name: "ICS 200" },
    { value: "ics-700", name: "ICS 700" },
    { value: "rope-rescue-awareness", name: "Rope Rescue Awareness" },
    { value: "rope-rescue-operations", name: "Rope Rescue Operations" },
    { value: "rope-rescue-technician", name: "Rope Rescue Technician" },
    { value: "rope-rescue-confined-space", name: "Rope Rescue Confined Space" },
    { value: "bls-cpr", name: "BLS-CPR" },
] as const;

export const ALL_CERTIFICATIONS: readonly Certification[] = [
    ...CERTIFICATIONS_GROUP_1,
    ...CERTIFICATIONS_GROUP_2,
];

/** Every row starts at "none" so the applicant only marks what they actually hold. */
export const defaultCertifications = (): Record<string, CertStatus> =>
    Object.fromEntries(ALL_CERTIFICATIONS.map((c) => [c.value, "none" as CertStatus]));