"use client";

import React, { forwardRef, type ReactNode } from "react";
import { type CertStatus, type Certification, type Lang, type Option, label } from "../Formoptions";

// ─── Field wrapper ────────────────────────────────────────────────────────────

interface FieldProps {
    id: string;
    label: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}

export function Field({ id, label, hint, error, required = true, children }: FieldProps) {
    return (
        <div className="w-full">
            <label htmlFor={id} className="block text-sm font-medium text-darkDefault mb-2">
                {label}
                {required && <span className="text-[#ED0000] ms-1">*</span>}
            </label>
            {hint && <p className="text-xs text-darkLight mb-2">{hint}</p>}
            {children}
            {error && (
                <p role="alert" className="mt-2 text-xs text-[#ED0000]">
                    {error}
                </p>
            )}
        </div>
    );
}

const controlClasses = (hasError?: boolean) => `
    w-full bg-white border px-4 py-3 text-base text-darkDefault
    placeholder:text-neutralLight
    transition-colors outline-none
    focus:border-darkDefault focus-visible:border-darkDefault
    ${hasError ? "border-[#ED0000]" : "border-neutralLighter"}
`;

// ─── Text input ───────────────────────────────────────────────────────────────

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ hasError, className = "", ...props }, ref) => (
        <input ref={ref} {...props} className={`${controlClasses(hasError)} ${className}`} />
    )
);
TextInput.displayName = "TextInput";

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    hasError?: boolean;
    placeholder: string;
    options: readonly Option[] | readonly string[];
    lang: Lang;
}


export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
    ({ hasError, placeholder, options, lang, className = "", ...props }, ref) => (
        <select
            ref={ref}
            {...props}
            defaultValue=""
            className={`${controlClasses(hasError)} appearance-none cursor-pointer ${className}`}
        >
            <option value="" disabled>
                {placeholder}
            </option>
            {options.map((opt) =>
                typeof opt === "string" ? (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ) : (
                    <option key={opt.value} value={opt.value}>
                        {label(opt, lang)}
                    </option>
                )
            )}
        </select>
    )
);
SelectInput.displayName = "SelectInput";

// ─── Radio group ──────────────────────────────────────────────────────────────

interface RadioGroupProps {
    name: string;
    options: readonly Option[];
    lang: Lang;
    /** Spread of register(name) from react-hook-form */
    registration: React.InputHTMLAttributes<HTMLInputElement>;
}

export function RadioGroup({ name, options, lang, registration }: RadioGroupProps) {
    return (
        <div className="flex flex-wrap gap-x-8 gap-y-3">
            {options.map((opt) => (
                <label
                    key={opt.value}
                    className="inline-flex items-center gap-2 cursor-pointer text-base text-darkDefault"
                >
                    <input
                        type="radio"
                        value={opt.value}
                        {...registration}
                        className="h-4 w-4 accent-[#0034A5] cursor-pointer"
                    />
                    {label(opt, lang)}
                </label>
            ))}
        </div>
    );
}

// ─── Checkbox group ───────────────────────────────────────────────────────────

interface CheckboxGroupProps {
    options: readonly Option[];
    lang: Lang;
    registration: React.InputHTMLAttributes<HTMLInputElement>;
}

export function CheckboxGroup({ options, lang, registration }: CheckboxGroupProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {options.map((opt) => (
                <label
                    key={opt.value}
                    className="inline-flex items-center gap-2 cursor-pointer text-base text-darkDefault"
                >
                    <input
                        type="checkbox"
                        value={opt.value}
                        {...registration}
                        className="h-4 w-4 accent-[#0034A5] cursor-pointer"
                    />
                    {label(opt, lang)}
                </label>
            ))}
        </div>
    );
}

// ─── Certifications matrix ────────────────────────────────────────────────────

interface CertMatrixProps {
    rows: readonly Certification[];
    statuses: readonly Option[];
    lang: Lang;
    values: Record<string, CertStatus>;
    onChange: (cert: string, status: CertStatus) => void;
}

export function CertMatrix({ rows, statuses, lang, values, onChange }: CertMatrixProps) {
    return (
        <div className="border border-neutralLighter">
            {/* Column headers — sticky on desktop, hidden on mobile where each row stacks */}
            <div className="hidden sm:grid grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] border-b border-neutralLighter bg-neutral50">
                <span />
                {statuses.map((s) => (
                    <span key={s.value} className="px-2 py-3 text-center text-sm text-darkLight">
                        {label(s, lang)}
                    </span>
                ))}
            </div>

            {rows.map((row, i) => (
                <div
                    key={row.value}
                    role="radiogroup"
                    aria-label={row.name}
                    className={`
                        grid grid-cols-1 sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]
                        items-center gap-2 sm:gap-0 px-3 py-3
                        ${i % 2 === 1 ? "bg-neutral50/60" : "bg-white"}
                        ${i === rows.length - 1 ? "" : "border-b border-neutralLighter"}
                    `}
                >
                    <span className="text-base text-darkDefault">{row.name}</span>

                    {statuses.map((s) => (
                        <label
                            key={s.value}
                            className="flex items-center gap-2 sm:justify-center cursor-pointer text-sm text-darkLight sm:text-transparent"
                        >
                            <input
                                type="radio"
                                name={`cert-${row.value}`}
                                value={s.value}
                                checked={values[row.value] === s.value}
                                onChange={() => onChange(row.value, s.value as CertStatus)}
                                className="h-4 w-4 accent-[#0034A5] cursor-pointer"
                            />
                            {/* Label text shows on mobile only; desktop uses the column header */}
                            <span className="sm:hidden text-darkLight">{label(s, lang)}</span>
                        </label>
                    ))}
                </div>
            ))}
        </div>
    );
}