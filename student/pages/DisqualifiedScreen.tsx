import React from 'react';
import { BRAND_LOGO_URL, BRAND_NAME } from '../constants/branding';

type DisqualifiedScreenProps = {
    attempted: number;
    answered: number;
    notAnswered: number;
    notVisited: number;
    total: number;
    onRestart: () => void;
};

const DisqualifiedScreen: React.FC<DisqualifiedScreenProps> = ({ attempted, answered, notAnswered, notVisited, total, onRestart }) => (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="mx-4 w-full max-w-3xl rounded-2xl bg-white bg-opacity-95 p-6 text-center shadow-2xl sm:p-10">
            <div className="mb-6 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                <img
                    src={BRAND_LOGO_URL}
                    alt={`${BRAND_NAME} logo`}
                    className="h-11 w-auto object-contain"
                />
                <span className="text-sm font-semibold tracking-wide text-slate-800">{BRAND_NAME}</span>
            </div>

            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-16 w-16 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12.5l2.2 2.2L16 10" />
                    <circle cx="12" cy="12" r="9" strokeWidth={2} className="opacity-50" />
                </svg>
            </div>

            <h1 className="mb-2 text-3xl font-bold text-emerald-700">EXAM SUBMITTED SUCCESSFULLY</h1>
            <p className="mb-6 text-lg text-gray-600">Your responses have been securely recorded.</p>

            <div className="mb-6 grid grid-cols-2 gap-4 text-sm font-semibold sm:grid-cols-4">
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-900">
                    <p className="text-2xl font-bold">{attempted}</p>
                    <p>Attempted</p>
                </div>
                <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-900">
                    <p className="text-2xl font-bold">{answered}</p>
                    <p>Answered</p>
                </div>
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
                    <p className="text-2xl font-bold">{notAnswered}</p>
                    <p>Not Answered</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-slate-900">
                    <p className="text-2xl font-bold">{notVisited}</p>
                    <p>Not Visited</p>
                </div>
            </div>

            <div className="mb-4 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
                Powered by {BRAND_NAME}
            </div>

            <p className="mb-6 text-xs text-gray-500">
                Total Questions: <strong>{total}</strong>
            </p>

            <button
                onClick={onRestart}
                className="w-full rounded-xl bg-gray-800 px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:bg-gray-900"
            >
                Return to Login
            </button>
        </div>
    </div>
);

export default DisqualifiedScreen;
