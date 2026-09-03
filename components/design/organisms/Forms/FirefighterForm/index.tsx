"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
    buildFirefighterSchema,
    REQUIRE_CV,
    type FirefighterFormValues,
} from "../Applicationschema";
import {
    ALL_CERTIFICATIONS,
    CERTIFICATIONS_GROUP_1,
    CERTIFICATIONS_GROUP_2,
    CERT_STATUSES,
    CITIES,
    ENGLISH_LEVELS,
    FIREFIGHTER_POSITIONS,
    KSA_LOCATIONS,
    LICENSE_TYPES,
    NATIONALITIES,
    RELIGIONS,
    YES_NO,
    defaultCertifications,
    findLabel,
    type CertStatus,
    type Lang,
} from "../Formoptions";
import { submitApplication, validateCv } from "../SubmitApplication";
import {
    CertMatrix,
    CheckboxGroup,
    Field,
    // LockedValue,
    RadioGroup,
    SelectInput,
    TextInput,
} from "../Formfields";
import ResumeUpload from "../Resumeupload";
import SubmissionModal from "../SubmissionModal";

interface FirefighterFormProps {
    lang: Lang;
    isArabic: boolean;
    position: string;
    slug: string;
    /** City of the posting, from the CMS. Sent with the payload, not asked of the applicant. */
    city?: string;
}

const translations = {
    en: {
        name: "Name",
        answerPlaceholder: "Enter your answer",
        nationality: "Nationality",
        nationalityPlaceholder: "Select your nationality",
        age: "Age",
        agePlaceholder: "The value must be a number",
        religion: "Religion",
        primaryEmail: "Primary email address",
        primaryEmailHint: "Add only 1 email address",
        secondaryEmail: "Secondary email address",
        phone: "Contact numbers",
        appliedPositions: "Applied position",
        appliedPositionsHint: "Please select the positions you are applying for",
        english: "English proficiency",
        englishHint: "How good are you using the English language?",
        ksaLocation: "Location",
        ksaLocationHint: "In or out of KSA",
        drivingLicense: "Driving license",
        drivingLicenseHint: "Do you currently hold a KSA driving license?",
        licenseType: "KSA license type",
        licenseTypeHint: "What type of KSA driving license do you have?",
        certs1: "Certifications 1/2",
        certs2: "Certifications 2/2",
        certsHint:
            "Please note if your certificates are certified by TVTC, IFSAF, AFSSAC or ProBoard",
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
        name: "الاسم",
        answerPlaceholder: "أدخل إجابتك",
        nationality: "الجنسية",
        nationalityPlaceholder: "اختر جنسيتك",
        age: "العمر",
        agePlaceholder: "يجب أن تكون القيمة رقمًا",
        religion: "الديانة",
        primaryEmail: "البريد الإلكتروني الأساسي",
        primaryEmailHint: "أضف بريدًا إلكترونيًا واحدًا فقط",
        secondaryEmail: "البريد الإلكتروني الثانوي",
        phone: "أرقام التواصل",
        appliedPositions: "الوظيفة المتقدم لها",
        appliedPositionsHint: "يرجى اختيار الوظائف التي تتقدم لها",
        english: "إتقان اللغة الإنجليزية",
        englishHint: "ما مستواك في استخدام اللغة الإنجليزية؟",
        ksaLocation: "الموقع",
        ksaLocationHint: "داخل أو خارج المملكة العربية السعودية",
        drivingLicense: "رخصة القيادة",
        drivingLicenseHint: "هل تحمل حاليًا رخصة قيادة سعودية؟",
        licenseType: "نوع الرخصة السعودية",
        licenseTypeHint: "ما نوع رخصة القيادة السعودية التي تحملها؟",
        certs1: "الشهادات ١/٢",
        certs2: "الشهادات ٢/٢",
        certsHint:
            "يرجى الإشارة إذا كانت شهاداتك معتمدة من TVTC أو IFSAF أو AFSSAC أو ProBoard",
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

export default function FirefighterForm({
    lang,
    isArabic,
    position,
    slug,
    city,
}: FirefighterFormProps) {
    const t = translations[lang];
    const schema = buildFirefighterSchema(lang);

    // Not a form field — carried through to the submission so HR knows the posting's city.
    const postingCity = city ? findLabel(CITIES, city, "en") : "";

    const [cvFile, setCvFile] = useState<File | null>(null);
    const [cvError, setCvError] = useState<string | undefined>();
    const [modalType, setModalType] = useState<"success" | "error">("success");
    const [modalMessage, setModalMessage] = useState<string | undefined>();
    const [showModal, setShowModal] = useState(false);
    // The matrix is controlled outside RHF — 25 radio groups register far more cleanly this way.
    const [certs, setCerts] = useState<Record<string, CertStatus>>(defaultCertifications);

    const defaults = {
        appliedPositions: [],
        certifications: defaultCertifications(),
    } as Partial<FirefighterFormValues>;

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FirefighterFormValues>({
        resolver: zodResolver(schema),
        mode: "onBlur",
        defaultValues: defaults,
    });

    const hasLicense = watch("hasDrivingLicense");

    const handleCertChange = (cert: string, status: CertStatus) => {
        setCerts((prev) => {
            const next = { ...prev, [cert]: status };
            setValue("certifications", next, { shouldValidate: false });
            return next;
        });
    };

    const handleFileSelect = (file: File | null) => {
        setCvFile(file);
        setCvError(file ? validateCv(file, lang, REQUIRE_CV.firefighters) : undefined);
    };

    const onSubmit = async (data: FirefighterFormValues) => {
        const fileError = validateCv(cvFile, lang, REQUIRE_CV.firefighters);
        if (fileError) {
            setCvError(fileError);
            return;
        }

        try {
            await submitApplication(
                {
                    formType: "firefighters",
                    position,
                    slug,
                    city: postingCity,
                    fields: [
                        { label: "Name", value: data.fullName },
                        { label: "Nationality", value: data.nationality },
                        { label: "Age", value: String(data.age) },
                        { label: "Religion", value: findLabel(RELIGIONS, data.religion) },
                        { label: "Primary Email Address", value: data.primaryEmail },
                        { label: "Secondary Email Address", value: data.secondaryEmail },
                        { label: "Contact Numbers", value: data.phone },
                        {
                            label: "Applied Position",
                            value: data.appliedPositions
                                .map((p) => findLabel(FIREFIGHTER_POSITIONS, p))
                                .join(", "),
                        },
                        {
                            label: "English Proficiency",
                            value: findLabel(ENGLISH_LEVELS, data.englishProficiency),
                        },
                        {
                            label: "Location (In / Out of KSA)",
                            value: findLabel(KSA_LOCATIONS, data.ksaLocation),
                        },
                        {
                            label: "KSA Driving License",
                            value: findLabel(YES_NO, data.hasDrivingLicense),
                        },
                        {
                            label: "KSA License Type",
                            value: data.licenseType
                                ? findLabel(LICENSE_TYPES, data.licenseType)
                                : "N/A",
                        },
                    ],
                    // Only send rows the applicant actually holds — keeps the email readable.
                    certifications: ALL_CERTIFICATIONS.filter(
                        (c) => certs[c.value] && certs[c.value] !== "none"
                    ).map((c) => ({
                        name: c.name,
                        status: findLabel(CERT_STATUSES, certs[c.value]),
                    })),
                },
                cvFile
            );

            setModalType("success");
            setModalMessage(undefined);
            setShowModal(true);
            reset(defaults);
            setCerts(defaultCertifications());
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
                {/* ── Personal details ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field id="fullName" label={t.name} error={errors.fullName?.message}>
                        <TextInput
                            id="fullName"
                            placeholder={t.answerPlaceholder}
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

                    <Field id="age" label={t.age} error={errors.age?.message}>
                        <TextInput
                            id="age"
                            type="number"
                            inputMode="numeric"
                            min={18}
                            max={65}
                            dir="ltr"
                            placeholder={t.agePlaceholder}
                            hasError={!!errors.age}
                            className={isArabic ? "text-right" : ""}
                            {...register("age")}
                        />
                    </Field>

                    <Field
                        id="primaryEmail"
                        label={t.primaryEmail}
                        hint={t.primaryEmailHint}
                        error={errors.primaryEmail?.message}
                    >
                        <TextInput
                            id="primaryEmail"
                            type="email"
                            inputMode="email"
                            placeholder={t.answerPlaceholder}
                            autoComplete="email"
                            hasError={!!errors.primaryEmail}
                            {...register("primaryEmail")}
                        />
                    </Field>

                    <Field
                        id="secondaryEmail"
                        label={t.secondaryEmail}
                        error={errors.secondaryEmail?.message}
                    >
                        <TextInput
                            id="secondaryEmail"
                            type="email"
                            inputMode="email"
                            placeholder={t.answerPlaceholder}
                            hasError={!!errors.secondaryEmail}
                            {...register("secondaryEmail")}
                        />
                    </Field>

                    <Field id="phone" label={t.phone} error={errors.phone?.message}>
                        <TextInput
                            id="phone"
                            type="tel"
                            inputMode="tel"
                            dir="ltr"
                            placeholder={t.answerPlaceholder}
                            autoComplete="tel"
                            hasError={!!errors.phone}
                            className={isArabic ? "text-right" : ""}
                            {...register("phone")}
                        />
                    </Field>
                </div>

                {/* ── Choice groups ── */}
                <Field id="religion" label={t.religion} error={errors.religion?.message}>
                    <RadioGroup
                        name="religion"
                        options={RELIGIONS}
                        lang={lang}
                        registration={register("religion")}
                    />
                </Field>

                <Field
                    id="appliedPositions"
                    label={t.appliedPositions}
                    hint={t.appliedPositionsHint}
                    error={errors.appliedPositions?.message}
                >
                    <CheckboxGroup
                        options={FIREFIGHTER_POSITIONS}
                        lang={lang}
                        registration={register("appliedPositions")}
                    />
                </Field>

                <Field
                    id="englishProficiency"
                    label={t.english}
                    hint={t.englishHint}
                    error={errors.englishProficiency?.message}
                >
                    <RadioGroup
                        name="englishProficiency"
                        options={ENGLISH_LEVELS}
                        lang={lang}
                        registration={register("englishProficiency")}
                    />
                </Field>

                <Field
                    id="ksaLocation"
                    label={t.ksaLocation}
                    hint={t.ksaLocationHint}
                    error={errors.ksaLocation?.message}
                >
                    <RadioGroup
                        name="ksaLocation"
                        options={KSA_LOCATIONS}
                        lang={lang}
                        registration={register("ksaLocation")}
                    />
                </Field>

                <Field
                    id="hasDrivingLicense"
                    label={t.drivingLicense}
                    hint={t.drivingLicenseHint}
                    error={errors.hasDrivingLicense?.message}
                >
                    <RadioGroup
                        name="hasDrivingLicense"
                        options={YES_NO}
                        lang={lang}
                        registration={register("hasDrivingLicense")}
                    />
                </Field>

                {hasLicense === "yes" && (
                    <Field
                        id="licenseType"
                        label={t.licenseType}
                        hint={t.licenseTypeHint}
                        error={errors.licenseType?.message}
                    >
                        <RadioGroup
                            name="licenseType"
                            options={LICENSE_TYPES}
                            lang={lang}
                            registration={register("licenseType")}
                        />
                    </Field>
                )}

                {/* ── Certifications ── */}
                <Field id="certs1" label={t.certs1} hint={t.certsHint}>
                    <CertMatrix
                        rows={CERTIFICATIONS_GROUP_1}
                        statuses={CERT_STATUSES}
                        lang={lang}
                        values={certs}
                        onChange={handleCertChange}
                    />
                </Field>

                <Field id="certs2" label={t.certs2} hint={t.certsHint}>
                    <CertMatrix
                        rows={CERTIFICATIONS_GROUP_2}
                        statuses={CERT_STATUSES}
                        lang={lang}
                        values={certs}
                        onChange={handleCertChange}
                    />
                </Field>

                {/* ── Resume ── */}
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