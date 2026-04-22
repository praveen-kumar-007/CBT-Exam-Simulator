import { examData as defaultExamData } from "../../data/questions";
import { Question, QuestionInteraction, SubmissionMeta } from "../../types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);

type StudentExamConfigResponse = {
  data: {
    durationInMinutes: number;
    officialEntryWindowInMinutes?: number;
    sectionReentryWindowInMinutes?: number;
    examinerName?: string;
    startAt?: string | null;
    forceEndedAt?: string | null;
    autoSubmitAfterTime?: boolean;
    calculatorEnabled?: boolean;
    activeCalculatorType?: string | null;
  };
};

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload as T;
};

export const getStudentExamConfig = async (token: string) => {
  try {
    const config = await apiRequest<StudentExamConfigResponse>(
      "/api/student/exam-config",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const durationValue = Number(config?.data?.durationInMinutes);
    const safeDuration =
      Number.isInteger(durationValue) && durationValue > 0
        ? durationValue
        : defaultExamData.durationInMinutes;

    return {
      durationInMinutes: safeDuration,
      examinerName: config?.data?.examinerName || "CBT Examination Cell",
      startAt: config?.data?.startAt || null,
      forceEndedAt: config?.data?.forceEndedAt || null,
      autoSubmitAfterTime:
        typeof config?.data?.autoSubmitAfterTime === "boolean"
          ? config.data.autoSubmitAfterTime
          : true,
      calculatorEnabled:
        typeof config?.data?.calculatorEnabled === "boolean"
          ? config.data.calculatorEnabled
          : false,
      activeCalculatorType:
        typeof config?.data?.activeCalculatorType === "string" &&
        config.data.activeCalculatorType
          ? config.data.activeCalculatorType
          : null,
    };
  } catch (error) {
    console.warn(
      "Exam config fetch failed, falling back to default duration.",
      error,
    );
  }

  return {
    durationInMinutes: defaultExamData.durationInMinutes,
    examinerName: "CBT Examination Cell",
    startAt: null,
    forceEndedAt: null,
    autoSubmitAfterTime: true,
    calculatorEnabled: false,
    activeCalculatorType: null,
  };
};

export const makeDefaultSubmissionMeta = (): SubmissionMeta => ({
  terminatedDueToCheating: false,
  terminationRemark: "",
  cheatingAttempts: 0,
  totalOptionChanges: 0,
  questionInteractions: [],
  securityEvents: [],
});

export const buildInteractionMap = (
  questions: Question[],
): Record<string, QuestionInteraction> => {
  return questions.reduce<Record<string, QuestionInteraction>>(
    (acc, question) => {
      acc[question.id] = {
        questionId: question.id,
        firstSelectedOptionIndex: null,
        finalSelectedOptionIndex: null,
        changeCount: 0,
        selectionHistory: [],
      };
      return acc;
    },
    {},
  );
};

export const exitFullScreenSafely = async () => {
  try {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
    }
  } catch (error) {
    console.warn("Failed to exit full-screen:", error);
  }
};
