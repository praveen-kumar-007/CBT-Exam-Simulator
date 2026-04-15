import React from 'react';
import { BRAND_LOGO_URL, BRAND_NAME } from '../constants/branding';

type ResultScreenProps = {
    attempted: number;
    answered: number;
    notAnswered: number;
    notVisited: number;
    total: number;
    onRestart: () => void;
};

const ResultScreen: React.FC<ResultScreenProps> = ({ attempted, answered, notAnswered, notVisited, total, onRestart }) => (
    <div className="flex min-h-screen items-center justify-center bg-gray-200">
        <div className="mx-4 w-full max-w-3xl rounded-2xl bg-white p-6 text-center shadow-xl sm:p-10">
            <div className="mb-6 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <img
                    src={BRAND_LOGO_URL}
                    alt={`${BRAND_NAME} logo`}
                    className="h-10 w-auto object-contain"
                />
                <span className="text-sm font-semibold tracking-wide text-slate-800">{BRAND_NAME}</span>
            </div>

            <div className="mb-6 rounded-xl border border-emerald-300 bg-emerald-50 p-4">
                <div className="flex items-center justify-center gap-2 text-emerald-700">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" className="opacity-30" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12.5l2.5 2.5L16 9.5" />
                    </svg>
                    <h1 className="text-2xl font-extrabold">EXAM SUBMITTED SUCCESSFULLY</h1>
                </div>
                <p className="mt-1 text-sm font-medium text-emerald-800">Your responses have been securely recorded.</p>
            </div>

            <div className="my-8 grid grid-cols-2 gap-4 text-sm font-semibold sm:grid-cols-4">
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

            <div className="mb-6 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
                Powered by {BRAND_NAME}
            </div>

            <p className="mb-6 text-sm text-gray-600">Total Questions: <strong>{total}</strong></p>

            <button
                onClick={onRestart}
                className="w-full rounded bg-blue-600 px-6 py-2 font-bold text-white transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 ring-offset-2"
            >
                Logout
            </button>
        </div>
    </div>
);

export default ResultScreen;
