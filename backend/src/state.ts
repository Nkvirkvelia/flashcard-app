import { Flashcard, BucketMap, AnswerDifficulty } from "./logic/flashcards";
import { PracticeRecord } from "./types/index";

// --- Initial Cards ---
const initialCards: Flashcard[] = [
  new Flashcard("What is the capital of France?", "Paris", "European city", [
    "geography",
  ]),
  new Flashcard("2 + 2", "4", "Simple math", ["math"]),
  new Flashcard(
    "Who wrote Hamlet?",
    "William Shakespeare",
    "Famous playwright",
    ["literature"]
  ),
  new Flashcard(
    "Water freezes at what temperature (°C)?",
    "0",
    "Science fact",
    ["science"]
  ),
];

// --- State Variables ---
let currentBuckets: BucketMap = new Map();
currentBuckets.set(0, new Set(initialCards));

let practiceHistory: PracticeRecord[] = [];

let currentDay: number = 0;

// --- Accessors & Mutators ---
export function getBuckets(): BucketMap {
  return currentBuckets;
}

export function setBuckets(newBuckets: BucketMap): void {
  currentBuckets = newBuckets;
}

export function getHistory(): PracticeRecord[] {
  return practiceHistory;
}

export function addHistoryRecord(record: PracticeRecord): void {
  practiceHistory.push(record);
}

export function getCurrentDay(): number {
  return currentDay;
}

export function incrementDay(): void {
  currentDay += 1;
}

// --- Helpers ---
export function findCard(front: string, back: string): Flashcard | undefined {
  for (const cardSet of currentBuckets.values()) {
    for (const card of cardSet) {
      if (card.front === front && card.back === back) {
        return card;
      }
    }
  }
  return undefined;
}

export function findCardBucket(cardToFind: Flashcard): number | undefined {
  for (const [bucketNumber, cardSet] of currentBuckets.entries()) {
    if (cardSet.has(cardToFind)) {
      return bucketNumber;
    }
  }
  return undefined;
}

// --- Confirm Initial State ---
console.log(
  "✅ In-memory state initialized with",
  initialCards.length,
  "cards."
);
