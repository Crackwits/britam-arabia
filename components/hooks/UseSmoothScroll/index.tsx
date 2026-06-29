// components/hooks/useSmoothScroll.ts
"use client";

import { useLenis } from "@/components/providers/SmoothScrollProvider";

export function useSmoothScroll() {
    const lenis = useLenis();

    const scrollTo = (target: string | number | HTMLElement, offset = 0) => {
        lenis?.scrollTo(target, { offset, duration: 1.6 });
    };

    const scrollToTop = () => {
        lenis?.scrollTo(0, { duration: 1.8 });
    };

    return { scrollTo, scrollToTop };
}


//usage
// const { scrollTo, scrollToTop } = useSmoothScroll();

// <button onClick={() => scrollTo("#contact", -80)}>Contact</button>
// <button onClick={scrollToTop}>Back to top</button>
