import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AdminApp from './admin/AdminApp';
import { examData as defaultExamData } from './data/questions';
import { useAntiCheat, ViolationEntry } from './hooks/useAntiCheat';
import { Answers, ExamData, GameState, Question, QuestionInteraction, Section, SubmissionMeta } from './types';
import type { CalculatorMode } from './src/components/Calculator';
import BrandSignature from './student/components/BrandSignature';
import ViolationWarningOverlay from './student/components/ViolationWarningOverlay';
import DisqualifiedScreen from './student/pages/DisqualifiedScreen';
import ExamScreen from './student/pages/ExamScreen';
import InstructionScreen from './student/pages/InstructionScreen';
import LoginScreen from './student/pages/LoginScreen';
import ResultScreen from './student/pages/ResultScreen';
import ReviewScreen from './student/pages/ReviewScreen';
import {
  apiRequest,
  buildInteractionMap,
  exitFullScreenSafely,
  getStudentExamConfig,
  makeDefaultSubmissionMeta,
} from './student/lib/examHelpers';

const StudentApp: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Login);
  const [examData, setExamData] = useState<ExamData>(defaultExamData);
  const [answers, setAnswers] = useState<Answers>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(defaultExamData.durationInMinutes * 60);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [visited, setVisited] = useState<string[]>([]);
  const [isGateOpening, setIsGateOpening] = useState(false);
  const [studentToken, setStudentToken] = useState('');
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  const [sectionSessionIds, setSectionSessionIds] = useState<string[]>([]);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [apiError, setApiError] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateRollNumber, setCandidateRollNumber] = useState('');
  const [examinerName, setExaminerName] = useState('CBT Examination Cell');
  const [examStartAt, setExamStartAt] = useState<string | null>(null);
  const [examForceEndedAt, setExamForceEndedAt] = useState<string | null>(null);
  const [autoSubmitAfterTime, setAutoSubmitAfterTime] = useState(true);
  const [calculatorEnabled, setCalculatorEnabled] = useState(false);
  const [activeCalculatorType, setActiveCalculatorType] = useState<CalculatorMode | null>(null);
  const [questionInteractions, setQuestionInteractions] = useState<Record<string, QuestionInteraction>>({});
  const [totalOptionChanges, setTotalOptionChanges] = useState(0);
  const [submissionMeta, setSubmissionMeta] = useState<SubmissionMeta>(makeDefaultSubmissionMeta());
  const submitLockRef = useRef(false);

  const allQuestions = useMemo(() => examData.sections.flatMap((s) => s.questions), [examData]);

  const isProtectionActive =
    gameState === GameState.Ongoing ||
    gameState === GameState.Review ||
    gameState === GameState.Disqualified;

  const isExamActive = gameState === GameState.Ongoing || gameState === GameState.Review;

  const updateQuestionInteraction = useCallback((questionId: string, optionIndex: number) => {
    setQuestionInteractions((prev) => {
      const current = prev[questionId] || {
        questionId,
        firstSelectedOptionIndex: null,
        finalSelectedOptionIndex: null,
        changeCount: 0,
        selectionHistory: [],
      };

      const hasDifferentPrevious =
        current.selectionHistory.length > 0 &&
        current.selectionHistory[current.selectionHistory.length - 1] !== optionIndex;

      if (hasDifferentPrevious) {
        setTotalOptionChanges((count) => count + 1);
      }

      return {
        ...prev,
        [questionId]: {
          ...current,
          firstSelectedOptionIndex:
            current.firstSelectedOptionIndex === null
              ? optionIndex
              : current.firstSelectedOptionIndex,
          finalSelectedOptionIndex: optionIndex,
          changeCount: current.changeCount + (hasDifferentPrevious ? 1 : 0),
          selectionHistory: [...current.selectionHistory, optionIndex],
        },
      };
    });
  }, []);

  const handleSubmitExam = useCallback(
    async (overrideMeta: Partial<SubmissionMeta> & { securityEvents?: { type: string; message: string; timestamp: string }[] } = {}) => {
      if (submitLockRef.current) {
        return;
      }
      submitLockRef.current = true;

      const interactionSnapshot: Record<string, QuestionInteraction> = Object.keys(questionInteractions).length
        ? questionInteractions
        : buildInteractionMap(allQuestions);

      const interactions = allQuestions.map((question) => {
        const base = interactionSnapshot[question.id] || {
          questionId: question.id,
          firstSelectedOptionIndex: null,
          finalSelectedOptionIndex: null,
          changeCount: 0,
          selectionHistory: [],
        };

        const selected = answers[question.id];
        const parsedFinal = selected !== undefined ? Number(selected) : null;

        return {
          ...base,
          finalSelectedOptionIndex:
            parsedFinal !== null && Number.isInteger(parsedFinal) ? parsedFinal : null,
        };
      });

      const effectiveMeta: SubmissionMeta = {
        ...makeDefaultSubmissionMeta(),
        ...overrideMeta,
        totalOptionChanges,
        questionInteractions: interactions,
      };

      setSubmissionMeta(effectiveMeta);

      try {
        if (studentToken && sectionIds.length) {
          let attempted = 0;

          for (let i = 0; i < examData.sections.length; i += 1) {
            const section = examData.sections[i];
            const sectionId = sectionIds[i];

            if (!sectionId) {
              continue;
            }

            const submissionAnswers = section.questions.reduce<Array<{ questionId: string; selectedOptionIndex: number }>>((acc, question) => {
              const selectedValue = answers[question.id];
              if (selectedValue === undefined || selectedValue === null || selectedValue === '') {
                return acc;
              }

              const selectedOptionIndex = Number(selectedValue);
              if (Number.isInteger(selectedOptionIndex) && selectedOptionIndex >= 0 && selectedOptionIndex <= 3) {
                acc.push({ questionId: question.id, selectedOptionIndex });
              }

              return acc;
            }, []);

            const sessionId = sectionSessionIds[i];
            if (!sessionId) {
              continue;
            }

            const sectionQuestionIds = new Set(section.questions.map((q) => q.id));
            const sectionInteractions = interactions.filter((item) => sectionQuestionIds.has(item.questionId));

            const result = await apiRequest<{ data: { attemptedQuestions: number } }>('/api/student/submit', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${studentToken}`,
              },
              body: JSON.stringify({
                sectionId,
                sessionId,
                answers: submissionAnswers,
                remark: effectiveMeta.terminationRemark || undefined,
                examMeta: {
                  terminatedDueToCheating: effectiveMeta.terminatedDueToCheating,
                  terminationRemark: effectiveMeta.terminationRemark,
                  cheatingAttempts: effectiveMeta.cheatingAttempts,
                  totalOptionChanges: effectiveMeta.totalOptionChanges,
                  questionInteractions: sectionInteractions,
                  securityEvents: effectiveMeta.securityEvents,
                },
              }),
            });

            attempted += result.data.attemptedQuestions;
          }

          setAttemptedCount(attempted);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to submit exam to server.';
        setApiError(message);
      }

      setGameState(effectiveMeta.terminatedDueToCheating ? GameState.Disqualified : GameState.Finished);
      setTimeRemaining(0);
      await exitFullScreenSafely();
    },
    [allQuestions, answers, examData.sections, questionInteractions, sectionIds, sectionSessionIds, studentToken, totalOptionChanges],
  );

  const handleAutoSubmit = useCallback(
    (context: {
      violationCount: number;
      violations: ViolationEntry[];
    }) => {
      const timeline = context.violations
        .map(
          (event, index) =>
            `${index + 1}. ${new Date(event.timestamp).toLocaleString()} — ${event.message}`,
        )
        .join('\n');

      const remark =
        `Exam terminated due to cheating after ${context.violationCount} violations. ` +
        `Reason timeline:\n${timeline}`;

      void handleSubmitExam({
        terminatedDueToCheating: true,
        terminationRemark: remark,
        cheatingAttempts: context.violationCount,
        securityEvents: context.violations.map((event) => ({
          type: event.type,
          message: event.message,
          timestamp: event.timestamp.toISOString(),
        })),
      });
    },
    [handleSubmitExam],
  );

  const sendSecurityEvent = useCallback(
    async (event: { type: string; message: string; timestamp: string }) => {
      const currentSessionId = sectionSessionIds[currentSectionIndex];
      if (!studentToken || !currentSessionId) return;

      try {
        await apiRequest<{ success: boolean }>(
          `/api/student/sessions/${currentSessionId}/progress`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${studentToken}`,
            },
            body: JSON.stringify({
              answers: [],
              examMeta: {
                securityEvents: [event],
              },
            }),
          },
        );
      } catch (error) {
        console.warn('Failed to report security event:', error);
      }
    },
    [currentSectionIndex, sectionSessionIds, studentToken],
  );

  const antiCheat = useAntiCheat({
    enabled: isProtectionActive,
    trackViolations: isExamActive,
    maxViolations: 3,
    onAutoSubmit: handleAutoSubmit,
    onSecurityEvent: sendSecurityEvent,
  });

  useEffect(() => {
    if (gameState === GameState.Ongoing && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    if (timeRemaining === 0 && gameState === GameState.Ongoing) {
      if (autoSubmitAfterTime) {
        handleSubmitExam({ cheatingAttempts: antiCheat.violationCount });
      } else {
        setGameState(GameState.Finished);
      }
    }
  }, [antiCheat.violationCount, autoSubmitAfterTime, gameState, handleSubmitExam, timeRemaining]);

  useEffect(() => {
    if (gameState !== GameState.Ongoing || !studentToken) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const examConfig = await getStudentExamConfig(studentToken);
        if (isSubscribed && examConfig.forceEndedAt) {
          setExamForceEndedAt(examConfig.forceEndedAt);
          setTimeRemaining(0);
          handleSubmitExam({
            terminationRemark: 'The exam was forcibly ended by the administrator.',
            cheatingAttempts: antiCheat.violationCount,
          });
          return;
        }

        if (isSubscribed) {
          setCalculatorEnabled(examConfig.calculatorEnabled ?? false);
          setActiveCalculatorType(
            (examConfig.activeCalculatorType as CalculatorMode) || null,
          );
        }
      } catch {
        // Silence transient poll errors.
      }
    }, 25000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [antiCheat.violationCount, gameState, handleSubmitExam, studentToken]);

  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => setApiError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  const startExam = async () => {
    antiCheat.enterFullScreen().catch(console.error);
    submitLockRef.current = false;

    const firstQuestionId = examData.sections[0].questions[0].id;
    setVisited([firstQuestionId]);
    setGameState(GameState.Ongoing);
  };

  const resetExam = async () => {
    antiCheat.reset();
    await antiCheat.exitFullScreen();

    setGameState(GameState.Login);
    setExamData(defaultExamData);
    setAnswers({});
    setMarkedForReview([]);
    setTimeRemaining(defaultExamData.durationInMinutes * 60);
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setVisited([]);
    setStudentToken('');
    setSectionIds([]);
    setSectionSessionIds([]);
    setAttemptedCount(0);
    setApiError('');
    setCandidateName('');
    setCandidateRollNumber('');
    setExaminerName('CBT Examination Cell');
    setQuestionInteractions({});
    setTotalOptionChanges(0);
    setSubmissionMeta(makeDefaultSubmissionMeta());
    setActiveCalculatorType(null);
    submitLockRef.current = false;
  };

  const initializeStudentExam = useCallback(async (token: string, displayName: string, loginId: string) => {
    setStudentToken(token);

    const examConfig = await getStudentExamConfig(token);
    const now = new Date();
    const examStart = examConfig.startAt ? new Date(examConfig.startAt) : null;
    const examEnded = examConfig.forceEndedAt ? new Date(examConfig.forceEndedAt) : null;
    const examEntryEnds = examStart
      ? new Date(examStart.getTime() + 30 * 60 * 1000)
      : null;

    if (examStart && now < examStart) {
      throw new Error(`Exam access opens at ${examStart.toLocaleString()}. Please log in at the scheduled start time.`);
    }

    if (examEntryEnds && now > examEntryEnds) {
      throw new Error(
        'Exam entry has closed. Students may only start within 30 minutes after the scheduled exam start time.',
      );
    }

    if (examEnded && now >= examEnded) {
      throw new Error('The scheduled exam period has ended. Please contact your administrator.');
    }

    setExamStartAt(examConfig.startAt || null);
    setExamForceEndedAt(examConfig.forceEndedAt || null);
    setAutoSubmitAfterTime(examConfig.autoSubmitAfterTime ?? true);
    setCalculatorEnabled(examConfig.calculatorEnabled ?? false);
    setActiveCalculatorType(
      (examConfig.activeCalculatorType as CalculatorMode) || null,
    );

    const sectionsResponse = await apiRequest<{ data: Array<{ _id: string; name: string }> }>('/api/student/sections', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const sectionQuestionResponses = await Promise.all(
      sectionsResponse.data.map((section) =>
        apiRequest<{ data: { sessionId: string; questions: Array<{ id: string; questionText: string; options: string[] }> } }>(
          `/api/student/questions/section/${section._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      ),
    );

    const mappedSections: Section[] = sectionsResponse.data.map((section, index) => ({
      name: section.name,
      questions: sectionQuestionResponses[index].data.questions.map((q) => ({
        id: q.id,
        text: q.questionText,
        options: q.options,
        answer: '',
      })),
    }));

    if (!mappedSections.length || mappedSections.every((section) => section.questions.length === 0)) {
      throw new Error('No active questions available. Please contact admin.');
    }

    setExamData((prev) => ({
      ...prev,
      durationInMinutes: examConfig.durationInMinutes,
      sections: mappedSections,
    }));
    setSectionIds(sectionsResponse.data.map((section) => section._id));
    setSectionSessionIds(sectionQuestionResponses.map((res) => res.data.sessionId));
    setTimeRemaining(examConfig.durationInMinutes * 60);
    setExaminerName(examConfig.examinerName);
    setCandidateName(displayName);
    setCandidateRollNumber(loginId);

    const flatQuestions = mappedSections.flatMap((section) => section.questions);
    setQuestionInteractions(buildInteractionMap(flatQuestions));
    setTotalOptionChanges(0);
    setSubmissionMeta(makeDefaultSubmissionMeta());
    submitLockRef.current = false;

    setTimeout(() => {
      setGameState(GameState.Instructions);
      setIsGateOpening(false);
    }, 2200);
  }, []);

  const handleLoginGateway = useCallback(async (studentName: string, rollNumber: string, organizationCode: string) => {
    setIsGateOpening(true);
    setApiError('');

    try {
      const session = await apiRequest<{ data: { token: string } }>('/api/auth/student/session', {
        method: 'POST',
        body: JSON.stringify({ loginId: rollNumber, password: studentName, organizationCode }),
      });

      const token = session.data.token;
      await initializeStudentExam(token, studentName, rollNumber);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start exam session.';
      setApiError(message);
      setIsGateOpening(false);
    }
  }, [initializeStudentExam]);

  const handleDemoGateway = useCallback(async () => {
    setIsGateOpening(true);
    setApiError('');

    try {
      const session = await apiRequest<{ data: { token: string; user?: { name?: string; studentCredential?: string } } }>('/api/auth/student/demo-session', {
        method: 'POST',
      });

      const token = session.data.token;
      const demoName = session.data.user?.name || 'Demo Guest';
      const demoRoll = session.data.user?.studentCredential || 'demo-guest';
      await initializeStudentExam(token, demoName, demoRoll);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start demo exam.';
      setApiError(message);
      setIsGateOpening(false);
    }
  }, [initializeStudentExam]);

  const saveCurrentSectionProgress = useCallback(async (updatedAnswers: Answers) => {
    if (!studentToken) {
      return;
    }

    const sectionId = sectionIds[currentSectionIndex];
    const sessionId = sectionSessionIds[currentSectionIndex];
    const section = examData.sections[currentSectionIndex];

    if (!sectionId || !sessionId || !section) {
      return;
    }

    const answersPayload = section.questions.map((question) => ({
      questionId: question.id,
      selectedOptionIndex:
        updatedAnswers[question.id] !== undefined
          ? Number(updatedAnswers[question.id])
          : null,
    }));

    try {
      await apiRequest(`/api/student/sessions/${sessionId}/progress`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          answers: answersPayload,
          examMeta: {
            cheatingAttempts: antiCheat.violationCount,
            totalOptionChanges,
            questionInteractions: Object.values(questionInteractions),
          },
        }),
      });
    } catch (error) {
      console.warn('Failed to save current exam progress:', error);
    }
  }, [studentToken, sectionIds, sectionSessionIds, currentSectionIndex, examData.sections, antiCheat.violationCount, questionInteractions, totalOptionChanges]);

  const renderContent = () => {
    const attemptedSummary = visited.length;
    const answeredSummary = Object.keys(answers).length;
    const notAnsweredSummary = Math.max(attemptedSummary - answeredSummary, 0);
    const notVisitedSummary = Math.max(allQuestions.length - attemptedSummary, 0);

    switch (gameState) {
      case GameState.Login:
        return <LoginScreen onLogin={handleLoginGateway} onDemoStart={handleDemoGateway} isGateOpening={isGateOpening} />;
      case GameState.Instructions:
        return <InstructionScreen onStart={startExam} examData={examData} examinerName={examinerName} />;
      case GameState.Ongoing:
        return (
          <ExamScreen
            examData={examData}
            candidateName={candidateName}
            candidateRollNumber={candidateRollNumber}
            examinerName={examinerName}
            answers={answers}
            setAnswers={setAnswers}
            markedForReview={markedForReview}
            setMarkedForReview={setMarkedForReview}
            timeRemaining={timeRemaining}
            currentSectionIndex={currentSectionIndex}
            setCurrentSectionIndex={setCurrentSectionIndex}
            currentQuestionIndex={currentQuestionIndex}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            setGameState={setGameState}
            visited={visited}
            setVisited={setVisited}
            onAnswerInteraction={updateQuestionInteraction}
            onSaveProgress={saveCurrentSectionProgress}
            violationCount={antiCheat.violationCount}
            maxViolations={antiCheat.maxViolations}
            calculatorEnabled={calculatorEnabled}
            activeCalculatorType={activeCalculatorType}
          />
        );
      case GameState.Review:
        return (
          <ReviewScreen
            answers={answers}
            visited={visited}
            onConfirmSubmit={() => handleSubmitExam({ cheatingAttempts: antiCheat.violationCount })}
            onGoBack={() => setGameState(GameState.Ongoing)}
            allQuestions={allQuestions}
          />
        );
      case GameState.Finished:
        return (
          <ResultScreen
            attempted={attemptedSummary}
            answered={answeredSummary}
            notAnswered={notAnsweredSummary}
            notVisited={notVisitedSummary}
            total={allQuestions.length}
            onRestart={resetExam}
          />
        );
      case GameState.Disqualified:
        return (
          <DisqualifiedScreen
            attempted={attemptedSummary}
            answered={answeredSummary}
            notAnswered={notAnsweredSummary}
            notVisited={notVisitedSummary}
            total={allQuestions.length}
            onRestart={resetExam}
          />
        );
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 font-sans text-gray-800">
      {apiError && (
        <div
          className="fixed top-3 right-3 z-50 rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-700 shadow-lg"
          style={{ animation: 'slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          {apiError}
        </div>
      )}
      {antiCheat.isSecurityLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 text-white p-6">
          <div className="max-w-xl rounded-3xl border border-white/20 bg-slate-900/95 p-6 text-center shadow-2xl">
            <div className="mb-4 text-sm uppercase tracking-[0.24em] text-amber-300">Exam protection active</div>
            <div className="text-lg font-semibold text-white">Access is temporarily blocked</div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {antiCheat.securityLockReason ||
                'Your device or browser tried to leave the secure exam environment.'}
            </p>
            <div className="mt-5 rounded-2xl bg-slate-800 px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-200">
              The exam will resume automatically when the environment is restored.
            </div>
          </div>
        </div>
      )}
      {renderContent()}

      {!isExamActive && (
        <footer className="mt-10">
          <BrandSignature />
        </footer>
      )}

      {antiCheat.warningMessage && isExamActive && (
        <ViolationWarningOverlay
          message={antiCheat.warningMessage}
          violationCount={antiCheat.violationCount}
          maxViolations={antiCheat.maxViolations}
          onDismiss={antiCheat.dismissWarning}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/admin')) {
    return <AdminApp />;
  }

  return <StudentApp />;
};

export default App;
