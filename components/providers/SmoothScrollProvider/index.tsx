"use client";

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
    return useContext(LenisContext);
}

// Module scope: a stable identity, so it can't retrigger the effect.
const DEFAULT_EASING = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

interface SmoothScrollProviderProps {
    children: ReactNode;
    duration?: number;        // default 1.4 — higher = slower
    easing?: (t: number) => number;
    wheelMultiplier?: number; // default 0.8 — lower = slower wheel
    touchMultiplier?: number; // default 1.0
}

export default function SmoothScrollProvider({
    children,
    duration = 1.4,
    easing = DEFAULT_EASING,
    wheelMultiplier = 0.8,
    touchMultiplier = 1.0,
}: SmoothScrollProviderProps) {
    // State, not a ref: a ref write doesn't re-render, so context consumers
    // would be stuck with the initial null.
    const [lenis, setLenis] = useState<Lenis | null>(null);
    const rafRef = useRef<number | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const instance = new Lenis({
            duration,
            easing,
            wheelMultiplier,
            touchMultiplier,
            smoothWheel: true,
        });

        setLenis(instance);

        function raf(time: number) {
            instance.raf(time);
            rafRef.current = requestAnimationFrame(raf);
        }
        rafRef.current = requestAnimationFrame(raf);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            instance.destroy();
            setLenis(null);
        };
    }, [duration, easing, wheelMultiplier, touchMultiplier]);

    // Next resets window.scrollY on navigation, but Lenis overwrites it on the
    // next frame from its own internal position — so reset Lenis directly.
    useEffect(() => {
        if (!lenis) return;
        // Leave hash links alone; they want to land on an anchor, not the top.
        if (window.location.hash) return;

        lenis.scrollTo(0, { immediate: true, force: true });
    }, [pathname, lenis]);

    return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}