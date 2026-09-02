"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, X } from "lucide-react";
import UploadSvg from "@/public/svg/uploadsvg";
import { ACCEPTED_FILE_EXTENSIONS } from "@/components/lib/applicationSchema";

interface ResumeUploadProps {
    file: File | null;
    onFileSelect: (file: File | null) => void;
    error?: string;
    title: string;
    subtitle: string;
    removeLabel: string;
}

export default function ResumeUpload({
    file,
    onFileSelect,
    error,
    title,
    subtitle,
    removeLabel,
}: ResumeUploadProps) {
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
                transition={{ duration: 0.3 }}
                className={`
                    border-1 border-dashed py-10 md:py-17
                    flex flex-col items-center justify-center
                    cursor-pointer transition-colors
                    px-6 text-center bg-neutral50
                    ${isDragging ? "border-primaryDefault" : "border-neutralLight"}
                    ${error ? "border-[#ED0000]" : ""}
                    hover:border-primaryDefault
                `}
                aria-label={title}
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
                        <p className="pt-5 pb-3 font-medium text-darkDefault text-lg break-all px-4">
                            {file.name}
                        </p>
                        <p className="text-base text-darkLight pb-2">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="pb-2 inline-flex text-base text-darkLight cursor-pointer items-center gap-1 hover:text-[#ED0000] transition-colors"
                        >
                            <X size={12} />
                            {removeLabel}
                        </button>
                    </div>
                ) : (
                    <>
                        <UploadSvg />
                        <p className="pt-8 pb-3 font-medium text-darkDefault text-lg break-all px-4">
                            {title}
                        </p>
                        <p id="cv-upload-subtext" className="text-base text-darkLight pb-2">
                            {subtitle}
                        </p>
                    </>
                )}
            </motion.div>

            {error && (
                <p role="alert" className="mt-2 text-xs text-[#ED0000]">
                    {error}
                </p>
            )}
        </div>
    );
}