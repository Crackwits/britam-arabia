"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
    buildManagementSchema,
    REQUIRE_CV,
    type ManagementFormValues,
} from "../Applicationschema";
import {
    CITIES,
    MANAGEMENT_POSITIONS,
    NATIONALITIES,
    findLabel,
    type Lang,
} from "../Formoptions";
import { submitApplication, validateCv } from "../SubmitApplication";
import { Field, SelectInput, TextInput } from "../Formfields";
import ResumeUpload from "../Resumeupload";
import SubmissionModal from "../SubmissionModal";

interface ManagementFormProps {
    lang: Lang;
    isArabic: boolean;
    position: string;
    slug: string;
    /** City from the CMS. When it matches a known value the field is locked. */
    city?: string;
}

const translations = {
    en: {
        fullName: "Full name",
        fullNamePlaceholder: "Enter your full name",
        nationality: "Nationality",
        nationalityPlaceholder: "Select your nationality",
        city: "City",
        cityPlaceholder: "Select a city",
        email: "Email address",
        emailPlaceholder: "Enter your email",
        phone: "Contact number",
        phonePlaceholder: "Enter your contact number",
        appliedPosition: "Position applied for",
        appliedPositionPlaceholder: "Select a position",
        uploadTitle: "Drag your resume here or click to upload",
        uploadSubtitle: "Acceptable file types: PDF, DOC (5MB max)",
        removeFile: "Remove file",
        submit: "Submit Application",
        submitting: "Submitting...",
        successTitle: "Thank you for your application",
        successDescription:
            "Our team will review your details and get in touch if your profile matches the role.",
        errorTitle: "Your application was not sent",
        errorDescription: "Something went wrong. Please try again.",
        closeModal: "Close",
    },
    ar: {
        fullName: "الاسم الكامل",
        fullNamePlaceholder: "أدخل اسمك الكامل",
        nationality: "الجنسية",
        nationalityPlaceholder: "اختر جنسيتك",
        city: "المدينة",
        cityPlaceholder: "اختر المدينة",
        email: "البريد الإلكتروني",
        emailPlaceholder: "أدخل بريدك الإلكتروني",
        phone: "رقم التواصل",
        phonePlaceholder: "أدخل رقم هاتفك",
        appliedPosition: "الوظيفة المتقدم لها",
        appliedPositionPlaceholder: "اختر الوظيفة",
        uploadTitle: "اسحب سيرتك الذاتية هنا أو انقر للتحميل",
        uploadSubtitle: "أنواع الملفات المقبولة: PDF, DOC (الحد الأقصى 5 ميجابايت)",
        removeFile: "إزالة الملف",
        submit: "إرسال الطلب",
        submitting: "جارٍ الإرسال...",
        successTitle: "شكرًا لتقديمك",
        successDescription:
            "سيقوم فريقنا بمراجعة بياناتك والتواصل معك إذا كان ملفك مطابقًا لمتطلبات الوظيفة.",
        errorTitle: "لم يتم إرسال طلبك",
        errorDescription: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
        closeModal: "إغلاق",
    },
} as const;

export default function ManagementForm({
    lang,
    isArabic,
    position,
    slug,
    city,
}: ManagementFormProps) {
    const t = translations[lang];
    const schema = buildManagementSchema(lang);

    // Only a city that matches a known option can lock the field.
    const presetCity = CITIES.find((c) => c.value === city)?.value;

    const [cvFile, setCvFile] = useState<File | null>(null);
    const [cvError, setCvError] = useState<string | undefined>();
    const [modalType, setModalType] = useState<"success" | "error">("success");
    const [modalMessage, setModalMessage] = useState<string | undefined>();
    const [showModal, setShowModal] = useState(false);

    const defaults = { city: presetCity ?? "" } as Partial<ManagementFormValues>;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ManagementFormValues>({
        resolver: zodResolver(schema),
        mode: "onBlur",
        defaultValues: defaults,
    });

    // Covers a city that arrives after mount (client fetch, late hydration).
    useEffect(() => {
        if (presetCity) setValue("city", presetCity, { shouldValidate: true });
    }, [presetCity, setValue]);

    const handleFileSelect = (file: File | null) => {
        setCvFile(file);
        setCvError(file ? validateCv(file, lang, REQUIRE_CV.management) : undefined);
    };

    const onSubmit = async (data: ManagementFormValues) => {
        const fileError = validateCv(cvFile, lang, REQUIRE_CV.management);
        if (fileError) {
            setCvError(fileError);
            return;
        }

        try {
            await submitApplication(
                {
                    formType: "management",
                    position,
                    slug,
                    city: findLabel(CITIES, data.city),
                    fields: [
                        { label: "Full Name", value: data.fullName },
                        { label: "Nationality", value: data.nationality },
                        { label: "City", value: findLabel(CITIES, data.city) },
                        { label: "Email Address", value: data.email },
                        { label: "Contact Number", value: data.phone },
                        {
                            label: "Position Applied For",
                            value: findLabel(MANAGEMENT_POSITIONS, data.appliedPosition),
                        },
                    ],
                },
                cvFile
            );

            setModalType("success");
            setModalMessage(undefined);
            setShowModal(true);
            reset(defaults);
            setCvFile(null);
            setCvError(undefined);
        } catch (err) {
            console.error("Application submission error:", err);
            setModalType("error");
            // Surface the API's own message when it sent one.
            setModalMessage(err instanceof Error ? err.message : undefined);
            setShowModal(true);
        }
    };

    return (
        <>
            <SubmissionModal
                isOpen={showModal}
                type={modalType}
                title={modalType === "success" ? t.successTitle : t.errorTitle}
                description={
                    modalType === "success"
                        ? t.successDescription
                        : modalMessage || t.errorDescription
                }
                closeLabel={t.closeModal}
                onClose={() => setShowModal(false)}
            />

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field id="fullName" label={t.fullName} error={errors.fullName?.message}>
                        <TextInput
                            id="fullName"
                            placeholder={t.fullNamePlaceholder}
                            autoComplete="name"
                            hasError={!!errors.fullName}
                            {...register("fullName")}
                        />
                    </Field>

                    <Field
                        id="nationality"
                        label={t.nationality}
                        error={errors.nationality?.message}
                    >
                        <SelectInput
                            id="nationality"
                            placeholder={t.nationalityPlaceholder}
                            options={NATIONALITIES}
                            lang={lang}
                            hasError={!!errors.nationality}
                            {...register("nationality")}
                        />
                    </Field>

                    <Field id="city" label={t.city} error={errors.city?.message}>
                        {presetCity ? (
                            <>
                                <p className="border border-neutralLighter bg-neutral50 px-4 py-3 text-base text-darkDefault">
                                    {findLabel(CITIES, presetCity, lang)}
                                </p>
                                <input type="hidden" {...register("city")} />
                            </>
                        ) : (
                            <SelectInput
                                id="city"
                                placeholder={t.cityPlaceholder}
                                options={CITIES}
                                lang={lang}
                                hasError={!!errors.city}
                                {...register("city")}
                            />
                        )}
                    </Field>

                    <Field
                        id="appliedPosition"
                        label={t.appliedPosition}
                        error={errors.appliedPosition?.message}
                    >
                        <SelectInput
                            id="appliedPosition"
                            placeholder={t.appliedPositionPlaceholder}
                            options={MANAGEMENT_POSITIONS}
                            lang={lang}
                            hasError={!!errors.appliedPosition}
                            {...register("appliedPosition")}
                        />
                    </Field>

                    <Field id="email" label={t.email} error={errors.email?.message}>
                        <TextInput
                            id="email"
                            type="email"
                            inputMode="email"
                            placeholder={t.emailPlaceholder}
                            autoComplete="email"
                            hasError={!!errors.email}
                            {...register("email")}
                        />
                    </Field>

                    <Field id="phone" label={t.phone} error={errors.phone?.message}>
                        <TextInput
                            id="phone"
                            type="tel"
                            inputMode="tel"
                            dir="ltr"
                            placeholder={t.phonePlaceholder}
                            autoComplete="tel"
                            hasError={!!errors.phone}
                            className={isArabic ? "text-right" : ""}
                            {...register("phone")}
                        />
                    </Field>
                </div>

                <ResumeUpload
                    file={cvFile}
                    onFileSelect={handleFileSelect}
                    error={cvError}
                    title={t.uploadTitle}
                    subtitle={t.uploadSubtitle}
                    removeLabel={t.removeFile}
                />

                <div className="mt-16 mb-21 flex justify-start pt-2">
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
                            transition-colors hover:text-primaryDefault hover:bg-white
                            disabled:opacity-60 disabled:cursor-not-allowed
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryDefault focus-visible:ring-offset-2
                        "
                    >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        {isSubmitting ? t.submitting : t.submit}
                    </motion.button>
                </div>
            </form>
        </>
    );
}