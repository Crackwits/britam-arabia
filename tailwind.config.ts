import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                en: ['var(--font-en)', 'sans-serif'],
                ar: ['var(--font-ar)', 'sans-serif'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),  // for richtext from CKEditor
        require('tailwindcss-rtl'),          // adds ps-, pe-, ms-, me- utilities
    ],
};

export default config;