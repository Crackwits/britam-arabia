// components/LanguageSwitcher.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LanguageSwitcher({ lang }: { lang: string }) {
    const pathname = usePathname();

    // Swap the locale segment in the current path
    const toggledPath = lang === 'en'
        ? pathname.replace('/en', '/ar')
        : pathname.replace('/ar', '/en');

    return (
        <Link
            href={toggledPath}
            className="text-sm font-medium px-3 py-1 border rounded hover:bg-gray-100 transition"
        >
            {lang === 'en' ? 'العربية' : 'English'}
        </Link>
    );
}