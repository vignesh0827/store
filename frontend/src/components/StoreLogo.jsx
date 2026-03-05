import React from 'react';

const StoreLogo = ({ className = "w-10 h-10" }) => {
    return (
        <div className={`${className} relative flex items-center justify-center`}>
            {/* Premium 3D Storefront SVG */}
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
                <defs>
                    <linearGradient id="wallGradient" x1="50" y1="45" x2="50" y2="90" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#F8FAFC" />
                        <stop offset="100%" stopColor="#CBD5E1" />
                    </linearGradient>
                    <linearGradient id="awningGradient" x1="50" y1="20" x2="50" y2="45" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#22C55E" />
                        <stop offset="100%" stopColor="#15803D" />
                    </linearGradient>
                    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="0" dy="4" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.2" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Building Base with depth */}
                <path d="M15 45H85V85C85 87.7614 82.7614 90 80 90H20C17.2386 90 15 87.7614 15 85V45Z" fill="url(#wallGradient)" filter="url(#softShadow)" />

                {/* Door with detail */}
                <rect x="42" y="62" width="16" height="28" rx="2" fill="#1E293B" />
                <circle cx="53" cy="76" r="1.2" fill="#F1F5F9" />

                {/* Windows with reflection */}
                <rect x="22" y="55" width="12" height="18" rx="2" fill="#94A3B8" opacity="0.4" />
                <rect x="66" y="55" width="12" height="18" rx="2" fill="#94A3B8" opacity="0.4" />
                <path d="M22 55L34 65V55H22Z" fill="white" opacity="0.2" />
                <path d="M66 55L78 65V55H66Z" fill="white" opacity="0.2" />

                {/* 3D Awning */}
                <path d="M8 22C8 22 15 20 50 20C85 20 92 22 92 22L96 45H4L8 22Z" fill="url(#awningGradient)" />

                {/* Awning Stripes - Curvy/Modern */}
                <path d="M20 20.5L24 45H12L12 21.5C14 21 17 20.5 20 20.5Z" fill="white" opacity="0.2" />
                <path d="M40 20L44 45H32L32 20C34 19.8 37 20 40 20Z" fill="white" opacity="0.2" />
                <path d="M60 20L64 45H52L52 20C54 19.8 57 20 60 20Z" fill="white" opacity="0.2" />
                <path d="M80 20.5L84 45H72L72 21.5C74 21 77 20.5 80 20.5Z" fill="white" opacity="0.2" />

                {/* Awning Edge */}
                <path d="M4 45C4 45 10 50 20 50C30 50 35 45 45 45C55 45 60 50 70 50C80 50 85 45 96 45V42H4V45Z" fill="#166534" />
            </svg>
        </div>
    );
};

export default StoreLogo;
