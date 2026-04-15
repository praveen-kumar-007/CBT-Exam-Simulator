import React from 'react';
import { Answers, Question } from '../../types';

type ReviewScreenProps = {
    answers: Answers;
    visited: string[];
    allQuestions: Question[];
    onConfirmSubmit: () => void;
    onGoBack: () => void;
};

const ReviewScreen: React.FC<ReviewScreenProps> = ({
    answers,
    visited,
    allQuestions,
    onConfirmSubmit,
    onGoBack,
}) => {
    const attemptedCount = visited.length;
    const answeredCount = Object.keys(answers).length;
    const notAnsweredCount = Math.max(attemptedCount - answeredCount, 0);
    const notVisitedCount = allQuestions.length - visited.length;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-200">
            <div className="max-w-md rounded-md bg-white p-8 text-center shadow-lg">
                <h1 className="mb-6 text-2xl font-bold">Exam Summary</h1>
                <div className="mb-8 grid grid-cols-2 gap-4 text-md">
                    <div className="rounded bg-blue-100 p-4 text-blue-800">
                        <p className="text-2xl font-bold">{attemptedCount}</p>
                        <p>Attempted</p>
                    </div>
                    <div className="rounded bg-green-100 p-4 text-green-800">
                        <p className="text-2xl font-bold">{answeredCount}</p>
                        <p>Answered</p>
                    </div>
                    <div className="rounded bg-red-100 p-4 text-red-800">
                        <p className="text-2xl font-bold">{notAnsweredCount}</p>
                        <p>Not Answered</p>
                    </div>
                    <div className="rounded bg-gray-100 p-4 text-gray-800">
                        <p className="text-2xl font-bold">{notVisitedCount}</p>
                        <p>Not Visited</p>
                    </div>
                </div>
                <p className="mb-8 text-gray-600">Are you sure you want to submit for final marking? No changes will be allowed after submission.</p>
                <div className="mb-6 rounded border border-sky-200 bg-sky-50 p-3 text-center text-sm font-semibold text-sky-900">
                    Powered by INDOCREONIX
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={onGoBack} className="rounded bg-gray-300 px-6 py-2 font-bold text-gray-800 transition-colors hover:bg-gray-400">No, Go Back</button>
                    <button onClick={onConfirmSubmit} className="rounded bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700">Yes, Submit</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewScreen;
