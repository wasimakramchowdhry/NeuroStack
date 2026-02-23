import { fetchApi } from './api';
import type { Difficulty } from './topicApi';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type QuestionType = 'mcq' | 'code_completion' | 'short_answer' | 'architecture' | 'scenario_analysis';

export interface Quiz {
  id: string;
  topic_id: string;
  title: string;
  difficulty: Difficulty;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  type: QuestionType;
  content_json: Record<string, any>;
  correct_answer: any;
  difficulty: number;
  explanation: string | null;
  order: number;
}

export interface QuestionCreate {
  type: QuestionType;
  content_json: Record<string, any>;
  correct_answer: any;
  difficulty: number;
  explanation?: string | null;
  order: number;
}

export interface QuizDetail extends Quiz {
  questions: Question[];
}

export interface QuizLearnerItem {
  id: string;
  topic_id: string;
  title: string;
  difficulty: Difficulty;
  question_count: number;
}

// Learner question (no correct_answer or explanation)
export interface LearnerQuestion {
  id: string;
  quiz_id: string;
  type: QuestionType;
  content_json: Record<string, any>;
  difficulty: number;
  order: number;
}

export interface QuizAttemptStart {
  attempt_id: string;
  quiz_title: string;
  questions: LearnerQuestion[];
}

export interface AnswerSubmission {
  question_id: string;
  user_answer: any;
}

export interface QuestionResult {
  question_id: string;
  user_answer: any;
  correct_answer: any;
  is_correct: boolean;
  explanation: string | null;
  ai_feedback: string | null;
}

export interface QuizResult {
  attempt_id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  correct_count: number;
  started_at: string;
  completed_at: string;
  results: QuestionResult[];
}

export interface GeneratedQuestion {
  type: QuestionType;
  content_json: Record<string, any>;
  correct_answer: any;
  difficulty: number;
  explanation?: string | null;
}

export interface GenerateResponse {
  topic_id: string;
  generated_questions: GeneratedQuestion[];
}

export interface QuizCreate {
  topic_id: string;
  title: string;
  difficulty: Difficulty;
  is_published?: boolean;
}

export interface QuizUpdate {
  title?: string;
  difficulty?: Difficulty;
  is_published?: boolean;
}

// ──────────────────────────────────────────────
// API
// ──────────────────────────────────────────────

export const quizAPI = {
  // ── Admin Endpoints ──

  async createQuiz(data: QuizCreate): Promise<Quiz> {
    return await fetchApi('/quiz/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getQuiz(quizId: string): Promise<QuizDetail> {
    return await fetchApi(`/quiz/${quizId}`);
  },

  async updateQuiz(quizId: string, data: QuizUpdate): Promise<Quiz> {
    return await fetchApi(`/quiz/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteQuiz(quizId: string): Promise<void> {
    await fetchApi(`/quiz/${quizId}`, {
      method: 'DELETE',
    });
  },

  async setQuizQuestions(quizId: string, questions: QuestionCreate[]): Promise<Question[]> {
    return await fetchApi(`/quiz/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify(questions),
    });
  },

  async generateQuestions(topicId: string, numMcq = 3, numShortAnswer = 1): Promise<GenerateResponse> {
    return await fetchApi(`/quiz/generate/${topicId}`, {
      method: 'POST',
      body: JSON.stringify({ num_mcq: numMcq, num_short_answer: numShortAnswer }),
    });
  },

  // ── Learner Endpoints ──

  async listQuizzesForTopic(topicId: string): Promise<QuizLearnerItem[]> {
    return await fetchApi(`/quiz/topic/${topicId}`);
  },

  async startQuiz(quizId: string): Promise<QuizAttemptStart> {
    return await fetchApi(`/quiz/${quizId}/start`, {
      method: 'POST',
    });
  },

  async submitQuiz(attemptId: string, answers: AnswerSubmission[]): Promise<QuizResult> {
    return await fetchApi(`/quiz/attempt/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
};
