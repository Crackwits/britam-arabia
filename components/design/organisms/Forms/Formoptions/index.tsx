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
    { value: "dispatcher", en: "Dispatcher", ar: "موجه اتصالات" },
    { value: "firefighter", en: "Firefighter", ar: "رجل إطفاء" },
    { value: "driver-operator", en: "Driver Operator", ar: "سائق ومشغل" },
    { value: "captain", en: "Captain", ar: "قائد فرقة" },
    { value: "station-commander", en: "Station Commander", ar: "قائد محطة" },
    { value: "fire-inspector", en: "Fire Inspector", ar: "مفتش سلامة وحريق" },
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
    { value: "in", en: "In", ar: "داخل المملكة العربية السعودية" },
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
    { value: "certified", en: "Certified", ar: "معتمدة" },
    { value: "non-certified", en: "Non-Certified", ar: "غير معتمدة" },
    { value: "none", en: "None", ar: "لا يوجد" },
] as const;

export type CertStatus = "certified" | "non-certified" | "none";

/** Certification credential titles, with an Arabic translation for display. */
export interface Certification {
    value: string;
    name: string; // English name (credential titles stay in English internally/in emails)
    ar: string;   // Arabic display label
}

/** Single merged list — replaces the old CERTIFICATIONS_GROUP_1 / GROUP_2 split. */
// export const ALL_CERTIFICATIONS: readonly Certification[] = [
//     { value: "hazmat-awareness", name: "HazMat Awareness", ar: "الوعي بالمواد الخطرة" },
//     { value: "hazmat-operations", name: "HazMat Operations", ar: "عمليات المواد الخطرة" },
//     { value: "hazmat-technician", name: "HazMat Technician", ar: "فني المواد الخطرة" },
//     { value: "firefighter-i", name: "Firefighter I", ar: "رجل إطفاء - المستوى الأول" },
//     { value: "firefighter-ii", name: "Firefighter II", ar: "رجل إطفاء - المستوى الثاني" },
//     { value: "airport-firefighter", name: "Airport Firefighter", ar: "رجل إطفاء المطارات" },
//     { value: "public-telecommunicator-i", name: "Public Telecommunicator I", ar: "موجه اتصالات عامة - المستوى الأول" },
//     { value: "public-telecommunicator-ii", name: "Public Telecommunicator II", ar: "موجه اتصالات عامة - المستوى الثاني" },
//     { value: "driver-operator-pumper", name: "Driver Operator Pumper", ar: "سائق ومشغل مضخة" },
//     { value: "fire-instructor-i", name: "Fire Instructor I", ar: "مدرب سلامة وحريق - المستوى الأول" },
//     { value: "fire-instructor-ii", name: "Fire Instructor II", ar: "مدرب سلامة وحريق - المستوى الثاني" },
//     { value: "fire-instructor-iii", name: "Fire Instructor III", ar: "مدرب سلامة وحريق - المستوى الثالث" },
//     { value: "fire-officer-i", name: "Fire Officer I", ar: "ضابط سلامة وحريق - المستوى الأول" },
//     { value: "fire-officer-ii", name: "Fire Officer II", ar: "ضابط سلامة وحريق - المستوى الثاني" },
//     { value: "fire-officer-iii", name: "Fire Officer III", ar: "ضابط سلامة وحريق - المستوى الثالث" },
//     { value: "fire-inspector-i", name: "Fire Inspector I", ar: "مفتش سلامة وحريق - المستوى الأول" },
//     { value: "fire-inspector-ii", name: "Fire Inspector II", ar: "مفتش سلامة وحريق - المستوى الثاني" },
//     { value: "ics-100", name: "ICS 100", ar: "نظام قيادة الحوادث 100" },
//     { value: "ics-200", name: "ICS 200", ar: "نظام قيادة الحوادث 200" },
//     { value: "ics-700", name: "ICS 700", ar: "نظام قيادة الحوادث 700" },
//     { value: "rope-rescue-awareness", name: "Rope Rescue Awareness", ar: "الوعي بالإنقاذ بالحبال" },
//     { value: "rope-rescue-operations", name: "Rope Rescue Operations", ar: "عمليات الإنقاذ بالحبال" },
//     { value: "rope-rescue-technician", name: "Rope Rescue Technician", ar: "فني الإنقاذ بالحبال" },
//     { value: "rope-rescue-confined-space", name: "Rope Rescue Confined Space", ar: "الإنقاذ بالحبال في الأماكن الضيقة" },
//     { value: "bls-cpr", name: "BLS-CPR", ar: "دعم الحياة الأساسي والإنعاش القلبي الرئوي" },
// ] as const;

export const ALL_CERTIFICATIONS: readonly Certification[] = [
    { value: "hazmat-awareness", name: "HazMat Awareness", ar: "التوعية بالمواد الخطرة" },
    { value: "hazmat-operations", name: "HazMat Operations", ar: "عمليات المواد الخطرة" },
    { value: "hazmat-technician", name: "HazMat Technician", ar: "فني مواد خطرة" },
    { value: "firefighter-i", name: "Firefighter I", ar: "إطفائي 1" },
    { value: "firefighter-ii", name: "Firefighter II", ar: "إطفائي 2" },
    { value: "airport-firefighter", name: "Airport Firefighter", ar: "إطفائي مطارات" },
    { value: "public-telecommunicator-i", name: "Public Telecommunicator I", ar: "الاتصالات والاستجابة للجمهور 1" },
    { value: "public-telecommunicator-ii", name: "Public Telecommunicator II", ar: "الاتصالات والاستجابة للجمهور 2" },
    { value: "driver-operator-pumper", name: "Driver Operator Pumper", ar: "سائق ومشغل مضخات" },
    { value: "fire-instructor-i", name: "Fire Instructor I", ar: "مدرب حريق 1" },
    { value: "fire-instructor-ii", name: "Fire Instructor II", ar: "مدرب حريق 2" },
    { value: "fire-instructor-iii", name: "Fire Instructor III", ar: "مدرب حريق 3" },
    { value: "fire-officer-i", name: "Fire Officer I", ar: "ضابط حريق 1" },
    { value: "fire-officer-ii", name: "Fire Officer II", ar: "ضابط حريق 2" },
    { value: "fire-officer-iii", name: "Fire Officer III", ar: "ضابط حريق 3" },
    { value: "fire-inspector-i", name: "Fire Inspector I", ar: "مفتش حريق 1" },
    { value: "fire-inspector-ii", name: "Fire Inspector II", ar: "مفتش حريق 2" },
    { value: "ics-100", name: "ICS 100", ar: "نظام إدارة الحوادث ICS 100" },
    { value: "ics-200", name: "ICS 200", ar: "نظام إدارة الحوادث ICS 200" },
    { value: "ics-700", name: "ICS 700", ar: "نظام إدارة الحوادث ICS 700" },
    { value: "rope-rescue-awareness", name: "Rope Rescue Awareness", ar: "التوعية بالإنقاذ بالحبال" },
    { value: "rope-rescue-operations", name: "Rope Rescue Operations", ar: "عمليات الإنقاذ بالحبال" },
    { value: "rope-rescue-technician", name: "Rope Rescue Technician", ar: "فني إنقاذ بالحبال" },
    { value: "rope-rescue-confined-space", name: "Rope Rescue Confined Space", ar: "الإنقاذ بالحبال في الأماكن المغلقة" },
    { value: "bls-cpr", name: "BLS-CPR", ar: "الإنعاش القلبي الرئوي ودعم الحياة الأساسي" },
  ] as const;

/** Every row starts at "none" so the applicant only marks what they actually hold. */
export const defaultCertifications = (): Record<string, CertStatus> =>
    Object.fromEntries(ALL_CERTIFICATIONS.map((c) => [c.value, "none" as CertStatus]));