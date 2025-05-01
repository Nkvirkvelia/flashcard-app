/**
 * @file state.ts
 * @description Manages in-memory application state for flashcard buckets,
 *              user practice history, and current day tracking.
 *
 * This module defines and manages:
 * - Initial flashcard setup (bucket 0)
 * - Getter and setter functions for state access
 * - Utility functions to find cards and determine their bucket
 *
 * This is in-memory only. State will reset when the server restarts.
 */

import { Flashcard, BucketMap, AnswerDifficulty } from "./logic/flashcards";
import { PracticeRecord } from "./types/index";

// --- Initial Cards ---
// Predefined flashcards added to bucket 0 on app start
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
// Buckets store flashcards grouped by review frequency
let currentBuckets: BucketMap = new Map();
currentBuckets.set(0, new Set(initialCards));

// List of past practice sessions
let practiceHistory: PracticeRecord[] = [];

// Tracks the current simulated day in the app
let currentDay: number = 0;

// --- Accessors & Mutators ---
// Provides access to the current flashcard buckets
export function getBuckets(): BucketMap {
  return currentBuckets;
}

// Replaces the current bucket state
export function setBuckets(newBuckets: BucketMap): void {
  currentBuckets = newBuckets;
}

// Returns full practice history
export function getHistory(): PracticeRecord[] {
  return practiceHistory;
}

// Adds a new record to the history
export function addHistoryRecord(record: PracticeRecord): void {
  practiceHistory.push(record);
}

// Returns the current day value
export function getCurrentDay(): number {
  return currentDay;
}

// Advances the current day by 1
export function incrementDay(): void {
  currentDay += 1;
}

// --- Helpers ---
// Looks for a card by front and back content
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

// Finds which bucket a given card is currently in
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
