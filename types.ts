export interface Question {
  id: string;
  text: string;
  options: string[];
  answer: string;
}

export interface Section {
  name: string;
  questions: Question[];
}

export interface ExamData {
  examTitle: string;
  durationInMinutes: number;
  sections: Section[];
}

export type Answers = Record<string, string>;

export interface QuestionInteraction {
  questionId: string;
  firstSelectedOptionIndex: number | null;
  finalSelectedOptionIndex: number | null;
  changeCount: number;
  selectionHistory: number[];
}

export interface ExamAnalytics {
  totalOptionChanges: number;
  totalQuestionsTouched: number;
  interactions: Record<string, QuestionInteraction>;
}

export interface SecurityEventEntry {
  type: string;
  message: string;
  timestamp: string;
}

export interface SubmissionMeta {
  terminatedDueToCheating: boolean;
  terminationRemark: string;
  cheatingAttempts: number;
  totalOptionChanges: number;
  questionInteractions: QuestionInteraction[];
  securityEvents?: SecurityEventEntry[];
}

export enum GameState {
  Login,
  Instructions,
  Ongoing,
  Review,
  Finished,
  Disqualified,
}

export enum QuestionStatus {
  Answered,
  NotAnswered,
  Marked,
  AnsweredAndMarked,
  NotVisited,
}
