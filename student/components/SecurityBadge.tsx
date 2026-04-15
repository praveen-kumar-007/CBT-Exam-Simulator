import React from 'react';

type SecurityBadgeProps = {
    violationCount: number;
    maxViolations: number;
};

const SecurityBadge: React.FC<SecurityBadgeProps> = ({ violationCount, maxViolations }) => {
    const isSafe = violationCount === 0;
    const isWarning = violationCount > 0 && violationCount < maxViolations - 1;
    const isCritical = violationCount >= maxViolations - 1;

    const badgeClass = isSafe
        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-emerald-100'
        : isWarning
            ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-amber-100'
            : 'border-rose-300 bg-rose-50 text-rose-800 shadow-rose-100';

    const dotClass = isSafe
        ? 'bg-emerald-500'
        : isWarning
            ? 'bg-amber-500'
            : 'bg-rose-500';

    return (
        <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${badgeClass} ${isCritical ? 'animate-pulse' : ''}`}
            aria-label="Security status"
            title={isSafe ? 'Secure session' : `Warnings: ${violationCount} of ${maxViolations}`}
        >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-2.6 7.5-7 9-4.4-1.5-7-4.5-7-9V6l7-3z" />
            </svg>
            <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
            <span>{isSafe ? 'Secure' : `Alert ${violationCount}/${maxViolations}`}</span>
        </div>
    );
};

export default SecurityBadge;
