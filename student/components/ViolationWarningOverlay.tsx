import React from 'react';

type ViolationWarningOverlayProps = {
    message: string;
    violationCount: number;
    maxViolations: number;
    onDismiss: () => void;
};

const ViolationWarningOverlay: React.FC<ViolationWarningOverlayProps> = ({
    message,
    violationCount,
    maxViolations,
    onDismiss,
}) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(220, 38, 38, 0.85)', backdropFilter: 'blur(8px)' }}
    >
        <div className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl animate-pulse-once">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-red-700">{String.fromCodePoint(0x26A0, 0xFE0F)} CHEATING DETECTED</h2>
            <p className="mb-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">{message}</p>

            <div className="mb-2 h-3 w-full rounded-full bg-gray-200">
                <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                        width: `${(violationCount / maxViolations) * 100}%`,
                        background: violationCount >= maxViolations - 1
                            ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                            : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                    }}
                />
            </div>
            <p className="mb-6 text-xs text-gray-500">
                {violationCount} of {maxViolations} violations {String.fromCodePoint(0x2014)} exam will auto-submit at {maxViolations}
            </p>

            <button
                onClick={onDismiss}
                className="transform rounded-lg bg-red-600 px-8 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-red-700 hover:shadow-xl"
            >
                I Understand {String.fromCodePoint(0x2014)} Return to Exam
            </button>
        </div>
    </div>
);

export default ViolationWarningOverlay;
