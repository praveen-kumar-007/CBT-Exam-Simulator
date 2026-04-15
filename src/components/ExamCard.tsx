import React from 'react';

type ExamCardProps = {
    title: string;
    sectionCount: number;
    durationInMinutes: number;
    onStart: () => void;
};

const ExamCard: React.FC<ExamCardProps> = ({ title, sectionCount, durationInMinutes, onStart }) => (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">Sections: {sectionCount}</p>
        <p className="text-sm text-slate-600">Duration: {durationInMinutes} minutes</p>
        <button
            type="button"
            onClick={onStart}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
            Start Exam
        </button>
    </article>
);

export default ExamCard;
