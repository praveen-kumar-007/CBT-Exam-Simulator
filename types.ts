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

export enum GameState {
  Login,
  Instructions,
  Ongoing,
  Review,
  Finished,
}

export enum QuestionStatus {
  Answered,
  NotAnswered,
  Marked,
  AnsweredAndMarked,
  NotVisited,
}
