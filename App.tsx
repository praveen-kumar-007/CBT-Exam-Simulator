import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { examData as defaultExamData } from './data/questions';
import { GameState, QuestionStatus, Answers, Section, Question, ExamData, QuestionInteraction, SubmissionMeta } from './types';
import { ClockIcon, CheckCircleIcon, XCircleIcon, EyeIcon, UserCircleIcon } from './components/icons';
import { useAntiCheat, ViolationEntry } from './hooks/useAntiCheat';
import AdminApp from './admin/AdminApp';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const BRAND_NAME = 'Indocreonix';
const BRAND_LOGO_URL = '/original_logo.png';

// --- Helper Functions ---
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const apiRequest = async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request failed.');
  }

  return payload as T;
};

const getStudentExamConfig = async (token: string) => {
  try {
    const config = await apiRequest<{ data: { durationInMinutes: number; examinerName?: string; startAt?: string | null; forceEndedAt?: string | null; autoSubmitAfterTime?: boolean } }>('/api/student/exam-config', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const durationValue = Number(config?.data?.durationInMinutes);
    const safeDuration = Number.isInteger(durationValue) && durationValue > 0
      ? durationValue
      : defaultExamData.durationInMinutes;

    return {
      durationInMinutes: safeDuration,
      examinerName: config?.data?.examinerName || 'CBT Examination Cell',
      startAt: config?.data?.startAt || null,
      forceEndedAt: config?.data?.forceEndedAt || null,
      autoSubmitAfterTime: typeof config?.data?.autoSubmitAfterTime === 'boolean' ? config.data.autoSubmitAfterTime : true,
    };
  } catch (error) {
    console.warn('Exam config fetch failed, falling back to default duration.', error);
  }

  return {
    durationInMinutes: defaultExamData.durationInMinutes,
    examinerName: 'CBT Examination Cell',
    startAt: null,
    forceEndedAt: null,
    autoSubmitAfterTime: true,
  };
};

const makeDefaultSubmissionMeta = (): SubmissionMeta => ({
  terminatedDueToCheating: false,
  terminationRemark: '',
  cheatingAttempts: 0,
  totalOptionChanges: 0,
  questionInteractions: [],
});

const buildInteractionMap = (questions: Question[]): Record<string, QuestionInteraction> => {
  return questions.reduce<Record<string, QuestionInteraction>>((acc, question) => {
    acc[question.id] = {
      questionId: question.id,
      firstSelectedOptionIndex: null,
      finalSelectedOptionIndex: null,
      changeCount: 0,
      selectionHistory: [],
    };
    return acc;
  }, {});
};

const exitFullScreenSafely = async () => {
  try {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
    }
  } catch (error) {
    console.warn('Failed to exit full-screen:', error);
  }
};

// --- Violation Warning Overlay ---
const ViolationWarningOverlay: React.FC<{
  message: string;
  violationCount: number;
  maxViolations: number;
  onDismiss: () => void;
}> = ({ message, violationCount, maxViolations, onDismiss }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ backgroundColor: 'rgba(220, 38, 38, 0.85)', backdropFilter: 'blur(8px)' }}
  >
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center animate-pulse-once">
      <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-red-700 mb-2">{String.fromCodePoint(0x26A0, 0xFE0F)} CHEATING DETECTED</h2>
      <p className="text-gray-700 whitespace-pre-line mb-4 text-sm leading-relaxed">{message}</p>

      {/* Violation progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
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
      <p className="text-xs text-gray-500 mb-6">
        {violationCount} of {maxViolations} violations {String.fromCodePoint(0x2014)} exam will auto-submit at {maxViolations}
      </p>

      <button
        onClick={onDismiss}
        className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        I Understand {String.fromCodePoint(0x2014)} Return to Exam
      </button>
    </div>
  </div>
);

// --- Disqualified Screen ---
const DisqualifiedScreen: React.FC<{
  violations: ViolationEntry[];
  onRestart: () => void;
  submissionMeta: SubmissionMeta;
}> = ({ violations, onRestart, submissionMeta }) => (
  <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
    <div className="p-6 sm:p-10 bg-white bg-opacity-95 rounded-2xl shadow-2xl text-center max-w-3xl w-full mx-4">
      <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-16 h-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left">
        <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider">Termination Remark</h3>
        <p className="text-sm text-slate-700">
          {submissionMeta.terminationRemark || 'Exam terminated due to cheating.'}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Cheating attempts tracked: <strong>{submissionMeta.cheatingAttempts || violations.length}</strong>
        </p>
      </div>

      <ExamInsightsPanel submissionMeta={submissionMeta} />
      <h1 className="text-3xl font-bold text-red-700 mb-2">Exam Terminated</h1>
      <p className="text-gray-500 text-lg mb-6">Cheating activity was detected</p>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
        <h3 className="text-sm font-bold text-red-800 mb-3 uppercase tracking-wider">Violation Log</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {violations.map((v, i) => (
            <div key={i} className="flex items-start text-xs text-red-700 bg-white p-2 rounded-lg border border-red-100">
              <span className="font-mono text-red-400 mr-2 whitespace-nowrap">
                {v.timestamp.toLocaleTimeString()}
              </span>
              <span className="font-semibold">{v.message}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-6">
        Your exam has been automatically submitted due to multiple policy violations.
        The exam authority has been notified.
      </p>

      <button
        onClick={onRestart}
        className="w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-900 transition-all duration-300 shadow-lg"
      >
        Return to Login
      </button>
    </div>
  </div>
);

// --- Security Status Badge ---
const SecurityBadge: React.FC<{ violationCount: number; maxViolations: number }> = ({ violationCount, maxViolations }) => (
  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${violationCount === 0
    ? 'bg-green-500 bg-opacity-20 text-green-200'
    : violationCount < maxViolations - 1
      ? 'bg-yellow-500 bg-opacity-20 text-yellow-200'
      : 'bg-red-500 bg-opacity-20 text-red-200 animate-pulse'
    }`}>
    <span className={`inline-block w-2 h-2 rounded-full ${violationCount === 0 ? 'bg-green-400' : violationCount < maxViolations - 1 ? 'bg-yellow-400' : 'bg-red-400'
      }`} />
    {violationCount === 0 ? `${String.fromCodePoint(0x1F512)} Secure` : `${String.fromCodePoint(0x26A0, 0xFE0F)} ${violationCount}/${maxViolations}`}
  </div>
);

const BrandSignature: React.FC = () => (
  <div className="w-full border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
    <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-3">
      <img
        src={BRAND_LOGO_URL}
        alt={`${BRAND_NAME} logo`}
        className="h-10 w-auto object-contain"
      />
      <span className="text-sm font-semibold tracking-wide text-slate-800">
        Made by brand {BRAND_NAME}
      </span>
    </div>
  </div>
);


// --- App Component ---
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
  const [questionInteractions, setQuestionInteractions] = useState<Record<string, QuestionInteraction>>({});
  const [totalOptionChanges, setTotalOptionChanges] = useState(0);
  const [submissionMeta, setSubmissionMeta] = useState<SubmissionMeta>(makeDefaultSubmissionMeta());
  const submitLockRef = useRef(false);

  const allQuestions = useMemo(() => examData.sections.flatMap(s => s.questions), [examData]);

  // Protections stay active during exam AND on the disqualified screen
  const isProtectionActive = gameState === GameState.Ongoing || gameState === GameState.Review || gameState === GameState.Disqualified;
  // Only count new violations during an active exam (not on disqualified screen)
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
            current.firstSelectedOptionIndex === null ? optionIndex : current.firstSelectedOptionIndex,
          finalSelectedOptionIndex: optionIndex,
          changeCount: current.changeCount + (hasDifferentPrevious ? 1 : 0),
          selectionHistory: [...current.selectionHistory, optionIndex],
        },
      };
    });
  }, []);

  const handleSubmitExam = useCallback(async (overrideMeta: Partial<SubmissionMeta> = {}) => {
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
            if (!selectedValue) {
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
    await exitFullScreenSafely();
  }, [allQuestions, answers, examData.sections, questionInteractions, sectionIds, sectionSessionIds, studentToken, totalOptionChanges]);

  const handleAutoSubmit = useCallback((context: { violationCount: number }) => {
    const remark = 'Exam terminated due to cheating.';
    void handleSubmitExam({
      terminatedDueToCheating: true,
      terminationRemark: remark,
      cheatingAttempts: context.violationCount,
    });
  }, [handleSubmitExam]);

  const antiCheat = useAntiCheat({
    enabled: isProtectionActive,
    trackViolations: isExamActive,
    maxViolations: 3,
    onAutoSubmit: handleAutoSubmit,
  });

  useEffect(() => {
    if (gameState === GameState.Ongoing && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && gameState === GameState.Ongoing) {
      if (autoSubmitAfterTime) {
        handleSubmitExam({ cheatingAttempts: antiCheat.violationCount });
      } else {
        setGameState(GameState.Finished);
      }
    }
  }, [antiCheat.violationCount, gameState, timeRemaining, handleSubmitExam, autoSubmitAfterTime]);

  useEffect(() => {
    // Poll for forceful exam end by admin
    if (gameState !== GameState.Ongoing || !studentToken) return;
    
    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const examConfig = await getStudentExamConfig(studentToken);
        if (isSubscribed && examConfig.forceEndedAt) {
           setExamForceEndedAt(examConfig.forceEndedAt);
           handleSubmitExam({ 
             terminationRemark: 'The exam was forcibly ended by the administrator.',
             cheatingAttempts: antiCheat.violationCount 
           });
        }
      } catch (e) {
        // Mute periodic network errors to not spam user if connection drops briefly
      }
    }, 25000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [gameState, studentToken, handleSubmitExam, antiCheat.violationCount]);

  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => setApiError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  const startExam = async () => {
    // Trigger full-screen FIRST, synchronously within the click handler to satisfy browser/mobile security policies
    antiCheat.enterFullScreen().catch(console.error);
    submitLockRef.current = false;

    const firstQuestionId = examData.sections[0].questions[0].id;
    setVisited([firstQuestionId]);
    setGameState(GameState.Ongoing);
  };

  const resetExam = async () => {
    // Reset anti-cheat state FIRST (clears all refs), then exit full-screen
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
    submitLockRef.current = false;
  };

  const handleLoginGateway = useCallback(async (studentName: string, rollNumber: string, organizationCode: string) => {
    setIsGateOpening(true);
    setApiError('');

    try {
      const session = await apiRequest<{ data: { token: string } }>('/api/auth/student/session', {
        method: 'POST',
        body: JSON.stringify({ loginId: rollNumber, password: studentName, organizationCode }),
      });

      const token = session.data.token;
      setStudentToken(token);

      const examConfig = await getStudentExamConfig(token);

      const now = new Date();
      const examStart = examConfig.startAt ? new Date(examConfig.startAt) : null;
      const examEnded = examConfig.forceEndedAt ? new Date(examConfig.forceEndedAt) : null;

      if (examStart && now < examStart) {
        throw new Error(`Exam access opens at ${examStart.toLocaleString()}. Please log in at the scheduled start time.`);
      }

      if (examEnded && now >= examEnded) {
        throw new Error('The scheduled exam period has ended. Please contact your administrator.');
      }

      setExamStartAt(examConfig.startAt || null);
      setExamForceEndedAt(examConfig.forceEndedAt || null);
      setAutoSubmitAfterTime(examConfig.autoSubmitAfterTime ?? true);

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
            }
          )
        )
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
      setCandidateName(studentName);
      setCandidateRollNumber(rollNumber);
      const flatQuestions = mappedSections.flatMap((section) => section.questions);
      setQuestionInteractions(buildInteractionMap(flatQuestions));
      setTotalOptionChanges(0);
      setSubmissionMeta(makeDefaultSubmissionMeta());
      submitLockRef.current = false;

      setTimeout(() => {
        setGameState(GameState.Instructions);
        setIsGateOpening(false);
      }, 2200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start exam session.';
      setApiError(message);
      setIsGateOpening(false);
    }
  }, [autoSubmitAfterTime, questionInteractions, sectionIds, sectionSessionIds, studentToken, totalOptionChanges]);

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
    switch (gameState) {
      case GameState.Login:
        return <LoginScreen onLogin={handleLoginGateway} isGateOpening={isGateOpening} />;
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
          />
        );
      case GameState.Review:
        return (
          <ReviewScreen
            answers={answers}
            markedForReview={markedForReview}
            visited={visited}
            onConfirmSubmit={() => handleSubmitExam({ cheatingAttempts: antiCheat.violationCount })}
            onGoBack={() => setGameState(GameState.Ongoing)}
            allQuestions={allQuestions}
            totalOptionChanges={totalOptionChanges}
            cheatingAttempts={antiCheat.violationCount}
          />
        );
      case GameState.Finished:
        return (
          <ResultScreen
            attempted={attemptedCount}
            total={allQuestions.length}
            onRestart={resetExam}
            submissionMeta={submissionMeta}
          />
        );
      case GameState.Disqualified:
        return (
          <DisqualifiedScreen
            violations={antiCheat.violations}
            onRestart={resetExam}
            submissionMeta={submissionMeta}
          />
        );
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-200">
      <BrandSignature />
      {apiError && (
        <div 
          className="fixed top-3 right-3 z-50 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg"
          style={{ animation: 'slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          {apiError}
        </div>
      )}
      {renderContent()}

      {/* Violation Warning Overlay */}
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

// --- LoginScreen â€” Professional White Glassmorphic ---
const LoginScreen: React.FC<{ onLogin: (studentName: string, rollNumber: string, organizationCode: string) => void; isGateOpening: boolean }> = ({ onLogin, isGateOpening }) => {
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [organizationCode, setOrganizationCode] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const isReady = studentName.trim().length >= 1 && rollNumber.trim().length >= 1 && organizationCode.trim().length >= 3;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady) return;
    onLogin(studentName.trim(), rollNumber.trim(), organizationCode.trim().toLowerCase());
  };

  return (
    <div className="login-page flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="bg-blob bg-blob-1" style={{ top: '-15%', left: '-10%' }} />
      <div className="bg-blob bg-blob-2" style={{ bottom: '-10%', right: '-8%' }} />
      <div className="bg-blob bg-blob-3" style={{ top: '40%', right: '20%' }} />

      {/* Dot pattern overlay */}
      <div className="dot-pattern" />

      {/* Sparkles scattered */}
      {[
        { top: '12%', left: '15%', delay: '0s', duration: '4s', color: '#818cf8', size: '14px' },
        { top: '25%', right: '12%', delay: '1.5s', duration: '3.5s', color: '#a78bfa', size: '12px' },
        { bottom: '20%', left: '20%', delay: '2.5s', duration: '5s', color: '#60a5fa', size: '16px' },
        { top: '60%', right: '25%', delay: '0.8s', duration: '4.5s', color: '#f472b6', size: '10px' },
        { top: '8%', left: '50%', delay: '3s', duration: '3s', color: '#34d399', size: '11px' },
      ].map((s, i) => (
        <div
          key={i}
          className="sparkle"
          style={{
            ...s,
            fontSize: s.size,
            color: s.color,
            '--sparkle-delay': s.delay,
            '--sparkle-duration': s.duration,
          } as React.CSSProperties & Record<'--sparkle-delay' | '--sparkle-duration', string>}
        />
      ))}

      {/* Main container â€” split layout */}
      <div
        className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
      >
        {/* LEFT SIDE â€” 3D Illustration */}
        <div
          className="flex-1 flex flex-col items-center justify-center relative"
          style={{ animation: 'slide-right 1s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          {/* Orbiting decorations around illustration */}
          <div className="relative" style={{ width: '380px', height: '380px' }}>
            {/* Soft glow behind illustration */}
            <div
              className="absolute rounded-full"
              style={{
                width: '300px', height: '300px',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08), transparent 70%)',
                animation: 'pulse-soft 4s ease-in-out infinite',
              }}
            />

            {/* 3D Student Illustration */}
            <div className="illustration-3d absolute inset-0 flex items-center justify-center">
              <img
                src="/student-3d.png"
                alt="Student studying at desk"
                className="w-80 h-80 object-contain"
                style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.12))' }}
              />
            </div>

            {/* Orbiting emojis */}
            <div className="orbit-element" style={{
              top: '50%', left: '50%',
              '--orbit-radius': '180px',
              '--orbit-duration': '25s',
            } as React.CSSProperties}>
              <span className="text-2xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{String.fromCodePoint(0x1F4DA)}</span>
            </div>
            <div className="orbit-element" style={{
              top: '50%', left: '50%',
              '--orbit-radius': '170px',
              '--orbit-duration': '20s',
              animationDelay: '-5s',
            } as React.CSSProperties}>
              <span className="text-xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{String.fromCodePoint(0x1F4BB)}</span>
            </div>
            <div className="orbit-element" style={{
              top: '50%', left: '50%',
              '--orbit-radius': '160px',
              '--orbit-duration': '30s',
              animationDelay: '-10s',
            } as React.CSSProperties}>
              <span className="text-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{String.fromCodePoint(0x1F393)}</span>
            </div>
            <div className="orbit-element" style={{
              top: '50%', left: '50%',
              '--orbit-radius': '190px',
              '--orbit-duration': '22s',
              animationDelay: '-15s',
            } as React.CSSProperties}>
              <span className="text-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{String.fromCodePoint(0x270F, 0xFE0F)}</span>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-4" style={{ animation: 'slide-up 0.8s ease 0.6s both' }}>
            <span className="feature-pill">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              AI-Proctored
            </span>
            <span className="feature-pill">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
              Encrypted
            </span>
            <span className="feature-pill">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
              Live Monitoring
            </span>
          </div>
        </div>

        {/* RIGHT SIDE â€” Login Card */}
        <div
          className="flex-1 w-full max-w-md"
          style={{ animation: 'slide-left 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both' }}
        >
          <div className="glass-card p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8" style={{ animation: 'fade-in 0.8s ease 0.5s both' }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
                }}
              >
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "'Poppins', sans-serif", color: '#1e293b' }}
              >
                Welcome Back
              </h1>
              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                Sign in to start your examination
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Name */}
              <div style={{ animation: 'slide-up 0.6s ease 0.6s both' }}>
                <label
                  htmlFor="studentName"
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: focused === 'studentName' ? '#4f46e5' : '#64748b', transition: 'color 0.3s' }}
                >
                  Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className={`w-5 h-5 transition-colors duration-300 ${focused === 'studentName' ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="studentName"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    onFocus={() => setFocused('studentName')}
                    onBlur={() => setFocused(null)}
                    placeholder="Enter your name"
                    className="glass-input"
                    required
                    autoComplete="off"
                  />
                  {studentName && (
                    <div style={{ animation: 'check-pop 0.4s ease forwards' }}>
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Roll Number */}
              <div style={{ animation: 'slide-up 0.6s ease 0.75s both' }}>
                <label
                  htmlFor="rollNumber"
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: focused === 'rollNumber' ? '#4f46e5' : '#64748b', transition: 'color 0.3s' }}
                >
                  Roll Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className={`w-5 h-5 transition-colors duration-300 ${focused === 'rollNumber' ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3M5 11h14M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="rollNumber"
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    onFocus={() => setFocused('rollNumber')}
                    onBlur={() => setFocused(null)}
                    placeholder="Enter your roll number"
                    className="glass-input"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div style={{ animation: 'slide-up 0.6s ease 0.82s both' }}>
                <label
                  htmlFor="organizationCode"
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: focused === 'organizationCode' ? '#4f46e5' : '#64748b', transition: 'color 0.3s' }}
                >
                  Organization Code
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className={`w-5 h-5 transition-colors duration-300 ${focused === 'organizationCode' ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 1.657-1.12 3-2.5 3S7 12.657 7 11s1.12-3 2.5-3 2.5 1.343 2.5 3zm4.5 0c0 1.657-1.12 3-2.5 3S11.5 12.657 11.5 11s1.12-3 2.5-3 2.5 1.343 2.5 3zM3 19h18" />
                    </svg>
                  </div>
                  <input
                    id="organizationCode"
                    type="text"
                    value={organizationCode}
                    onChange={(e) => setOrganizationCode(e.target.value)}
                    onFocus={() => setFocused('organizationCode')}
                    onBlur={() => setFocused(null)}
                    placeholder="Enter your organization code"
                    className="glass-input"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Submit */}
              <div style={{ animation: 'slide-up 0.6s ease 0.9s both' }}>
                <button
                  type="submit"
                  disabled={!isReady || isGateOpening}
                  className="glass-btn"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isGateOpening ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Entering Exam...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Start Exam
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6" style={{ animation: 'fade-in 1s ease 1s both' }}>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">Secured by CBT Engine</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 text-xs text-slate-400" style={{ animation: 'fade-in 1s ease 1.1s both' }}>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                256-bit SSL
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                GDPR
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                Proctored
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gate opening overlay */}
      {isGateOpening && (
        <>
          <div className={`gate-panel gate-left gate-opening`} />
          <div className={`gate-panel gate-right gate-opening`} />
        </>
      )}

      {/* Bottom branding */}
      <div className="absolute bottom-4 text-center z-10" style={{ animation: 'fade-in 1s ease 1.2s both' }}>
        <div className="flex items-center justify-center gap-2">
          <img src={BRAND_LOGO_URL} alt={`${BRAND_NAME} logo`} className="h-6 w-auto object-contain" />
          <p className="text-xs text-slate-500 tracking-wide">
            Made by {BRAND_NAME}
          </p>
        </div>
      </div>
    </div>
  );
};

const InstructionScreen: React.FC<{ onStart: () => void; examData: ExamData; examinerName: string }> = ({ onStart, examData, examinerName }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-800 mb-4 border-b pb-2">{examData.examTitle}</h1>
        <p className="text-sm text-slate-600 mb-4">Examiner: <strong>{examinerName}</strong></p>


        <h2 className="text-lg font-semibold text-gray-700 mb-4">General Instructions:</h2>
        <div className="text-sm text-gray-600 space-y-3 p-4 border rounded-md bg-gray-50 max-h-96 overflow-y-auto">
          <p>1. Total duration of this examination is <strong>{examData.durationInMinutes} minutes</strong>.</p>
          <p>2. The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You need not terminate the examination or submit your paper.</p>
          <p>3. The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><span className="inline-block align-middle h-5 w-5 rounded-sm bg-gray-300 mr-2"></span> You have not visited the question yet.</li>
            <li><span className="inline-block align-middle h-5 w-5 rounded-sm bg-red-500 mr-2"></span> You have not answered the question.</li>
            <li><span className="inline-block align-middle h-5 w-5 rounded-sm bg-green-500 mr-2"></span> You have answered the question.</li>
            <li><span className="inline-block align-middle h-5 w-5 rounded-sm bg-purple-500 mr-2"></span> You have NOT answered the question, but have marked the question for review.</li>
            <li><span className="inline-block align-middle h-5 w-5 rounded-sm bg-gradient-to-br from-green-500 to-purple-500 mr-2"></span> You have answered the question, but marked it for review.</li>
          </ul>
          <p>4. You can click on the `&gt;` arrow which appears to the left of question palette to collapse the question palette, thereby maximizing the question window.</p>
        </div>

        <div className="mt-6 p-4 border-t">
          <label className="flex items-center">
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="ml-3 text-sm text-gray-700">I have read and understood all the instructions.</span>
          </label>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onStart}
            disabled={!agreed}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Proceed to Exam (Full-Screen)
          </button>
        </div>
      </div>
    </div>
  );
};

interface ExamScreenProps {
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
}

const ExamScreen: React.FC<ExamScreenProps> = (props) => {
  const {
    examData,
    candidateName,
    candidateRollNumber,
    examinerName,
    answers, setAnswers, markedForReview, setMarkedForReview, timeRemaining,
    currentSectionIndex, setCurrentSectionIndex, currentQuestionIndex,
    setCurrentQuestionIndex, setGameState, visited, setVisited,
    onAnswerInteraction, onSaveProgress,
    violationCount, maxViolations
  } = props;

  const currentSection = examData.sections[currentSectionIndex];
  const currentQuestion = currentSection.questions[currentQuestionIndex];

  const handleOptionChange = (optionIndex: number) => {
    onAnswerInteraction(currentQuestion.id, optionIndex);
    const nextAnswers = { ...answers, [currentQuestion.id]: String(optionIndex) };
    setAnswers(nextAnswers);
    onSaveProgress(nextAnswers);
  };

  const handleClearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestion.id];
    setAnswers(newAnswers);
    onSaveProgress(newAnswers);
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev =>
      prev.includes(currentQuestion.id)
        ? prev.filter(id => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
    handleNext();
  };

  const goToQuestion = (sectionIdx: number, questionIdx: number) => {
    setCurrentSectionIndex(sectionIdx);
    setCurrentQuestionIndex(questionIdx);
    const questionId = examData.sections[sectionIdx].questions[questionIdx].id;
    if (!visited.includes(questionId)) {
      setVisited(prev => [...prev, questionId]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      goToQuestion(currentSectionIndex, currentQuestionIndex + 1);
    } else if (currentSectionIndex < examData.sections.length - 1) {
      goToQuestion(currentSectionIndex + 1, 0);
    }
  };

  const getQuestionStatus = (questionId: string): QuestionStatus => {
    const isAnswered = !!answers[questionId];
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

  const goToNextUnanswered = () => {
    const nextIndex = currentSection.questions.findIndex((question, index) => {
      if (index === currentQuestionIndex) return false;
      const status = getQuestionStatus(question.id);
      return status === QuestionStatus.NotAnswered || status === QuestionStatus.NotVisited;
    });

    if (nextIndex >= 0) {
      goToQuestion(currentSectionIndex, nextIndex);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100" style={{ userSelect: 'none' }}>
      <header className="bg-blue-800 text-white shadow-md px-3 py-2 md:px-4 md:py-3 flex flex-col gap-2 md:flex-row md:justify-between md:items-center z-10">
        <h1 className="text-sm sm:text-base md:text-lg font-bold md:ml-2 break-words">{examData.examTitle}</h1>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 md:mr-2">
          <SecurityBadge violationCount={violationCount} maxViolations={maxViolations} />
          <div className="flex items-center">
            <ClockIcon />
            <span className={`font-mono text-base md:text-lg font-semibold ${timeRemaining <= 300 ? 'text-red-300 animate-pulse' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-xs sm:text-sm font-semibold max-w-[60vw] truncate">{candidateName || 'Candidate'} ({candidateRollNumber || '-'})</span>
            <UserCircleIcon className="w-6 h-6 md:w-8 md:h-8 text-gray-300" />
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b pb-2 mb-4 bg-white p-2 rounded-t-md">
            <h2 className="text-sm sm:text-md font-bold text-blue-700 break-words">{currentSection.name}</h2>
            <span className="text-xs sm:text-sm font-semibold text-gray-600 break-words">Question Type: MCQ | Examiner: {examinerName}</span>
          </div>
          <div className="bg-white p-4 rounded-b-md shadow">
            <p className="font-bold mb-4">Question No. {currentQuestionIndex + 1}</p>
            <p className="text-gray-800 text-base mb-6">{currentQuestion.text}</p>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={String(index)}
                    checked={answers[currentQuestion.id] === String(index)}
                    onChange={() => handleOptionChange(index)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4 p-2 flex flex-wrap gap-2 border-t bg-gray-50 rounded-md">
            <button onClick={handleNext} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 shadow">Save & Next</button>
            <button onClick={handleMarkForReview} className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-600">Mark for Review & Next</button>
            <button onClick={handleClearResponse} className="bg-gray-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-gray-600">Clear Response</button>
            <button onClick={goToNextUnanswered} className="bg-amber-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-amber-600">Next Unanswered</button>
          </div>
        </div>
        <aside className="w-full md:w-72 lg:w-80 bg-white p-3 border-l shadow-lg">
          <div className="text-xs space-y-1 text-gray-600 border rounded-md p-2 mb-3 bg-blue-50">
            <div className="font-semibold text-blue-700">Section Progress</div>
            <div>Answered: <strong>{answeredCount}</strong></div>
            <div>Marked: <strong>{markedCount}</strong></div>
            <div>Not Answered: <strong>{notAnsweredCount}</strong></div>
            <div>Not Visited: <strong>{notVisitedCount}</strong></div>
          </div>
          <div className="flex mb-3 border-b">
            {examData.sections.map((section, index) => (
              <button
                key={section.name}
                onClick={() => goToQuestion(index, 0)}
                className={`flex-1 py-2 text-xs font-semibold focus:outline-none ${currentSectionIndex === index ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {section.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {currentSection.questions.map((q, index) => {
              const status = getQuestionStatus(q.id);
              let style = 'bg-gray-300 text-gray-700'; // Not Visited
              if (status === QuestionStatus.NotAnswered) style = 'bg-red-500 text-white';
              if (status === QuestionStatus.Answered) style = 'bg-green-500 text-white';
              if (status === QuestionStatus.Marked) style = 'bg-purple-500 text-white';
              if (status === QuestionStatus.AnsweredAndMarked) style = 'bg-gradient-to-br from-green-500 to-purple-500 text-white';

              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(currentSectionIndex, index)}
                  className={`h-8 w-8 flex items-center justify-center rounded-sm font-bold text-sm ${style} ${currentQuestionIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="text-xs space-y-1 text-gray-600 border-t pt-3">
            <div className="flex items-center"><span className="h-4 w-4 rounded-sm bg-green-500 mr-2"></span> Answered</div>
            <div className="flex items-center"><span className="h-4 w-4 rounded-sm bg-red-500 mr-2"></span> Not Answered</div>
            <div className="flex items-center"><span className="h-4 w-4 rounded-sm bg-purple-500 mr-2"></span> Marked for Review</div>
            <div className="flex items-center"><span className="h-4 w-4 rounded-sm bg-gray-300 mr-2"></span> Not Visited</div>
            <div className="flex items-center"><span className="h-4 w-4 rounded-sm bg-gradient-to-br from-green-500 to-purple-500 mr-2"></span> Answered & Marked</div>
          </div>
          <button onClick={() => setGameState(GameState.Review)} className="mt-4 w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 shadow">Submit</button>
        </aside>
      </main>
    </div>
  );
};

interface ReviewScreenProps {
  answers: Answers;
  markedForReview: string[];
  visited: string[];
  allQuestions: Question[];
  totalOptionChanges: number;
  cheatingAttempts: number;
  onConfirmSubmit: () => void;
  onGoBack: () => void;
}
const ReviewScreen: React.FC<ReviewScreenProps> = ({ answers, markedForReview, visited, allQuestions, totalOptionChanges, cheatingAttempts, onConfirmSubmit, onGoBack }) => {
  const answeredCount = Object.keys(answers).length;
  const notAnsweredCount = visited.filter(id => !answers[id]).length;
  const notVisitedCount = allQuestions.length - visited.length;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="p-8 bg-white rounded-md shadow-lg max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Exam Summary</h1>
        <div className="grid grid-cols-2 gap-4 text-md mb-8">
          <div className="p-4 bg-green-100 text-green-800 rounded">
            <p className="font-bold text-2xl">{answeredCount}</p>
            <p>Answered</p>
          </div>
          <div className="p-4 bg-red-100 text-red-800 rounded">
            <p className="font-bold text-2xl">{notAnsweredCount}</p>
            <p>Not Answered</p>
          </div>
          <div className="p-4 bg-purple-100 text-purple-800 rounded">
            <p className="font-bold text-2xl">{markedForReview.length}</p>
            <p>Marked for Review</p>
          </div>
          <div className="p-4 bg-gray-100 text-gray-800 rounded">
            <p className="font-bold text-2xl">{notVisitedCount}</p>
            <p>Not Visited</p>
          </div>
        </div>
        <p className="text-gray-600 mb-8">Are you sure you want to submit for final marking? No changes will be allowed after submission.</p>
        <div className="mb-6 p-3 rounded border border-slate-200 bg-slate-50 text-left text-sm text-slate-700 space-y-1">
          <p><strong>Cheating attempts detected:</strong> {cheatingAttempts}</p>
          <p><strong>Option changes:</strong> {totalOptionChanges}</p>
          <p className="text-xs text-slate-500">Marking will be based on final selected answers only.</p>
        </div>
        <div className="flex justify-center gap-4">
          <button onClick={onGoBack} className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded hover:bg-gray-400 transition-colors">No, Go Back</button>
          <button onClick={onConfirmSubmit} className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition-colors">Yes, Submit</button>
        </div>
      </div>
    </div>
  );
};


const ExamInsightsPanel: React.FC<{ submissionMeta: SubmissionMeta }> = ({ submissionMeta }) => {
  const touchedQuestions = submissionMeta.questionInteractions.filter((item) => item.selectionHistory.length > 0);
  const changedQuestions = touchedQuestions.filter((item) => item.changeCount > 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 mb-6 text-left">
      <h3 className="text-base font-bold text-slate-800 mb-4">Behavior Insights</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg bg-sky-50 border border-sky-100 p-3">
          <p className="text-xs text-sky-700 uppercase font-semibold">Cheating Attempts</p>
          <p className="text-xl font-bold text-sky-900">{submissionMeta.cheatingAttempts}</p>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
          <p className="text-xs text-amber-700 uppercase font-semibold">Option Changes</p>
          <p className="text-xl font-bold text-amber-900">{submissionMeta.totalOptionChanges}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
          <p className="text-xs text-emerald-700 uppercase font-semibold">Questions Touched</p>
          <p className="text-xl font-bold text-emerald-900">{touchedQuestions.length}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-4 bg-slate-100 text-xs font-semibold text-slate-700">
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
            <div key={item.questionId} className="grid grid-cols-1 sm:grid-cols-4 border-t border-slate-100 text-sm">
              <div className="p-2 font-mono text-xs text-slate-600">{item.questionId}</div>
              <div className="p-2 text-slate-700">{item.firstSelectedOptionIndex === null ? '-' : item.firstSelectedOptionIndex + 1}</div>
              <div className="p-2 text-slate-700">{item.finalSelectedOptionIndex === null ? '-' : item.finalSelectedOptionIndex + 1}</div>
              <div className="p-2 text-slate-700">
                <span className={item.changeCount > 0 ? 'text-amber-700 font-semibold' : ''}>{item.changeCount}</span>
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


const ResultScreen: React.FC<{ attempted: number, total: number, onRestart: () => void, submissionMeta: SubmissionMeta }> = ({ attempted, total, onRestart, submissionMeta }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-200">
    <div className="p-6 sm:p-10 bg-white rounded-md shadow-lg text-center max-w-3xl w-full mx-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Exam Submitted Successfully!</h1>
      <p className="text-gray-600 mb-6">Thank you!</p>

      <div className="my-8">
        <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800">Submission Status</h2>
          <p className="text-sm text-gray-700 mt-2">Attempted Questions: <strong>{attempted}</strong> / {total}</p>
          <p className="text-sm text-gray-700 mt-1">Your score is visible to admin only.</p>
        </div>
      </div>

      <ExamInsightsPanel submissionMeta={submissionMeta} />

      <button
        onClick={onRestart}
        className="w-full bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-blue-300 transition-all duration-300"
      >
        Logout
      </button>
    </div>
  </div>
);

export default App;
