"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Upload, FileText, Loader2, X } from "lucide-react";
import { CareersAttributes } from "@/components/lib/types";
import HeadingTriangle from "@/public/svg/headingtriangle";
import UploadSvg from "@/public/svg/uploadsvg";
import {
    buildApplicationSchema,
    ApplicationFormValues,
    ACCEPTED_FILE_EXTENSIONS,
    MAX_FILE_SIZE,
} from "@/components/lib/applicationSchema";



interface CareerDetailsSectionProps {
    career: CareersAttributes;
    lang: "en" | "ar";
    isArabic: boolean;
}

// ─── Translations ─────────────────────────────────────────────────────────────

const translations = {
    en: {
        applyLabel: "Apply Now",
        joinHeading: "Join Our Team.",
        nameLabel: "Full name",
        namePlaceholder: "Enter your full name",
        emailLabel: "Email",
        emailPlaceholder: "Enter your email",
        phoneLabel: "Phone number",
        phonePlaceholder: "Enter your phone number",
        uploadTitle: "Drag your resume here or click to upload",
        uploadSubtitle: "Acceptable file types: PDF, DOC (5MB max)",
        submit: "Submit Application",
        submitting: "Submitting...",
        success: "Your application has been submitted successfully.",
        genericError: "Something went wrong. Please try again.",
        removeFile: "Remove file",
    },
    ar: {
        applyLabel: "قدم الآن",
        joinHeading: "انضم إلى فريقنا.",
        nameLabel: "الاسم الكامل",
        namePlaceholder: "أدخل اسمك الكامل",
        emailLabel: "البريد الإلكتروني",
        emailPlaceholder: "أدخل بريدك الإلكتروني",
        phoneLabel: "رقم الهاتف",
        phonePlaceholder: "أدخل رقم هاتفك",
        uploadTitle: "اسحب سيرتك الذاتية هنا أو انقر للتحميل",
        uploadSubtitle: "أنواع الملفات المقبولة: PDF, DOC (الحد الأقصى 5 ميجابايت)",
        submit: "إرسال الطلب",
        submitting: "جارٍ الإرسال...",
        success: "تم إرسال طلبك بنجاح.",
        genericError: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
        removeFile: "إزالة الملف",
    },
} as const;

// ─── Animation Variants ───────────────────────────────────────────────────────

const headerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut", delay: i * 0.1 },
    }),
};

const formVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

// ─── Resume Upload Box ─────────────────────────────────────────────────────────

interface ResumeUploadProps {
    file: File | null;
    onFileSelect: (file: File | null) => void;
    error?: string;
    isArabic: boolean;
    t: (typeof translations)[keyof typeof translations];
}

function ResumeUpload({ file, onFileSelect, error, isArabic, t }: ResumeUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) onFileSelect(droppedFile);
        },
        [onFileSelect]
    );

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleClick = () => inputRef.current?.click();

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
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleClick();
                    }
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                // whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className={`
          border-1 border-dashed py-10 md:py-17
          flex flex-col items-center justify-center
          cursor-pointer
          transition-colors
          px-6 text-center bg-neutral50
          ${isDragging ? "border-primaryDefault" : "border-neutralLight"}
          ${error ? "border-[#ED0000]" : ""}
          hover:border-primaryDefault
        `}
                aria-label={t.uploadTitle}
                aria-describedby="cv-upload-subtext"
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_FILE_EXTENSIONS.join(",")}
                    onChange={handleChange}
                    className="sr-only"
                    aria-hidden="true"
                    tabIndex={-1}
                />

                {file ? (
                    <div className="flex flex-col items-center gap-2">
                        <FileText size={58} className="text-[#323232]" />
                        {/* <UploadSvg /> */}
                        <p className="pt-5 pb-3 font-medium text-darkDefault text-lg break-all px-4">
                            {file.name}
                        </p>
                        <p className="text-base text-darkLight pb-2">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="pb-2 inline-flex text-base text-darkLight pointer items-center gap-1 hover:text-[#ED0000] transition-colors"
                        >
                            <X size={12} />
                            {t.removeFile}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* <Upload size={28} className="text-gray-400 mb-3" /> */}
                        <UploadSvg />
                        <p className="pt-8 pb-3 font-medium text-darkDefault text-lg break-all px-4">
                            {t.uploadTitle}
                        </p>
                        <p id="cv-upload-subtext" className="text-base text-darkLight pb-2" >
                            {t.uploadSubtitle}
                        </p>
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CareerDetailsSection({
    career,
    lang,
    isArabic
}: CareerDetailsSectionProps) {
    const t = translations[lang];
    const schema = buildApplicationSchema(lang);

    const [cvFile, setCvFile] = useState<File | null>(null);
    const [cvError, setCvError] = useState<string | undefined>();
    const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<Omit<ApplicationFormValues, "cv">>({
        resolver: zodResolver(schema.omit({ cv: true })),
        mode: "onBlur",
    });

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

    const onSubmit = async (data: Omit<ApplicationFormValues, "cv">) => {
        if (!validateFile(cvFile)) return;

        setSubmitState("idle");

        try {
            const formData = new FormData();
            formData.append("position", career.position);
            formData.append("slug", career.slug);
            if (cvFile) formData.append("cv", cvFile);

            const response = await fetch("/api/careers", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Submission failed");
            }

            setSubmitState("success");
            reset();
            setCvFile(null);
        } catch (err) {
            console.error("Application submission error:", err);
            setSubmitState("error");
        }
    };

    return (
        <div
            dir={isArabic ? "rtl" : "ltr"}
            className={`w-full bg-white ${isArabic ? "rtl text-right" : "ltr text-left"}`}
        >
            <div className="max-w-5xl mx-auto px-4 pt-36">
                {/* ── Section 1: Job Details ── */}
                <motion.div
                    variants={headerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h1 className="text-3xl md:text-5xl font-bold text-[#10224A] leading-tight">
                        {career.position}
                    </h1>

                    <div
                        className={`flex items-center gap-2 text-gray-500 text-sm mt-3 ${isArabic ? "flex-row-reverse justify-end" : "flex-row"}`}
                    >
                        <MapPin size={16} className="flex-shrink-0 text-gray-400" />
                        <span>
                            {career.location} / {career.employment_type}
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    custom={1}
                    variants={contentVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px 0px" }}
                    className="project-content pt-12"
                    dangerouslySetInnerHTML={{ __html: career.content }}
                />

                {/* ── Divider ── */}
                <div className="border-t border-neutralLighter my-20" />

                {/* ── Section 2: Apply Form ── */}
                <motion.div
                    variants={formVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px 0px" }}
                >
                    <div
                        className="inline-flex items-center gap-2 mb-4"
                        aria-hidden="false"
                    >
                        <HeadingTriangle />
                        <span className="text-primaryDefault text-xl md:text-lg font-medium uppercase">
                            {t.applyLabel}
                        </span>
                    </div>

                    {/* Main heading */}
                    <h2
                        id="our-approach-heading"
                        className="text-navy900 uppercase font-medium tracking-[-1.92px] text-4xl sm:text-5xl lg:text-6xl max-w-5xl w-full pb-14"
                    >
                        {t.joinHeading}
                    </h2>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                        className="space-y-5"
                    >

                        {/* Resume upload */}
                        <ResumeUpload
                            file={cvFile}
                            onFileSelect={handleFileSelect}
                            error={cvError}
                            isArabic={isArabic}
                            t={t}
                        />

                        {/* Submit */}
                        <div className={`mt-16 mb-21 flex ${isArabic ? "justify-start" : "justify-start"} pt-2`}>
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="
                  inline-flex items-center justify-center gap-2
                  text-sm text-white font-medium tracking-[0.84px] uppercase bg-primaryDefault
                  py-4 px-6 border border-primaryDefault
                  transition-colors hover:text-primaryDefault cursor hover:bg-white
                  disabled:opacity-60 disabled:cursor-not-allowed
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryDefault focus-visible:ring-offset-2
                "
                            >
                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                {isSubmitting ? t.submitting : t.submit}
                            </motion.button>
                        </div>

                        {/* Status messages */}
                        {submitState === "success" && (
                            <p role="status" className="text-sm font-medium text-green-700">
                                {t.success}
                            </p>
                        )}
                        {submitState === "error" && (
                            <p role="alert" className="text-sm font-medium text-red-600">
                                {t.genericError}
                            </p>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
}