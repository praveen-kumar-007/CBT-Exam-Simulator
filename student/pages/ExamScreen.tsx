import React from 'react';
import { CheckCircleIcon, ClockIcon, EyeIcon, UserCircleIcon } from '../../components/icons';
import { Answers, ExamData, GameState, QuestionStatus } from '../../types';
import SecurityBadge from '../components/SecurityBadge';
import Calculator, { CalculatorMode } from '../../src/components/Calculator';
import { formatTime } from '../lib/examHelpers';

type ExamScreenProps = {
    examData: ExamData;
    candidateName: string;
    candidateRollNumber: string;
    examinerName: string;
    answers: Answers;
    setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
    markedForReview: string[];
    setMarkedForReview: React.Dispatch<React.SetStateAction<string[]>>;
    timeRemaining: number;
    currentSectionIndex: number;
    setCurrentSectionIndex: React.Dispatch<React.SetStateAction<number>>;
    currentQuestionIndex: number;
    setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    visited: string[];
    setVisited: React.Dispatch<React.SetStateAction<string[]>>;
    onAnswerInteraction: (questionId: string, optionIndex: number) => void;
    onSaveProgress: (updatedAnswers: Answers) => void;
    violationCount: number;
    maxViolations: number;
    calculatorEnabled: boolean;
    activeCalculatorType: CalculatorMode | null;
};

const ExamScreen: React.FC<ExamScreenProps> = (props) => {
    const {
        examData,
        candidateName,
        candidateRollNumber,
        examinerName,
        answers,
        setAnswers,
        markedForReview,
        setMarkedForReview,
        timeRemaining,
        currentSectionIndex,
        setCurrentSectionIndex,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        setGameState,
        visited,
        setVisited,
        onAnswerInteraction,
        onSaveProgress,
        violationCount,
        maxViolations,
        calculatorEnabled,
        activeCalculatorType,
    } = props;

    const currentSection = examData.sections[currentSectionIndex];
    const currentQuestion = currentSection.questions[currentQuestionIndex];
    const [calculatorOpen, setCalculatorOpen] = React.useState(false);
    const isAnyCalculatorEnabled = calculatorEnabled && activeCalculatorType !== null;

    const handleOptionChange = (optionIndex: number) => {
        onAnswerInteraction(currentQuestion.id, optionIndex);
        const nextAnswers = { ...answers, [currentQuestion.id]: String(optionIndex) };
        setAnswers(nextAnswers);
        onSaveProgress(nextAnswers);
    };

    const handleSaveResponse = () => {
        onSaveProgress(answers);
    };

    const handleClearResponse = () => {
        const newAnswers = { ...answers };
        delete newAnswers[currentQuestion.id];
        setAnswers(newAnswers);
        onSaveProgress(newAnswers);
    };

    const handleMarkForReview = () => {
        setMarkedForReview((prev) =>
            prev.includes(currentQuestion.id)
                ? prev.filter((id) => id !== currentQuestion.id)
                : [...prev, currentQuestion.id],
        );
    };

    const goToQuestion = (sectionIdx: number, questionIdx: number) => {
        setCurrentSectionIndex(sectionIdx);
        setCurrentQuestionIndex(questionIdx);
        const questionId = examData.sections[sectionIdx].questions[questionIdx].id;
        if (!visited.includes(questionId)) {
            setVisited((prev) => [...prev, questionId]);
        }
    };

    const goToSection = (sectionIdx: number) => {
        const targetSection = examData.sections[sectionIdx];
        if (!targetSection || targetSection.questions.length === 0) {
            return;
        }

        const targetQuestion = Math.min(currentQuestionIndex, targetSection.questions.length - 1);
        goToQuestion(sectionIdx, targetQuestion);
    };

    const handleNext = () => {
        if (currentQuestionIndex < currentSection.questions.length - 1) {
            goToQuestion(currentSectionIndex, currentQuestionIndex + 1);
        } else if (currentSectionIndex < examData.sections.length - 1) {
            goToQuestion(currentSectionIndex + 1, 0);
        }
    };

    const getQuestionStatus = (questionId: string): QuestionStatus => {
        const isAnswered =
            answers[questionId] !== undefined &&
            answers[questionId] !== null &&
            answers[questionId] !== '';
        const isMarked = markedForReview.includes(questionId);
        const isVisited = visited.includes(questionId);

        if (isAnswered && isMarked) return QuestionStatus.AnsweredAndMarked;
        if (isAnswered) return QuestionStatus.Answered;
        if (isMarked) return QuestionStatus.Marked;
        if (isVisited) return QuestionStatus.NotAnswered;
        return QuestionStatus.NotVisited;
    };

    const sectionStatuses = currentSection.questions.map((question) => getQuestionStatus(question.id));
    const answeredCount = sectionStatuses.filter((status) => status === QuestionStatus.Answered || status === QuestionStatus.AnsweredAndMarked).length;
    const markedCount = sectionStatuses.filter((status) => status === QuestionStatus.Marked || status === QuestionStatus.AnsweredAndMarked).length;
    const notAnsweredCount = sectionStatuses.filter((status) => status === QuestionStatus.NotAnswered).length;
    const notVisitedCount = sectionStatuses.filter((status) => status === QuestionStatus.NotVisited).length;

    const getSectionCounts = (sectionIdx: number) => {
        const section = examData.sections[sectionIdx];
        const statuses = section.questions.map((question) => getQuestionStatus(question.id));

        return {
            answered: statuses.filter((status) => status === QuestionStatus.Answered || status === QuestionStatus.AnsweredAndMarked).length,
            marked: statuses.filter((status) => status === QuestionStatus.Marked || status === QuestionStatus.AnsweredAndMarked).length,
        };
    };

    return (
        <div
            className="flex min-h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-slate-100 via-sky-50 to-slate-100 text-slate-900"
            style={{ userSelect: 'none' }}
        >
            <header className="sticky top-0 z-30 border-b border-slate-300 bg-gradient-to-r from-white via-slate-50 to-white shadow-sm">
                <div className="w-full px-4 py-3 sm:px-6 lg:px-8">
                    <div className="grid gap-2 lg:grid-cols-[minmax(260px,1.5fr)_minmax(420px,2fr)] lg:items-center lg:gap-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">Computer Based Examination</p>
                            <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg lg:text-xl">{examData.examTitle}</h1>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 sm:text-sm">
                            <div className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-semibold ${timeRemaining <= 300 ? 'border-red-300 bg-red-50 text-red-800' : 'border-sky-300 bg-sky-50 text-sky-800'}`}>
                                <ClockIcon className="h-4 w-4" />
                                <span className="truncate">{formatTime(timeRemaining)}</span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 rounded-md border border-indigo-300 bg-indigo-50 px-2.5 py-1.5 font-semibold text-indigo-800">
                                <EyeIcon className="h-4 w-4" />
                                <span className="truncate">Section: {currentSectionIndex + 1}</span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-800">
                                <CheckCircleIcon className="h-4 w-4" />
                                <span className="truncate">Q {currentQuestionIndex + 1}/{currentSection.questions.length}</span>
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-md border border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50 px-2.5 py-1.5 text-[11px] shadow-sm sm:text-xs">
                                <span className="font-semibold text-slate-700">Security</span>
                                <SecurityBadge violationCount={violationCount} maxViolations={maxViolations} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-1 gap-2 border-t border-slate-200 pt-2.5 text-xs sm:grid-cols-3 sm:text-sm lg:grid-cols-5">
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700">
                            <EyeIcon className="h-4 w-4 text-slate-600" />
                            <span className="truncate">{currentSection.name}</span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700">
                            <UserCircleIcon className="h-4 w-4 text-slate-600" />
                            <span className="truncate">{candidateName || 'Demo Guest'}</span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700">
                            <span className="text-[10px] uppercase tracking-wide text-slate-500">Roll</span>
                            <span className="truncate">{candidateRollNumber || 'demo-guest'}</span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700">
                            <span className="text-[10px] uppercase tracking-wide text-slate-500">Examiner</span>
                            <span className="truncate">{examinerName}</span>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 font-semibold text-slate-700 bg-white border-slate-300">
                            <button
                                type="button"
                                title={isAnyCalculatorEnabled ? `Open the ${activeCalculatorType} calculator` : 'Calculator access is disabled'}
                                onClick={() => {
                                    if (isAnyCalculatorEnabled) setCalculatorOpen(true);
                                }}
                                className={`inline-flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${isAnyCalculatorEnabled ? 'bg-sky-50 text-sky-800 hover:bg-sky-100' : 'bg-slate-100 text-slate-500 cursor-not-allowed'}`}
                                disabled={!isAnyCalculatorEnabled}
                            >
                                <span className="inline-flex items-center gap-1">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white">∑</span>
                                    <span>{activeCalculatorType || 'Calculator'}</span>
                                </span>
                                <span className="text-[10px] uppercase tracking-wide text-slate-500">{isAnyCalculatorEnabled ? 'Open' : 'Disabled'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="grid min-h-0 flex-1 gap-5 px-4 py-4 sm:px-6 lg:grid-cols-[2.15fr_1fr] lg:px-8">
                <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-base font-semibold text-slate-700">Question {currentQuestionIndex + 1}</p>
                            <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                <span className="rounded-md border border-emerald-300 bg-emerald-100 px-2 py-1 text-emerald-800">Answered: {answeredCount}</span>
                                <span className="rounded-md border border-violet-300 bg-violet-100 px-2 py-1 text-violet-800">Marked: {markedCount}</span>
                                <span className="rounded-md border border-red-300 bg-red-100 px-2 py-1 text-red-800">Not Answered: {notAnsweredCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-lg leading-8 text-slate-900 whitespace-pre-wrap">{currentQuestion.text}</p>
                        </div>

                        <div className="mt-5 space-y-3.5">
                            {currentQuestion.options.map((option, index) => {
                                const selected = answers[currentQuestion.id] === String(index);
                                return (
                                    <label
                                        key={index}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-base transition ${selected ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-300 hover:bg-blue-50/60'}`}
                                    >
                                        <input
                                            type="radio"
                                            name={currentQuestion.id}
                                            value={String(index)}
                                            checked={selected}
                                            onChange={() => handleOptionChange(index)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-400"
                                        />
                                        <span className="flex-1 text-slate-700 whitespace-pre-wrap">{option}</span>
                                        <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            {selected ? 'Selected' : 'Choose'}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        <div className="sticky bottom-0 mt-5 border-t border-slate-200 bg-white/95 pt-4 backdrop-blur">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="flex flex-wrap gap-2.5">
                                    <button
                                        onClick={handleSaveResponse}
                                        className="rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                                    >
                                        Save Response
                                    </button>
                                    <button
                                        onClick={handleMarkForReview}
                                        className="rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800"
                                    >
                                        Mark for Review
                                    </button>
                                    <button
                                        onClick={handleClearResponse}
                                        className="rounded-md border border-slate-400 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                                    >
                                        Clear Response
                                    </button>
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="ml-auto rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto">
                    <section className="rounded-2xl border border-slate-300 bg-white p-3 shadow-sm">
                        <div className="border-b border-slate-200 pb-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">Sections</p>
                            <p className="mt-1 text-[11px] text-slate-500">Compact navigator with live status</p>
                        </div>
                        <div className="mt-2 grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                            {examData.sections.map((section, idx) => {
                                const counts = getSectionCounts(idx);
                                const isActive = idx === currentSectionIndex;
                                return (
                                    <button
                                        key={section.name + idx}
                                        onClick={() => goToSection(idx)}
                                        className={`w-full rounded-2xl border px-3 py-3 text-left transition ${isActive ? 'border-sky-600 bg-sky-50 shadow-sm' : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <span className="truncate text-sm font-semibold text-slate-900">
                                                S{idx + 1}. {section.name}
                                            </span>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                                                    {counts.answered}/{section.questions.length} answered
                                                </span>
                                                {counts.marked > 0 && (
                                                    <span className="rounded-full border border-violet-300 bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-800">
                                                        {counts.marked} marked
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-300 bg-white p-3 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">Question Palette</p>
                        <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(52px, 1fr))' }}>
                            {currentSection.questions.map((q, index) => {
                                const status = getQuestionStatus(q.id);
                                let style = 'border border-slate-300 bg-white text-slate-700';
                                if (status === QuestionStatus.NotAnswered) style = 'bg-red-500 text-white';
                                if (status === QuestionStatus.Answered) style = 'bg-emerald-500 text-white';
                                if (status === QuestionStatus.Marked) style = 'bg-violet-500 text-white';
                                if (status === QuestionStatus.AnsweredAndMarked) style = 'bg-gradient-to-br from-emerald-500 to-violet-600 text-white';

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => goToQuestion(currentSectionIndex, index)}
                                        className={`min-h-[54px] rounded-2xl text-sm font-semibold transition ${style} ${currentQuestionIndex === index ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                        style={{ width: '100%', padding: '0.75rem 0' }}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Answered</div>
                            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" /> Not Answered</div>
                            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-500" /> Marked for Review</div>
                            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-300" /> Not Visited</div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Exam Calculator</p>
                        {calculatorEnabled ? (
                            <>
                                {activeCalculatorType ? (
                                    <>
                                        <p className="mt-3 text-sm font-semibold text-slate-900">Active calculator: {activeCalculatorType}</p>
                                        <p className="mt-2 text-sm text-slate-600">Your administrator has enabled this calculator type for the exam.</p>
                                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                                            <p className="font-semibold text-slate-900">Open the calculator using the floating button.</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="mt-3 text-sm text-slate-600">Calculator access is enabled, but no calculator type has been selected for this exam. Please contact your administrator.</p>
                                )}
                            </>
                        ) : (
                            <p className="mt-2 text-sm text-slate-600">No calculator access is enabled for this exam. Contact your administrator if you need calculator support.</p>
                        )}
                    </section>
                    <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Final Submission</p>
                        <p className="mt-2 text-sm text-slate-600">Check your responses before submitting the exam.</p>
                        <button
                            onClick={() => setGameState(GameState.Review)}
                            className="mt-3 w-full rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                        >
                            Review & Submit
                        </button>
                    </section>
                </aside>
            </main>

            {calculatorOpen && activeCalculatorType && (
                <Calculator
                    popup
                    initialMode={activeCalculatorType}
                    allowedTypes={[activeCalculatorType]}
                    onClose={() => setCalculatorOpen(false)}
                    showModeSwitcher={false}
                />
            )}
        </div>
    );
};

export default ExamScreen;
