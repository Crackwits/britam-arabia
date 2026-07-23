"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import HpContactBg from "@/public/homecontactbg.png";
import WhiteTriangle from "@/public/svg/whitetriangle";
import OrangeTriangle from "@/public/svg/orangetriangle";
import { GlobalSettingAttributes } from "@/components/lib/types";
// ─── Types ────────────────────────────────────────────────────────────────────
// type SupportedLocale = keyof typeof translations; // → "en" | "ar"
interface ContactSectionProps {
  locale: "en" | "ar";
  globalSettings: GlobalSettingAttributes | null;
  heading: string;
  body: string;
}

// ─── Translations ─────────────────────────────────────────────────────────────

const translations = {
  en: {
    inquiryLine: "MAKE AN INQUIRY",
    fullName: "Enter your full name",
    email: "Enter your email",
    phone: "Phone number",
    message: "How Can We Help?",
    submit: "SEND INQUIRY",
    submitting: "SENDING...",
    phoneLabel: "Phone",
    emailLabel: "Email",
    addressLabel: "Address",
    successMessage: "Your inquiry has been sent successfully",
    errorMessage: "Something went wrong. Please try again.",
    errors: {
      fullName: "Please enter your full name",
      email: "Please enter a valid email address",
      phone: "Please enter a valid phone number",
      message: "Please tell us how we can help",
    },
  },
  ar: {
    inquiryLine: "أرسل استفسارك",
    fullName: "أدخل الاسم الكامل",
    email: "أدخل البريد الإلكتروني",
    phone: "رقم الهاتف",
    message: "كيف يمكننا مساعدتك؟",
    submit: "إرسال الاستفسار",
    submitting: "جاري الإرسال...",
    phoneLabel: "الهاتف",
    emailLabel: "البريد الإلكتروني",
    addressLabel: "العنوان",
    successMessage: "تم إرسال استفساركم بنجاح",
    errorMessage: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    errors: {
      fullName: "يرجى إدخال الاسم الكامل",
      email: "يرجى إدخال بريد إلكتروني صحيح",
      phone: "يرجى إدخال رقم هاتف صحيح",
      message: "يرجى إخبارنا كيف يمكننا مساعدتك",
    },
  },
} as const;

// ─── Zod Schema (built per-locale so error messages match the UI language) ────

function buildContactSchema(locale: "en" | "ar") {
  const t = translations[locale].errors;
  return z.object({
    fullName: z.string().trim().min(2, t.fullName),
    email: z.string().trim().email(t.email),
    phoneNumber: z
      .string()
      .trim()
      .min(7, t.phone)
      .regex(/^[+0-9()\s-]+$/, t.phone),
    message: z.string().trim().min(10, t.message),
  });
}

type ContactFormValues = z.infer<ReturnType<typeof buildContactSchema>>;

// ─── Animation Variants ───────────────────────────────────────────────────────

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

function getCardVariants(isArabic: boolean): Variants {
  return {
    hidden: { opacity: 0, x: isArabic ? -30 : 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.25 },
    },
  };
}

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut", delay: 0.35 + i * 0.08 },
  }),
};

// ─── Form Field Wrapper ───────────────────────────────────────────────────────

interface FieldWrapperProps {
  index: number;
  error?: string;
  children: React.ReactNode;
}

function FieldWrapper({ index, error, children }: FieldWrapperProps) {
  return (
    <motion.div custom={index} variants={fieldVariants}>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-[#ED0000]">
          {error}
        </p>
      )}
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HpContactSection({ locale, globalSettings, heading, body }: ContactSectionProps) {
  const isArabic = locale === "ar";
  const t = translations[locale];
  const schema = buildContactSchema(locale);

  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

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
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data }),
      });

      if (!response.ok) throw new Error("Submission failed");

      reset();
      setSubmitStatus("success");
    } catch (err) {
      console.error("Contact form submission error:", err);
      setSubmitStatus("error");
    }
  };

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px 0px" }}
      className="w-full bg-white"
      aria-labelledby="contact-section-heading"
    >
      <div className="w-full max-w-7xl mx-auto bg-white px-4 py-15 md:py-25 overflow-hidden">
        {/* ── Heading ── */}
        <motion.div variants={headingVariants}>
          <h2
            id="contact-section-heading"
            className='text-navy900 uppercase font-medium tracking-[-1.92px] pb-4 text-4xl sm:text-5xl lg:text-6xl mx-auto w-full mb-1'
          >
            {heading}
          </h2>
          <p className="text-darkLight text-base md:text-lg max-w-6xl mb-6">
            {body}
          </p>
        </motion.div>

        {/* ── Image + Overlay ── */}
        <motion.div
          variants={imageVariants}
          className="relative mt-10 w-full overflow-hidden h-full"
        >
          <Image
            src={HpContactBg}
            alt={isArabic ? "فريق الإنقاذ" : "Fire and rescue team"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          {/* Dark overlay for text legibility */}
          <div className="pointer-events-none absolute inset-0 bg-black/35" />
          <div
            aria-hidden="true"
            className={`absolute top-0 z-10 h-20 w-20 ${isArabic ? "right-0 rotate-90" : "left-0"
              }`}
          >
            <WhiteTriangle />

          </div>
          <div
            aria-hidden="true"
            className={`absolute top-0 z-10 h-20 w-20 ${isArabic ? "hidden" : "left-0"
              }`}
          >
            <OrangeTriangle />
          </div>

          <div className="relative max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 pb-10 md:pt-10 pt-27 lg:gap-16">
            <div
              className='flex flex-col justify-top transition-all duration-700 ease-out pt-8'>
              <p className="px-4 text-5xl font-bold uppercase leading-[1.05] text-white md:text-6xl">
                {t.inquiryLine}
              </p>
            </div>
            <div>
              {/* ── Form card ── */}
              <motion.div
                variants={getCardVariants(isArabic)}
                className='relative w-full px-4'>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="space-y-4 relative bg-white w-full p-6"
                >
                  <FieldWrapper index={0} error={errors.fullName?.message}>
                    <label htmlFor="fullName" className="sr-only">
                      {t.fullName}
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      dir={isArabic ? "rtl" : "ltr"}
                      placeholder={t.fullName}
                      aria-invalid={!!errors.fullName}
                      aria-describedby={
                        errors.fullName ? "fullName-error" : undefined
                      }
                      {...register("fullName")}
                      className="w-full border border-e2e2e2 p-4
                    text-base text-darkDefault placeholder:text-darkLight
                    transition-colors duration-200
                    focus:border-darkDefault focus:outline-none" />
                  </FieldWrapper>

                  <FieldWrapper index={1} error={errors.email?.message}>
                    <label htmlFor="email" className="sr-only">
                      {t.email}
                    </label>
                    <input
                      id="email"
                      type="email"
                      dir={isArabic ? "rtl" : "ltr"}
                      placeholder={t.email}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      {...register("email")}
                      className="w-full border border-e2e2e2 p-4
                    text-base text-darkDefault placeholder:text-darkLight
                    transition-colors duration-200
                    focus:border-darkDefault focus:outline-none"
                    />
                  </FieldWrapper>

                  <FieldWrapper index={2} error={errors.phoneNumber?.message}>
                    <label htmlFor="phoneNumber" className="sr-only">
                      {t.phone}
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      dir={isArabic ? "rtl" : "ltr"}
                      placeholder={t.phone}
                      aria-invalid={!!errors.phoneNumber}
                      aria-describedby={
                        errors.phoneNumber ? "phoneNumber-error" : undefined
                      }
                      {...register("phoneNumber")}
                      className="w-full border border-e2e2e2 p-4
                    text-base text-darkDefault placeholder:text-darkLight
                    transition-colors duration-200
                    focus:border-darkDefault focus:outline-none"
                    />
                  </FieldWrapper>

                  <FieldWrapper index={3} error={errors.message?.message}>
                    <label htmlFor="message" className="sr-only">
                      {t.message}
                    </label>
                    <textarea
                      id="message"
                      dir={isArabic ? "rtl" : "ltr"}
                      placeholder={`${t.message} *`}
                      aria-invalid={!!errors.message}
                      aria-describedby={
                        errors.message ? "message-error" : undefined
                      }
                      {...register("message")}
                      className="
                    min-h-[120px] resize-none 
                    w-full border border-e2e2e2 p-4
                    text-base text-darkDefault placeholder:text-darkLight
                    transition-colors duration-200
                    focus:border-darkDefault focus:outline-none"
                    />
                  </FieldWrapper>

                  <div
                    className={`flex ${isArabic ? "justify-start" : "justify-end"}`}
                  >
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="
                    border border-darkDefault bg-white px-6 py-3
                    text-sm font-medium uppercase tracking-[0.84px] text-darkDefault
                    transition-colors duration-300 cursor-pointer
                    hover:bg-darkDefault hover:border-darkDefault hover:text-white
                    disabled:cursor-not-allowed disabled:opacity-60
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-darkDefault focus-visible:ring-offset-2
                  "
                    >
                      {isSubmitting ? t.submitting : t.submit}
                    </motion.button>
                  </div>

                  {submitStatus === "success" && (
                    <p
                      role="status"
                      className="text-center text-xs font-medium text-darkDefault"
                    >
                      {t.successMessage}
                    </p>
                  )}

                  {submitStatus === "error" && (
                    <p
                      role="alert"
                      className="text-center text-xs font-medium text-[#ED0000]"
                    >
                      {t.errorMessage}
                    </p>
                  )}
                </form>
              </motion.div>
              {/* ── Contact information ── */}
              <div
                className="flex flex-col gap-4 text-white
              sm:flex-row sm:gap-10 pt-6 px-4">
                <div>
                  <p className="text-sm sm:mb-2 mb-6">{t.phoneLabel}</p>
                  <a href={`tel:${globalSettings?.phone}`} target="_blank" className="hover:underline text-sm font-medium">{globalSettings?.phone}</a>
                </div>
                <div>
                  <p className="text-sm sm:mb-2 mb-6">{t.emailLabel}</p>
                  <a href={`mailto:${globalSettings?.email}`} target="_blank" className="hover:underline text-sm font-medium">{globalSettings?.email}</a>
                </div>

              </div>
              <div className="pt-6 text-white px-4">
                <p className="text-sm mb-2">{t.addressLabel}</p>
                <a href={globalSettings?.address_link} target="_blank" className="hover:underline text-sm font-medium">

                  {isArabic
                    ? globalSettings?.address_ar
                    : globalSettings?.address_en
                  }
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
