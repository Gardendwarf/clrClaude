// -- clrClaude Type Definitions --

export interface Module {
  id: string;
  number: number;
  title: string;
  slug: string;
  description: string;
  estimatedMinutes: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  contentPath: string;
  order: number;
}

export interface UserProgress {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt: string | null;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  lessonId: string;
  score: number;
  totalQuestions: number;
  answers: number[];
  attemptedAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}
