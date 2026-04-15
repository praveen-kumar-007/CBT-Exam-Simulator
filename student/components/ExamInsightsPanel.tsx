import React from 'react';
import { SubmissionMeta } from '../../types';

type ExamInsightsPanelProps = {
    submissionMeta: SubmissionMeta;
};

const ExamInsightsPanel: React.FC<ExamInsightsPanelProps> = ({ submissionMeta }) => {
    const touchedQuestions = submissionMeta.questionInteractions.filter((item) => item.selectionHistory.length > 0);
    const changedQuestions = touchedQuestions.filter((item) => item.changeCount > 0);

    return (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-left">
            <h3 className="mb-4 text-base font-bold text-slate-800">Behavior Insights</h3>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-sky-100 bg-sky-50 p-3">
                    <p className="text-xs font-semibold uppercase text-sky-700">Cheating Attempts</p>
                    <p className="text-xl font-bold text-sky-900">{submissionMeta.cheatingAttempts}</p>
                </div>
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                    <p className="text-xs font-semibold uppercase text-amber-700">Option Changes</p>
                    <p className="text-xl font-bold text-amber-900">{submissionMeta.totalOptionChanges}</p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-xs font-semibold uppercase text-emerald-700">Questions Touched</p>
                    <p className="text-xl font-bold text-emerald-900">{touchedQuestions.length}</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200">
                <div className="hidden bg-slate-100 text-xs font-semibold text-slate-700 sm:grid sm:grid-cols-4">
                    <div className="p-2">Question ID</div>
                    <div className="p-2">First Choice</div>
                    <div className="p-2">Final Choice</div>
                    <div className="p-2">Changes</div>
                </div>
                <div className="max-h-52 overflow-y-auto">
                    {touchedQuestions.length === 0 && (
                        <div className="p-3 text-sm text-slate-500">No option interactions recorded.</div>
                    )}
                    {touchedQuestions.map((item) => (
                        <div key={item.questionId} className="grid grid-cols-1 border-t border-slate-100 text-sm sm:grid-cols-4">
                            <div className="p-2 font-mono text-xs text-slate-600">{item.questionId}</div>
                            <div className="p-2 text-slate-700">{item.firstSelectedOptionIndex === null ? '-' : item.firstSelectedOptionIndex + 1}</div>
                            <div className="p-2 text-slate-700">{item.finalSelectedOptionIndex === null ? '-' : item.finalSelectedOptionIndex + 1}</div>
                            <div className="p-2 text-slate-700">
                                <span className={item.changeCount > 0 ? 'font-semibold text-amber-700' : ''}>{item.changeCount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {changedQuestions.length > 0 && (
                <p className="mt-3 text-xs text-slate-500">
                    {changedQuestions.length} question(s) were modified at least once. Final answers only were submitted for marking.
                </p>
            )}
        </div>
    );
};

export default ExamInsightsPanel;
