"use client";

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

interface SubmissionModalProps {
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    description: string;
    closeLabel: string;
    onClose: () => void;
}

export default function SubmissionModal({
    isOpen,
    type,
    title,
    description,
    closeLabel,
    onClose,
}: SubmissionModalProps) {
    const closeRef = useRef<HTMLButtonElement>(null);

    // ESC to close, and lock the background while open
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        closeRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="submission-modal-title"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-white shadow-lg p-10 md:p-15 max-w-2xl w-full mx-4"
                    >
                        <button
                            ref={closeRef}
                            type="button"
                            onClick={onClose}
                            aria-label={closeLabel}
                            className="absolute top-4 end-4 text-darkLight transition-colors hover:text-darkDefault focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkDefault"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex justify-center mb-6">
                            {type === "success" ? (
                                <CheckCircle2 size={60} className="text-primaryDefault" />
                            ) : (
                                <AlertCircle size={60} className="text-[#ED0000]" />
                            )}
                        </div>

                        <h2
                            id="submission-modal-title"
                            className="text-xl font-semibold text-center text-darkDefault mb-3"
                        >
                            {title}
                        </h2>

                        <p className="text-center text-darkLight text-sm leading-relaxed">
                            {description}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}