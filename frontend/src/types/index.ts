// Flashcard structure matching backend (with optional hint)
export interface Flashcard {
  front: string;
  back: string;
  hint?: string;
  tags: string[];
}

// Enum representing user's answer difficulty level
export enum AnswerDifficulty {
  Wrong = 0,
  Hard = 1,
  Easy = 2,
}

// Response from GET /api/practice
export interface PracticeSession {
  cards: Flashcard[];
  day: number;
}

// Request body for POST /api/update
export interface UpdateRequest {
  cardFront: string;
  cardBack: string;
  difficulty: AnswerDifficulty;
}

// Learning progress stats from GET /api/progress
export interface ProgressStats {
  totalCards: number;
  cardsInBuckets: Record<number, number>;
  successRate: number;
}
