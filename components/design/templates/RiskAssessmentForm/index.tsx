"use client";
import { useState, useRef, useCallback } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, Variants } from "framer-motion";
import { z } from "zod";
import { Loader2, CheckCircle2, AlertCircle, MapPin, Upload, FileText, X } from "lucide-react";
import { AssessRiskAttributes } from "@/components/lib/types";
import UploadSvg from "@/public/svg/uploadsvg";
import {
    buildApplicationSchema,
    ApplicationFormValues,
    ACCEPTED_FILE_EXTENSIONS,
    MAX_FILE_SIZE,
} from "@/components/lib/applicationSchema";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RiskAssessmentFormProps {
    data: AssessRiskAttributes;
    lang: "en" | "ar";
    isArabic: boolean;
}

interface ApiError {
    field: string;
    message: string;
}

// ─── Translations ─────────────────────────────────────────────────────────────

const translations = {
    en: {
        dir: "ltr",

        sectionOrg: "Organisation & Contact Information",
        organizationName: "Organisation Name",
        contactName: "Contact Name",
        email: "Email",
        position: "Position",
        telephone: "Telephone",

        sectionFacility: "Facility Profile",
        facilityTypeLabel: "What type of facility do you operate?",
        facilityTypeOptions: [
            "Industrial Plant",
            "Manufacturing",
            "Oil & Gas",
            "Logistics/Warehouse",
            "Commercial Building",
            "High-Rise Development",
            "Construction Project",
            "Data Centre",
            "Airport",
            "Healthcare",
            "Residential Community",
            "Mixed Use Development",
            "Other",
        ],

        facilitySizeLabel:
            "Approximately how many people are normally on site?",
        facilitySizeOptions: [
            { value: "Less than 100", label: "Less than 100" },
            { value: "100-500", label: "100–500" },
            { value: "500-1000", label: "500–1,000" },
            { value: "1000-5000", label: "1,000–5,000" },
            { value: "More than 5,000", label: "More than 5,000" },
        ],

        projectStageLabel: "What stage is your project?",
        projectStageOptions: [
            { value: "Operational Facility", label: "Operational Facility" },
            { value: "construction", label: "Construction" },
            {
                value: "New Development (Finished but not Operational)",
                label: "New Development (Finished but not Operational)",
            },
            { value: "Design Stage", label: "Design Stage" },
            { value: "Tender/Bid Stage", label: "Tender/Bid Stage" },
        ],

        sectionHazards: "Risk & Hazard Profile",
        hazardsLabel: "Which hazards exist on your site?",
        hazardsHint: "(Tick all that apply)",
        hazardOptions: [
            "High-rise buildings",
            "Hazardous materials",
            "Fuel or gas storage",
            "Heavy industrial processes",
            "Confined spaces",
            "Working at height",
            "Underground facilities",
            "Remote location",
            "Construction related hazards",
            "Large public events",
            "None of the above",
        ],

        sectionReadiness: "Current Fire & Life Safety Readiness",
        emergencyServiceLabel:
            "Do you currently have an Emergency Fire & Rescue Service?",
        emergencyServiceOptions: [
            { value: "Yes – In-house", label: "Yes – In-house" },
            { value: "Yes - Outsourced", label: "Yes – Outsourced" },
            { value: "No", label: "No" },
            { value: "Currently under review", label: "Currently under review" },
        ],

        preRiskAssessmentLabel:
            "Do you have a Fire Risk Assessment for your site completed by an approved Civil Defence Consultant?",
        preRiskAssessmentOptions: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
        ],
        uploadTitle: "Drag your current assessment here or click to upload",
        uploadSubtitle: "Acceptable file types: PDF, DOC (5MB max)",
        removeFile: "Remove file",
        uploadNotAvailable: "Please select 'Yes' above to upload your assessment",

        sectionServices: "Services & Support Required",
        servicesLabel: "Which services are you interested in?",
        servicesHint: "(Tick all that apply)",
        servicesOptions: [
            "Fire & Rescue Services",
            "24/7 Emergency Response",
            "Fire Risk Assessment",
            "Emergency Preparedness",
            "Fire Safety Inspections and Auditing",
            "Fire Station Management",
            "Community Fire Safety",
            "Civil Defence Compliance",
            "Operational Assurance Review",
        ],

        supportRequiredLabel: "What support do you require?",
        supportRequiredOptions: [
            { value: "Immediate support", label: "Immediate support" },
            { value: "Within 3 Months", label: "Within 3 months" },
            { value: "Within 6 Months", label: "Within 6 months" },
            { value: "Future planning", label: "Future planning" },
        ],

        submit: "SUBMIT",
        submitting: "SUBMITTING...",
        success:
            "Thank you for completing the risk assessment",
        successDescription:
            "Our team will review your responses to assess your operational requirements and site risk profile.",
        genericError: "Failed to submit form. Please try again.",
        errors: {
            organizationName: "Organisation name is required",
            contactName: "Contact name is required",
            email: "Please enter a valid email address",
            position: "Position is required",
            telephone: "Telephone is required",
            facilityType: "Please select a facility type",
            facilitySize: "Please select a facility size",
            projectStage: "Please select a project stage",
            hazards: "Please select at least one hazard",
            emergencyService: "This field is required",
            preRiskAssessment: "This field is required",
            servicesInterested: "Please select at least one service",
            supportRequired: "Please select a support type",
        },
    },

    ar: {
        dir: "rtl",

        sectionOrg: "معلومات المؤسسة وجهة الاتصال",
        organizationName: "اسم المؤسسة",
        contactName: "اسم جهة الاتصال",
        email: "البريد الإلكتروني",
        position: "المنصب",
        telephone: "رقم الهاتف",

        sectionFacility: "ملف المنشأة",
        facilityTypeLabel: "ما نوع المنشأة التي تديرها؟",
        facilityTypeOptions: [
            "منشأة صناعية",
            "تصنيع",
            "نفط وغاز",
            "لوجستيات / مستودعات",
            "مبنى تجاري",
            "مشروع أبراج شاهقة",
            "مشروع قيد الإنشاء",
            "مركز بيانات",
            "مطار",
            "رعاية صحية",
            "مجمع سكني",
            "مشروع متعدد الاستخدامات",
            "أخرى",
        ],

        facilitySizeLabel:
            "تقريباً، كم عدد الأشخاص المتواجدين عادة في الموقع؟",
        facilitySizeOptions: [
            { value: "lt-100", label: "أقل من 100" },
            { value: "100-500", label: "100–500" },
            { value: "500-1000", label: "500–1,000" },
            { value: "1000-5000", label: "1,000–5,000" },
            { value: "gt-5000", label: "أكثر من 5,000" },
        ],

        projectStageLabel: "ما هي المرحلة الحالية لمشروعك؟",
        projectStageOptions: [
            { value: "operational", label: "منشأة تشغيلية" },
            { value: "construction", label: "قيد الإنشاء" },
            {
                value: "new-development",
                label: "مشروع جديد (منتهٍ ولكن غير تشغيلي)",
            },
            { value: "design", label: "مرحلة التصميم" },
            { value: "tender", label: "مرحلة المناقصة / العرض" },
        ],

        sectionHazards: "ملف المخاطر والأخطار",
        hazardsLabel: "ما هي الأخطار الموجودة في موقعك؟",
        hazardsHint: "(اختر كل ما ينطبق)",
        hazardOptions: [
            "مبانٍ شاهقة",
            "مواد خطرة",
            "تخزين وقود أو غاز",
            "عمليات صناعية ثقيلة",
            "أماكن مغلقة",
            "العمل في المرتفعات",
            "منشآت تحت الأرض",
            "موقع نائي",
            "أخطار متعلقة بالإنشاءات",
            "فعاليات جماهيرية كبرى",
            "لا شيء مما سبق",
        ],

        sectionReadiness: "جاهزية السلامة من الحرائق وحماية الأرواح حالياً",
        emergencyServiceLabel:
            "هل لديك حالياً خدمة إطفاء وإنقاذ طوارئ؟",
        emergencyServiceOptions: [
            { value: "in-house", label: "نعم – داخلية" },
            { value: "outsourced", label: "نعم – متعاقد خارجياً" },
            { value: "no", label: "لا" },
            { value: "under-review", label: "قيد المراجعة حالياً" },
        ],

        preRiskAssessmentLabel:
            "هل لديك تقييم مخاطر حريق لموقعك أجراه استشاري دفاع مدني معتمد؟",
        preRiskAssessmentOptions: [
            { value: "yes", label: "نعم" },
            { value: "no", label: "لا" },
        ],
        uploadTitle: "اسحب تقييمك الحالي هنا أو انقر للتحميل",
        uploadSubtitle: "أنواع الملفات المقبولة: PDF، DOC (بحد أقصى 5 ميجابايت)",
        removeFile: "حذف الملف",
        uploadNotAvailable: "يرجى اختيار 'نعم' أعلاه لتحميل تقييمك",
        sectionServices: "الخدمات والدعم المطلوب",
        servicesLabel: "ما هي الخدمات التي تهمك؟",
        servicesHint: "(اختر كل ما ينطبق)",
        servicesOptions: [
            "خدمات الإطفاء والإنقاذ",
            "استجابة طوارئ على مدار الساعة",
            "تقييم مخاطر الحريق",
            "التأهب للطوارئ",
            "تفتيش وتدقيق السلامة من الحرائق",
            "إدارة محطات الإطفاء",
            "السلامة المجتمعية من الحرائق",
            "الامتثال لمتطلبات الدفاع المدني",
            "مراجعة ضمان الأداء التشغيلي",
        ],

        supportRequiredLabel: "ما نوع الدعم الذي تحتاجه؟",
        supportRequiredOptions: [
            { value: "immediate", label: "دعم فوري" },
            { value: "within-3-months", label: "خلال 3 أشهر" },
            { value: "within-6-months", label: "خلال 6 أشهر" },
            { value: "future-planning", label: "تخطيط مستقبلي" },
        ],

        submit: "إرسال",
        submitting: "جارٍ الإرسال...",
        success:
            "شكراً لإكمالك تقييم المخاطر",
        successDescription:
            "سيقوم فريقنا بمراجعة إجاباتك لتقييم متطلباتك التشغيلية وملف المخاطر الخاص بموقعك.",
        genericError: "فشل إرسال النموذج. يرجى المحاولة مرة أخرى.",

        errors: {
            organizationName: "اسم المؤسسة مطلوب",
            contactName: "اسم جهة الاتصال مطلوب",
            email: "يرجى إدخال بريد إلكتروني صحيح",
            position: "المنصب مطلوب",
            telephone: "رقم الهاتف مطلوب",
            facilityType: "يرجى اختيار نوع المنشأة",
            facilitySize: "يرجى اختيار حجم المنشأة",
            projectStage: "يرجى اختيار مرحلة المشروع",
            hazards: "يرجى اختيار خطر واحد على الأقل",
            emergencyService: "هذا الحقل مطلوب",
            preRiskAssessment: "هذا الحقل مطلوب",
            servicesInterested: "يرجى اختيار خدمة واحدة على الأقل",
            supportRequired: "يرجى اختيار نوع الدعم",
        },
    },
} as const;

type Locale = keyof typeof translations;

// ─── Zod Schema ───────────────────────────────────────────────────────────────
function buildSchema(locale: Locale) {
    const e = translations[locale].errors;

    return z.object({
        organizationName: z.string().trim().min(1, e.organizationName),
        contactName: z.string().trim().min(1, e.contactName),
        email: z
            .string()
            .trim()
            .min(1, e.email)
            .email(e.email),
        position: z.string().trim().min(1, e.position),
        telephone: z.string().trim().min(1, e.telephone),
        facilityType: z.string().min(1, e.facilityType),
        facilitySize: z.string().min(1, e.facilitySize),
        projectStage: z.string().min(1, e.projectStage),
        hazards: z.array(z.string()).min(1, e.hazards),
        emergencyService: z.string().min(1, e.emergencyService),
        preRiskAssessment: z
            .string()
            .min(1, e.preRiskAssessment),
        servicesInterested: z
            .array(z.string())
            .min(1, e.servicesInterested),
        supportRequired: z.string().min(1, e.supportRequired),
    });
}

type RiskAssessmentFormValues = z.infer<
    ReturnType<typeof buildSchema>
>;

// ─── Default Values ───────────────────────────────────────────────────────────

const defaultValues: RiskAssessmentFormValues = {
    organizationName: "",
    contactName: "",
    email: "",
    position: "",
    telephone: "",
    facilityType: "",
    facilitySize: "",
    projectStage: "",
    hazards: [],
    emergencyService: "",
    preRiskAssessment: "",
    servicesInterested: [],
    supportRequired: "",
};

// ─── Animation Variants ───────────────────────────────────────────────────────

const headerVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 40,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: "easeOut",
        },
    },
};

function getSectionVariants(isArabic: boolean): Variants {
    return {
        hidden: {
            opacity: 0,
            x: isArabic ? 40 : -40,
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.65,
                ease: "easeOut",
                delay: 0.15,
            },
        },
    };
}

const modalVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.2,
        },
    },
};

// ─── Modal Component ──────────────────────────────────────────────────────────

interface ModalProps {
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    description: string;
    onClose: () => void;
}

function Modal({ isOpen, type, title, description, onClose }: ModalProps) {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
            <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
                className="bg-white shadow-lg p-10 md:p-15 max-w-2xl  w-full mx-4"
            >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    {type === "success" ? (
                        <div className="">
                            <CheckCircle2 size={60} className="text-primaryDefault" />
                        </div>
                    ) : (
                        <div className="">
                            <AlertCircle size={60} className="text-[#ED0000]" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <h2 className="text-xl font-semibold text-center text-darkDefault mb-3">
                    {title}
                </h2>

                <p className="text-center text-darkLight text-sm leading-relaxed">
                    {description}
                </p>
            </motion.div>
        </motion.div>
    );
}

interface ResumeUploadProps {
    file: File | null;
    onFileSelect: (file: File | null) => void;
    error?: string;
    isArabic: boolean;
    t: (typeof translations)[keyof typeof translations];
    isEnabled: boolean;
}

function ResumeUpload({ file, onFileSelect, error, isArabic, t, isEnabled }: ResumeUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            if (!isEnabled) return;
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) onFileSelect(droppedFile);
        },
        [onFileSelect, isEnabled]
    );

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (isEnabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleClick = () => {
        if (isEnabled) inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) onFileSelect(selected);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileSelect(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div>
            <motion.div
                role="button"
                tabIndex={isEnabled ? 0 : -1}
                onClick={handleClick}
                onKeyDown={(e) => {
                    if (isEnabled && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        handleClick();
                    }
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                transition={{ duration: 0.3 }}
                className={`
          border-1 border-dashed py-10 md:py-17
          flex flex-col items-center justify-center
          cursor-pointer
          transition-colors
          px-6 text-center bg-neutral50
          ${isDragging ? "border-primaryDefault" : "border-neutralLight"}
          ${error ? "border-[#ED0000]" : ""}
          ${isEnabled ? "hover:border-primaryDefault" : "opacity-50 cursor-not-allowed"}
        `}
                aria-label={t.uploadTitle}
                aria-describedby="cv-upload-subtext"
                aria-disabled={!isEnabled}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_FILE_EXTENSIONS.join(",")}
                    onChange={handleChange}
                    className="sr-only"
                    aria-hidden="true"
                    tabIndex={-1}
                    disabled={!isEnabled}
                />

                {file ? (
                    <div className="flex flex-col items-center gap-2">
                        <FileText size={58} className="text-[#323232]" />
                        <p className="pt-5 pb-3 font-medium text-darkDefault text-lg break-all px-4">
                            {file.name}
                        </p>
                        <p className="text-base text-darkLight pb-2">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        {isEnabled && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="pb-2 inline-flex text-base text-darkLight cursor-pointer items-center gap-1 hover:text-[#ED0000] transition-colors"
                            >
                                <X size={12} />
                                {t.removeFile}
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <UploadSvg />
                        <p className="pt-8 pb-3 font-medium text-darkDefault text-lg break-all px-4">
                            {isEnabled ? t.uploadTitle : t.uploadNotAvailable}
                        </p>
                        {isEnabled && (
                            <p id="cv-upload-subtext" className="text-base text-darkLight pb-2">
                                {t.uploadSubtitle}
                            </p>
                        )}
                    </>
                )}
            </motion.div>

            {error && (
                <p role="alert" className="mt-2 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Shared Input Class ──────────────────────────────────────────────────────
const labelClass = "text-darkDefault text-base font-normal"
const inputClass =
    "mt-2 w-full border border-e2e2e2 p-4 text-base text-darkDefault placeholder:text-darkLight transition-colors duration-200 focus:border-darkDefault focus:outline-none";

const errorClass =
    "mt-1 text-xs text-[#ED0000]";

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RiskAssessmentForm({
    data,
    lang,
    isArabic,
}: RiskAssessmentFormProps) {
    const t = translations[lang];
    const schema = buildSchema(lang);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [cvError, setCvError] = useState<string | undefined>();
    const [apiErrors, setApiErrors] = useState<ApiError[]>([]);
    const [submitState, setSubmitState] = useState<
        "idle" | "success" | "error"
    >("idle");

    const [showModal, setShowModal] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RiskAssessmentFormValues>({
        resolver: zodResolver(schema),
        defaultValues,
        mode: "onBlur",
    });

    // Watch the preRiskAssessment field
    const preRiskAssessmentValue = watch("preRiskAssessment");
    const isUploadEnabled = preRiskAssessmentValue === "yes";

    const validateFile = (file: File | null): boolean => {
        if (!file) {
            setCvError(
                isArabic ? "يرجى إرفاق السيرة الذاتية" : "Please attach your resume"
            );
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            setCvError(
                isArabic
                    ? "يجب أن يكون حجم الملف أقل من 5 ميجابايت"
                    : "File must be smaller than 5MB"
            );
            return false;
        }
        const acceptedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!acceptedTypes.includes(file.type)) {
            setCvError(
                isArabic
                    ? "يُقبل فقط ملفات PDF أو DOC أو DOCX"
                    : "Only PDF, DOC, and DOCX files are accepted"
            );
            return false;
        }
        setCvError(undefined);
        return true;
    };

    const handleFileSelect = (file: File | null) => {
        setCvFile(file);
        if (file) validateFile(file);
        else setCvError(undefined);
    };

    const onSubmit = async (formData: RiskAssessmentFormValues) => {
        setApiErrors([]);
        setSubmitState("idle");

        try {
            // Create FormData for submission
            const submitFormData = new FormData();

            // Append form fields
            submitFormData.append("organizationName", formData.organizationName);
            submitFormData.append("contactName", formData.contactName);
            submitFormData.append("email", formData.email);
            submitFormData.append("position", formData.position);
            submitFormData.append("telephone", formData.telephone);
            submitFormData.append("facilityType", formData.facilityType);
            submitFormData.append("facilitySize", formData.facilitySize);
            submitFormData.append("projectStage", formData.projectStage);
            submitFormData.append("emergencyService", formData.emergencyService);
            submitFormData.append("preRiskAssessment", formData.preRiskAssessment);
            submitFormData.append("supportRequired", formData.supportRequired);

            // Append arrays
            formData.hazards.forEach((hazard) => {
                submitFormData.append("hazards", hazard);
            });

            formData.servicesInterested.forEach((service) => {
                submitFormData.append("servicesInterested", service);
            });

            // Append file if it exists
            if (cvFile) {
                submitFormData.append("file", cvFile);
            }

            const response = await fetch("/api/assessrisk", {
                method: "POST",
                body: submitFormData,
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle validation errors from API
                if (result.errors && Array.isArray(result.errors)) {
                    setApiErrors(result.errors);
                    setSubmitState("error");
                    setShowModal(true);
                    return;
                }

                throw new Error(result.message || "Failed to submit form");
            }

            setSubmitState("success");
            setShowModal(true);
            reset(defaultValues);
            setCvFile(null);
            setCvError(undefined);
        } catch (error) {
            console.error("Risk assessment form error:", error);
            setSubmitState("error");
            setShowModal(true);
        }
    };

    const sectionVariants = getSectionVariants(isArabic);

    // Get error message for a specific field
    const getFieldError = (fieldName: string): string | undefined => {
        return apiErrors.find(err => err.field === fieldName)?.message;
    };

    return (
        <section
            dir={isArabic ? "rtl" : "ltr"}
            className="w-full bg-white"
            aria-labelledby="risk-assessment-heading"
        >
            {/* Modal */}
            <Modal
                isOpen={showModal}
                type={submitState as "success" | "error"}
                title={
                    submitState === "success"
                        ? t.success
                        : apiErrors.length > 0
                            ? "Validation Error"
                            : "Error"
                }
                description={
                    submitState === "success"
                        ? t.successDescription
                        : apiErrors.length > 0
                            ? apiErrors.map(err => err.message).join(", ")
                            : t.genericError
                }
                onClose={() => setShowModal(false)}
            />

            <div className="max-w-7xl mx-auto px-4 pt-20 md:pt-14">

                {/* ── Header ── */}

                <motion.div
                    variants={headerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{
                        once: true,
                        margin: "-60px 0px",
                    }}
                >
                    <h1
                        id="risk-assessment-heading"
                        className="text-4xl md:text-5xl font-medium text-richNavy tracking-[-1.44px] pb-2 w-full max-w-4xl"
                    >
                        {data.heading}
                    </h1>

                    <p className="text-darkLight text-lg w-full max-w-4xl">
                        {data.subheading}
                    </p>
                </motion.div>

                {/* ── Form ── */}
            </div>
            <div className="max-w-5xl mx-auto px-4 mb-20 pt-20">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-12"
                >

                    {/* ── Organisation & Contact Information ── */}

                    <motion.section
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            margin: "0px 0px",
                        }}
                        className="space-y-8"
                    >
                        <h2 className="text-xl font-medium text-navy900 tracking-[-0.4px] mb-6">
                            {t.sectionOrg}
                        </h2>
                        <div>
                            <label
                                htmlFor="organizationName"
                                className={labelClass}
                            >
                                {t.organizationName}
                            </label>

                            <input
                                id="organizationName"
                                type="text"
                                placeholder={t.organizationName}
                                dir={isArabic ? "rtl" : "ltr"}
                                aria-invalid={
                                    !!errors.organizationName
                                }
                                {...register(
                                    "organizationName"
                                )}
                                className={inputClass}
                            />

                            {errors.organizationName && (
                                <p
                                    role="alert"
                                    className={errorClass}
                                >
                                    {
                                        errors
                                            .organizationName
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Contact Name */}

                            <div>
                                <label
                                    htmlFor="contactName"
                                    className={labelClass}
                                >
                                    {t.contactName}
                                </label>

                                <input
                                    id="contactName"
                                    type="text"
                                    placeholder={t.contactName}
                                    dir={isArabic ? "rtl" : "ltr"}
                                    aria-invalid={
                                        !!errors.contactName
                                    }
                                    {...register("contactName")}
                                    className={inputClass}
                                />

                                {errors.contactName && (
                                    <p
                                        role="alert"
                                        className={errorClass}
                                    >
                                        {
                                            errors.contactName
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            {/* Position */}

                            <div>
                                <label
                                    htmlFor="position"
                                    className={labelClass}
                                >
                                    {t.position}
                                </label>

                                <input
                                    id="position"
                                    type="text"
                                    placeholder={t.position}
                                    dir={isArabic ? "rtl" : "ltr"}
                                    aria-invalid={
                                        !!errors.position
                                    }
                                    {...register("position")}
                                    className={inputClass}
                                />

                                {errors.position && (
                                    <p
                                        role="alert"
                                        className={errorClass}
                                    >
                                        {errors.position.message}
                                    </p>
                                )}
                            </div>

                            {/* Email */}

                            <div>
                                <label
                                    htmlFor="email"
                                    className={labelClass}
                                >
                                    {t.email}
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    placeholder={t.email}
                                    dir={isArabic ? "rtl" : "ltr"}
                                    aria-invalid={
                                        !!errors.email
                                    }
                                    {...register("email")}
                                    className={inputClass}
                                />

                                {errors.email && (
                                    <p
                                        role="alert"
                                        className={errorClass}
                                    >
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Telephone */}

                            <div>
                                <label
                                    htmlFor="telephone"
                                    className={labelClass}
                                >
                                    {t.telephone}
                                </label>

                                <input
                                    id="telephone"
                                    type="tel"
                                    placeholder={t.telephone}
                                    dir={isArabic ? "rtl" : "ltr"}
                                    aria-invalid={
                                        !!errors.telephone
                                    }
                                    {...register("telephone")}
                                    className={inputClass}
                                />

                                {errors.telephone && (
                                    <p
                                        role="alert"
                                        className={errorClass}
                                    >
                                        {errors.telephone.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.section>

                    {/* ── Facility Profile ── */}

                    <motion.section
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            margin: "0px 0px",
                        }}
                        className="space-y-8 pt-8"
                    >
                        <h2 className="text-xl font-medium text-navy900 tracking-[-0.4px] mb-6">
                            {t.sectionFacility}
                        </h2>

                        {/* Facility Type */}

                        <div>
                            <label
                                htmlFor="facilityType"
                                className={labelClass}
                            >
                                {t.facilityTypeLabel}
                            </label>

                            <select
                                id="facilityType"
                                {...register("facilityType")}
                                aria-invalid={
                                    !!errors.facilityType
                                }
                                defaultValue=""
                                className={`${inputClass} cursor-pointer appearance-none`}
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    {t.facilityTypeLabel}
                                </option>

                                {t.facilityTypeOptions.map(
                                    (option) => (
                                        <option
                                            key={option}
                                            value={option}
                                        >
                                            {option}
                                        </option>
                                    )
                                )}
                            </select>

                            {errors.facilityType && (
                                <p
                                    role="alert"
                                    className={errorClass}
                                >
                                    {
                                        errors.facilityType
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Facility Size */}

                            <div>
                                <label
                                    htmlFor="facilitySize"
                                    className={labelClass}
                                >
                                    {t.facilitySizeLabel}
                                </label>

                                <select
                                    id="facilitySize"
                                    {...register("facilitySize")}
                                    aria-invalid={
                                        !!errors.facilitySize
                                    }
                                    defaultValue=""
                                    className={`${inputClass} cursor-pointer appearance-none`}
                                >
                                    <option
                                        value=""
                                        disabled
                                    >
                                        {t.facilitySizeLabel}
                                    </option>

                                    {t.facilitySizeOptions.map(
                                        (option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        )
                                    )}
                                </select>

                                {errors.facilitySize && (
                                    <p
                                        role="alert"
                                        className={errorClass}
                                    >
                                        {
                                            errors.facilitySize
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            {/* Project Stage */}

                            <div>
                                <label
                                    htmlFor="projectStage"
                                    className={labelClass}
                                >
                                    {t.projectStageLabel}
                                </label>

                                <select
                                    id="projectStage"
                                    {...register("projectStage")}
                                    aria-invalid={
                                        !!errors.projectStage
                                    }
                                    defaultValue=""
                                    className={`${inputClass} cursor-pointer appearance-none`}
                                >
                                    <option
                                        value=""
                                        disabled
                                    >
                                        {t.projectStageLabel}
                                    </option>

                                    {t.projectStageOptions.map(
                                        (option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        )
                                    )}
                                </select>

                                {errors.projectStage && (
                                    <p
                                        role="alert"
                                        className={errorClass}
                                    >
                                        {
                                            errors.projectStage
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.section>

                    {/* ── Risk & Hazard Profile ── */}

                    <motion.section
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            margin: "0px 0px",
                        }}
                        className="space-y-8 pt-8"
                    >
                        <h2 className="text-xl font-medium text-navy900 tracking-[-0.4px] mb-6">
                            {t.sectionHazards}
                        </h2>

                        <div>
                            <p className="text-base text-darkDefault mb-1">
                                {t.hazardsLabel}
                            </p>

                            <p className="text-sm text-darkLight mb-4">
                                {t.hazardsHint}
                            </p>

                            <Controller
                                name="hazards"
                                control={control}
                                render={({ field }) => (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                        {t.hazardOptions.map(
                                            (hazard) => {
                                                const checked =
                                                    field.value.includes(
                                                        hazard
                                                    );

                                                return (
                                                    <label
                                                        key={hazard}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                checked
                                                            }
                                                            onChange={() => {
                                                                const nextValue =
                                                                    checked
                                                                        ? field.value.filter(
                                                                            (
                                                                                item
                                                                            ) =>
                                                                                item !==
                                                                                hazard
                                                                        )
                                                                        : [
                                                                            ...field.value,
                                                                            hazard,
                                                                        ];

                                                                field.onChange(
                                                                    nextValue
                                                                );
                                                            }}
                                                            className="w-4 h-4 rounded border-e2e2e2 text-richNavy cursor-pointer"
                                                        />

                                                        <span className="mx-3 text-base text-darkDefault">
                                                            {hazard}
                                                        </span>
                                                    </label>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            />

                            {errors.hazards && (
                                <p
                                    role="alert"
                                    className={`${errorClass} mt-2`}
                                >
                                    {errors.hazards.message}
                                </p>
                            )}
                        </div>
                    </motion.section>

                    {/* ── Current Fire & Life Safety Readiness ── */}

                    <motion.section
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            margin: "0px 0px",
                        }}
                        className="space-y-8 pt-8"
                    >
                        <h2 className="text-xl font-medium text-navy900 tracking-[-0.4px] mb-6">
                            {t.sectionReadiness}
                        </h2>

                        {/* Emergency Service */}

                        <div>
                            <label
                                htmlFor="emergencyService"
                                className={labelClass}
                            >
                                {t.emergencyServiceLabel}
                            </label>

                            <select
                                id="emergencyService"
                                {...register(
                                    "emergencyService"
                                )}
                                aria-invalid={
                                    !!errors.emergencyService
                                }
                                defaultValue=""
                                className={`${inputClass} cursor-pointer appearance-none`}
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    {t.emergencyServiceLabel}
                                </option>

                                {t.emergencyServiceOptions.map(
                                    (option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    )
                                )}
                            </select>

                            {errors.emergencyService && (
                                <p
                                    role="alert"
                                    className={errorClass}
                                >
                                    {
                                        errors.emergencyService
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* Pre Risk Assessment */}

                        <div>
                            <label
                                htmlFor="preRiskAssessment"
                                className={labelClass}
                            >
                                {t.preRiskAssessmentLabel}
                            </label>

                            <select
                                id="preRiskAssessment"
                                {...register(
                                    "preRiskAssessment"
                                )}
                                aria-invalid={
                                    !!errors.preRiskAssessment
                                }
                                defaultValue=""
                                className={`${inputClass} cursor-pointer appearance-none`}
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    {t.preRiskAssessmentLabel}
                                </option>

                                {t.preRiskAssessmentOptions.map(
                                    (option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    )
                                )}
                            </select>

                            {errors.preRiskAssessment && (
                                <p
                                    role="alert"
                                    className={errorClass}
                                >
                                    {
                                        errors.preRiskAssessment
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* File Upload - Only visible when "yes" is selected */}
                        {isUploadEnabled && (
                            <div>
                                <ResumeUpload
                                    file={cvFile}
                                    onFileSelect={handleFileSelect}
                                    error={cvError || getFieldError("file")}
                                    isArabic={isArabic}
                                    t={t}
                                    isEnabled={isUploadEnabled}
                                />
                            </div>
                        )}
                    </motion.section>

                    {/* ── Services & Support Required ── */}

                    <motion.section
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            margin: "0px 0px",
                        }}
                        className="space-y-8 pt-8"
                    >
                        <h2 className="text-xl font-medium text-navy900 tracking-[-0.4px] mb-6">
                            {t.sectionServices}
                        </h2>

                        {/* Services */}

                        <div>
                            <p className="text-base text-darkDefault mb-1">
                                {t.servicesLabel}
                            </p>

                            <p className="text-sm text-darkLight mb-4">
                                {t.servicesHint}
                            </p>

                            <Controller
                                name="servicesInterested"
                                control={control}
                                render={({ field }) => (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                        {t.servicesOptions.map(
                                            (service) => {
                                                const checked =
                                                    field.value.includes(
                                                        service
                                                    );

                                                return (
                                                    <label
                                                        key={service}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                checked
                                                            }
                                                            onChange={() => {
                                                                const nextValue =
                                                                    checked
                                                                        ? field.value.filter(
                                                                            (
                                                                                item
                                                                            ) =>
                                                                                item !==
                                                                                service
                                                                        )
                                                                        : [
                                                                            ...field.value,
                                                                            service,
                                                                        ];

                                                                field.onChange(
                                                                    nextValue
                                                                );
                                                            }}
                                                            className="w-4 h-4 rounded border-e2e2e2 text-richNavy cursor-pointer"
                                                        />

                                                        <span className="mx-3 text-base text-darkDefault">
                                                            {service}
                                                        </span>
                                                    </label>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            />

                            {errors.servicesInterested && (
                                <p
                                    role="alert"
                                    className={`${errorClass} mt-2`}
                                >
                                    {
                                        errors
                                            .servicesInterested
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* Support Required */}

                        <div>
                            <label
                                htmlFor="supportRequired"
                                className={labelClass}
                            >
                                {t.supportRequiredLabel}
                            </label>

                            <select
                                id="supportRequired"
                                {...register(
                                    "supportRequired"
                                )}
                                aria-invalid={
                                    !!errors.supportRequired
                                }
                                defaultValue=""
                                className={`${inputClass} cursor-pointer appearance-none`}
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    {t.supportRequiredLabel}
                                </option>

                                {t.supportRequiredOptions.map(
                                    (option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    )
                                )}
                            </select>

                            {errors.supportRequired && (
                                <p
                                    role="alert"
                                    className={errorClass}
                                >
                                    {
                                        errors.supportRequired
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                    </motion.section>

                    {/* ── Submit ── */}

                    <div
                        className={`flex ${isArabic
                            ? "justify-start"
                            : "justify-end"
                            }`}
                    >
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{
                                scale: isSubmitting ? 1 : 1.02,
                            }}
                            whileTap={{
                                scale: isSubmitting ? 1 : 0.98,
                            }}
                            transition={{ duration: 0.2 }}
                            className="
                                flex items-center gap-2
                                border border-darkDefault
                                bg-white
                                px-6 py-3
                                text-sm font-medium
                                uppercase tracking-[0.84px]
                                text-darkDefault
                                transition-colors duration-300
                                cursor-pointer
                                hover:bg-darkDefault
                                hover:border-darkDefault
                                hover:text-white
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-darkDefault
                                focus-visible:ring-offset-2
                            "
                        >
                            {isSubmitting && (
                                <Loader2
                                    size={14}
                                    className="animate-spin"
                                />
                            )}

                            {isSubmitting
                                ? t.submitting
                                : t.submit}
                        </motion.button>
                    </div>
                </form>
            </div>
        </section>
    );
}