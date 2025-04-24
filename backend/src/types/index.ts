// Import core types from the logic module
import { Flashcard, AnswerDifficulty, BucketMap } from "@logic/flashcards";

// Interface for a practice session
export interface PracticeSession {
  cards: Flashcard[];
  day: number;
}

// Request type for updating a flashcard with new difficulty feedback
export interface UpdateRequest {
  cardFront: string;
  cardBack: string;
  difficulty: AnswerDifficulty;
}

// Request type for asking a hint (can be based on query params later)
export interface HintRequest {
  cardFront: string;
  cardBack: string;
}

// Practice record used in progress tracking
export interface PracticeRecord {
  cardFront: string;
  cardBack: string;
  timestamp: number;
  difficulty: AnswerDifficulty;
  previousBucket: number;
  newBucket: number;
}

// Learning progress stats returned by computeProgress
export interface ProgressStats {
  totalCards: number;
  cardsInBuckets: Record<number, number>;
  successRate: number;
}

// Re-export imported logic types for use in other parts of the app
export type { Flashcard, AnswerDifficulty, BucketMap };
