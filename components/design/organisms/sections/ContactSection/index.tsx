"use client";

import { useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { ContactusAttributes, GlobalSettingAttributes } from "@/components/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactSectionProps {
    data: ContactusAttributes;
    globalsettings: GlobalSettingAttributes | null;
    lang: "en" | "ar";
    isArabic: boolean;
}

// ─── Translations ─────────────────────────────────────────────────────────────

const translations = {
    en: {
        inquiryTypePlaceholder: "Select Inquiry Type",
        name: "Enter your name",
        email: "Enter your email",
        phone: "Phone number",
        phoneLabel: "Phone",
        emailLabel: "Email",
        addressLabel: "Address",
        message: "How Can We Help? *",
        submit: "SEND MESSAGE",
        submitting: "SENDING...",
        success: "Your message has been sent successfully. We'll be in touch shortly.",
        genericError: "Something went wrong. Please try again.",
        inquiryOptions: [
            "General Inquiry",
            "Fire & Life Safety",
            "Emergency Preparedness",
            "Infrastructure Verification",
            "Partnership",
            "Other",
        ],
        errors: {
            inquiryType: "Please select an inquiry type",
            name: "Please enter your name",
            email: "Please enter a valid email",
            phone: "Please enter a valid phone number",
            message: "Please tell us how we can help",
        },
    },
    ar: {
        inquiryTypePlaceholder: "اختر نوع الاستفسار",
        name: "أدخل اسمك",
        email: "أدخل بريدك الإلكتروني",
        phone: "رقم الهاتف",
        phoneLabel: "الهاتف",
        emailLabel: "البريد الإلكتروني",
        addressLabel: "العنوان",
        message: "كيف يمكننا مساعدتك؟ *",
        submit: "إرسال الرسالة",
        submitting: "جارٍ الإرسال...",
        success: "تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.",
        genericError: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
        inquiryOptions: [
            "استفسار عام",
            "السلامة من الحرائق",
            "التأهب للطوارئ",
            "التحقق من البنية التحتية",
            "شراكة",
            "أخرى",
        ],
        errors: {
            inquiryType: "يرجى اختيار نوع الاستفسار",
            name: "يرجى إدخال اسمك",
            email: "يرجى إدخال بريد إلكتروني صحيح",
            phone: "يرجى إدخال رقم هاتف صحيح",
            message: "يرجى إخبارنا كيف يمكننا مساعدتك",
        },
    },
} as const;

// ─── Zod Schema ───────────────────────────────────────────────────────────────

function buildSchema(locale: "en" | "ar") {
    const e = translations[locale].errors;
    return z.object({
        inquiryType: z.string().min(1, e.inquiryType),
        name: z.string().trim().min(2, e.name),
        email: z.string().trim().email(e.email),
        phone: z
            .string()
            .trim()
            .min(6, e.phone)
            .regex(/^[+0-9()\s-]+$/, e.phone),
        message: z.string().trim().min(10, e.message),
    });
}

type ContactFormValues = z.infer<ReturnType<typeof buildSchema>>;

// ─── Animation Variants ───────────────────────────────────────────────────────

const headerVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: "easeOut" },
    },
};

function getColVariants(side: "left" | "right", isArabic: boolean): Variants {
    const leftX = isArabic ? 40 : -40;
    const rightX = isArabic ? -40 : 40;
    return {
        hidden: { opacity: 0, x: side === "left" ? leftX : rightX },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.65, ease: "easeOut", delay: 0.15 },
        },
    };
}

// ─── Shared Input Class ───────────────────────────────────────────────────────

const inputClass ="w-full border border-e2e2e2 p-4 text-base text-darkDefault placeholder:text-darkLight transition-colors duration-200 focus:border-darkDefault focus:outline-none";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContactSection({
    data, globalsettings, lang, isArabic
}: ContactSectionProps) {
    const t = translations[lang];
    const schema = buildSchema(lang);

    const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(schema),
        mode: "onBlur",
    });

    const onSubmit = async (data: ContactFormValues) => {
        setSubmitState("idle");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, lang }),
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error);
            setSubmitState("success");
            reset();
        } catch (err) {
            console.error("Contact form error:", err);
            setSubmitState("error");
        }
    };

    const leftVariants = getColVariants("left", isArabic);
    const rightVariants = getColVariants("right", isArabic);

    return (
        <section
            dir={isArabic ? "rtl" : "ltr"}
            className="w-full bg-white"
            aria-labelledby="contact-heading"
        >
            <div className="max-w-7xl mx-auto px-4 pb-20 pt-20 md:py-14">
                {/* ── Top Header ── */}
                <motion.div
                    variants={headerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px 0px" }}
                >
                    <h2
                        id="contact-heading"
                        className="text-4xl md:text-5xl font-medium text-richNavy tracking-[-1.44px] pb-2 w-full max-w-4xl"
                    >
                        {data.heading}
                    </h2>
                    <p className="text-darkLight text-lg w-full max-w-4xl pb-20">
                        {data.subheading}
                    </p>
                </motion.div>

                {/* ── Two Column Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20">
                    {/* ── Left Column ── */}
                    <motion.div
                        variants={leftVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px 0px" }}
                    >
                        <h3 className="text-4xl md:text-5xl w-full max-w-[450px] font-medium text-richNavy tracking-[-1.44px] pb-2">
                            {data.form_title}
                        </h3>

                        <div className="space-y-8 mt-14">
                            {/* Phone */}
                            <div>
                                <p className="text-sm text-darkLight mb-2">
                                    {t.phoneLabel}
                                </p>
                                <a
                                    href={`tel:${globalsettings?.phone}`}
                                    className="text-sm font-medium tracking-[0.84px] text-darkLight uppercase hover:underline transition-all pb-6"
                                >
                                    {globalsettings?.phone}
                                </a>
                            </div>

                            {/* Email */}
                            <div>
                                <p className="text-sm text-darkLight mb-2">
                                    {t.emailLabel}
                                </p>
                                <a
                                    href={`mailto:${globalsettings?.email}`}
                                    className="text-sm font-medium tracking-[0.84px] text-darkLight uppercase hover:underline transition-all pb-6"
                                >
                                    {globalsettings?.email}
                                </a>
                            </div>

                            {/* Address */}
                            <div>
                                <p className="text-sm text-darkLight mb-2">
                                    {t.addressLabel}
                                </p>
                                {globalsettings?.address_link ? (
                                    <a
                                        href={globalsettings.address_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium tracking-[0.84px] text-darkLight uppercase hover:underline transition-all"
                                    >
                                        {isArabic ? globalsettings?.address_ar : globalsettings?.address_en}

                                    </a>
                                ) : (
                                    <p className="text-sm font-medium tracking-[0.84px] text-darkLight uppercase hover:underline transition-all">
                                        {isArabic ? globalsettings?.address_ar : globalsettings?.address_en}

                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Right Column — Form ── */}
                    <motion.div
                        variants={rightVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px 0px" }}
                    >
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            className="space-y-3"
                        >
                            {/* Inquiry Type */}
                            <div>
                                <label htmlFor="inquiryType" className="sr-only">
                                    {t.inquiryTypePlaceholder}
                                </label>
                                <select
                                    id="inquiryType"
                                    {...register("inquiryType")}
                                    aria-invalid={!!errors.inquiryType}
                                    defaultValue=""
                                    className={`${inputClass} cursor-pointer appearance-none`}
                                >
                                    <option value="" disabled>
                                        {t.inquiryTypePlaceholder}
                                    </option>
                                    {t.inquiryOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                {errors.inquiryType && (
                                    <p role="alert" className="mt-1 text-xs text-[#ED0000]">
                                        {errors.inquiryType.message}
                                    </p>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="sr-only">
                                    {t.name}
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder={t.name}
                                    dir={isArabic ? "rtl" : "ltr"}
                                    aria-invalid={!!errors.name}
                                    {...register("name")}
                                    className={inputClass}
                                />
                                {errors.name && (
                                    <p role="alert" className="mt-1 text-xs text-[#ED0000]">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    {t.email}
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder={t.email}
                                    dir={isArabic ? "rtl" : "ltr"}
                                    aria-invalid={!!errors.email}
                                    {...register("email")}
                                    className={inputClass}
                                />
                                {errors.email && (
                                    <p role="alert" className="mt-1 text-xs text-[#ED0000]">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="sr-only">
                                    {t.phone}
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder={t.phone}
                                    dir={isArabic ? "rtl" : "ltr"}
                                    aria-invalid={!!errors.phone}
                                    {...register("phone")}
                                    className={inputClass}
                                />
                                {errors.phone && (
                                    <p role="alert" className="mt-1 text-xs text-[#ED0000]">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="sr-only">
                                    {t.message}
                                </label>
                                <textarea
                                    id="message"
                                    placeholder={t.message}
                                    dir={isArabic ? "rtl" : "ltr"}
                                    aria-invalid={!!errors.message}
                                    {...register("message")}
                                    className={`${inputClass} min-h-[120px] resize-none`}
                                />
                                {errors.message && (
                                    <p role="alert" className="mt-1 text-xs text-[#ED0000]">
                                        {errors.message.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <div
                                className={`flex pt-2 ${isArabic ? "justify-start" : "justify-end"}`}
                            >
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="
                    border border-darkDefault bg-white px-6 py-3
                    text-sm font-medium uppercase tracking-[0.84px] text-darkDefault
                    transition-colors duration-300 cursor-pointer
                    hover:bg-darkDefault hover:border-darkDefault hover:text-white
                    disabled:cursor-not-allowed disabled:opacity-60
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-darkDefault focus-visible:ring-offset-2
                  " >
                                    {isSubmitting && (
                                        <Loader2 size={14} className="animate-spin" />
                                    )}
                                    {isSubmitting ? t.submitting : t.submit}
                                </motion.button>
                            </div>

                            {/* Status */}
                            {submitState === "success" && (
                                <p role="status" className="text-sm font-medium text-primaryDefault pt-1">
                                    {t.success}
                                </p>
                            )}
                            {submitState === "error" && (
                                <p role="alert" className="text-sm font-medium text-[#ED0000] pt-1">
                                    {t.genericError}
                                </p>
                            )}
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}