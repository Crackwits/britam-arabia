"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
    return useContext(LenisContext);
}

interface SmoothScrollProviderProps {
    children: ReactNode;
    duration?: number;       // default 1.4 — higher = slower
    easing?: (t: number) => number;
    wheelMultiplier?: number; // default 0.8 — lower = slower wheel
    touchMultiplier?: number; // default 1.0
}

export default function SmoothScrollProvider({
    children,
    duration = 1.4,
    easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease
    wheelMultiplier = 0.8,
    touchMultiplier = 1.0,
}: SmoothScrollProviderProps) {
    const lenisRef = useRef<Lenis | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration,
            easing,
            wheelMultiplier,
            touchMultiplier,
            smoothWheel: true,
        });

        lenisRef.current = lenis;

        function raf(time: number) {
            lenis.raf(time);
            rafRef.current = requestAnimationFrame(raf);
        }

        rafRef.current = requestAnimationFrame(raf);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            lenis.destroy();
        };
    }, [duration, easing, wheelMultiplier, touchMultiplier]);

    return (
        <LenisContext.Provider value={lenisRef.current}>
            {children}
        </LenisContext.Provider>
    );
}

{/* <div data-lenis-prevent className="overflow-y-auto max-h-96">
   This element scrolls natively, not through Lenis 
</div> */}