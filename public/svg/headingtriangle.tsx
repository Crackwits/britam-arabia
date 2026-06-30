'use client';

import { useId } from 'react';

function HeadingTriangle() {
    const clipId = useId();

    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block shrink-0"
            aria-hidden="true"
        >
            <g clipPath={`url(#${clipId})`}>
                <path d="M13.917 0.0341803L0.0344677 0.0341797L0.0344671 13.9167L13.917 0.0341803Z" fill="#ED0000" stroke="#ED0000" strokeMiterlimit="10" />
            </g>
            <defs>
                <clipPath id={clipId}>
                    <rect width="14" height="14" fill="white" transform="translate(14) rotate(90)" />
                </clipPath>
            </defs>
        </svg>
    );
}

export default HeadingTriangle;