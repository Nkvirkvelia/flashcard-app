/**
 * Problem Set 1: Flashcards - Algorithm Functions
 *
 * This file contains the implementations for the flashcard algorithm functions
 * as described in the problem set handout.
 *
 * Please DO NOT modify the signatures of the exported functions in this file,
 * or you risk failing the autograder.
 */

import { Flashcard, AnswerDifficulty, BucketMap } from "./flashcards";
import { PracticeRecord, ProgressStats } from "../types";

/**
 * Transforms a BucketMap into an array representation where each index corresponds to a bucket.
 *
 * @param buckets Map where keys are bucket numbers and values are sets of Flashcards.
 * @returns Array of Sets, where element at index i is the set of flashcards in bucket i.
 *          Buckets with no cards will have empty sets in the array.
 * @spec.requires buckets is a valid representation of flashcard buckets.
 */
export function toBucketSets(buckets: BucketMap): Array<Set<Flashcard>> {
  if (buckets.size === 0) {
    return []; // Returns empty array immediately if there are no buckets
  }

  let highestBucket = 0;

  //Determining the maximum bucket number
  for (const bucketNum of buckets.keys()) {
    if (bucketNum > highestBucket) {
      highestBucket = bucketNum;
    }
  }

  // Initializing an array with emply sets
  const bucketArray: Array<Set<Flashcard>> = [];
  for (let i = 0; i <= highestBucket; i++) {
    bucketArray.push(new Set<Flashcard>());
  }

  //Populating the array with flashcards from map
  for (const [bucketNum, flashcardSet] of buckets.entries()) {
    bucketArray[bucketNum] = flashcardSet;
  }

  return bucketArray;
}

/**
 * Finds the range of buckets that contain flashcards, as a rough measure of progress.
 *
 * @param buckets Array-of-Set representation of buckets.
 * @returns object with minBucket and maxBucket properties representing the range,
 *          or undefined if no buckets contain cards.
 * @spec.requires buckets is a valid Array-of-Set representation of flashcard buckets.
 */
export function getBucketRange(
  buckets: Array<Set<Flashcard>>
): { minBucket: number; maxBucket: number } | undefined {
  let minBucket: number | undefined = undefined;
  let maxBucket: number | undefined = undefined;

  for (let i = 0; i < buckets.length; i++) {
    const bucket = buckets[i];
    if (bucket && bucket.size > 0) {
      if (minBucket === undefined || i < minBucket) {
        minBucket = i;
      }
      if (maxBucket === undefined || i > maxBucket) {
        maxBucket = i;
      }
    }
  }

  return minBucket !== undefined && maxBucket !== undefined
    ? { minBucket, maxBucket }
    : undefined;
}

/**
 * Selects cards to practice on a particular day.
 *
 * @param buckets Array-of-Set representation of buckets.
 * @param day current day number (starting from 0).
 * @returns a Set of Flashcards that should be practiced on day `day`,
 *          according to the Modified-Leitner algorithm.
 * @spec.requires buckets is a valid Array-of-Set representation of flashcard buckets.
 */
export function practice(
  buckets: Array<Set<Flashcard>>,
  day: number
): Set<Flashcard> {
  const result = new Set<Flashcard>();

  // Always practice cards from bucket 0
  if (buckets[0]) {
    for (const card of buckets[0]) {
      result.add(card);
    }
  }

  // For other buckets, practice on days divisible by 2^(bucket number)
  for (let bucketNum = 1; bucketNum < buckets.length; bucketNum++) {
    const interval = Math.pow(2, bucketNum);

    // Explicitly checking for undefined and assert the bucket exists
    if (buckets[bucketNum] && day % interval === 0) {
      // Here we assert the bucket is defined to avoid TypeScript error
      const currentBucket = buckets[bucketNum] as Set<Flashcard>;
      for (const card of currentBucket) {
        result.add(card);
      }
    }
  }

  return result;
}

/**
 * Updates a card's bucket number after a practice trial.
 *
 * @param buckets Map representation of learning buckets.
 * @param card flashcard that was practiced.
 * @param difficulty how well the user did on the card in this practice trial.
 * @returns updated Map of learning buckets.
 * @spec.requires buckets is a valid representation of flashcard buckets.
 */
export function update(
  buckets: BucketMap,
  card: Flashcard,
  difficulty: AnswerDifficulty
): BucketMap {
  const newBuckets = new Map<number, Set<Flashcard>>();
  let currentBucket = -1;

  // Iterating through the buckets and checking where the card is currently located
  for (const [bucketNum, cards] of buckets.entries()) {
    const newSet = new Set<Flashcard>(cards);
    newBuckets.set(bucketNum, newSet);

    if (cards.has(card)) {
      currentBucket = bucketNum;
    }
  }

  // If the card wasn't found in any bucket, we add it to bucket 0
  if (currentBucket === -1) {
    if (!newBuckets.has(0)) {
      newBuckets.set(0, new Set<Flashcard>());
    }
    currentBucket = 0; // Set to bucket 0 if not found
  }

  // Remove the card from the current bucket
  const currentSet = newBuckets.get(currentBucket)!;
  currentSet.delete(card);

  // Determine the new bucket based on difficulty
  let newBucket: number;
  if (difficulty === AnswerDifficulty.Wrong) {
    newBucket = 0; // If answered incorrectly, move to bucket 0
  } else if (difficulty === AnswerDifficulty.Hard) {
    newBucket = currentBucket; // If answered hard, stay in the same bucket
  } else {
    newBucket = Math.min(currentBucket + 1, 4); // If answered easily, move to next bucket (max 4)
  }

  // Ensure the new bucket exists
  if (!newBuckets.has(newBucket)) {
    newBuckets.set(newBucket, new Set<Flashcard>());
  }

  // Add the card to the new bucket
  newBuckets.get(newBucket)!.add(card);

  // Debugging logs to check bucket contents after the update
  console.log("Card moved to bucket:", newBucket);
  console.log("Buckets after update:", [...newBuckets.entries()]);

  return newBuckets;
}

/**
 * Generates a hint for a flashcard.
 *
 * @param card flashcard to hint
 * @returns a hint for the front of the flashcard.
 * @spec.requires card is a valid Flashcard.
 */
export function getHint(card: Flashcard): string {
  if (card.hint === undefined || card.hint === null) {
    throw new Error("Invalid flashcard or missing hint");
  }

  return card.hint; // Return the hint, even if it's an empty string
}

/**
 * Computes statistics about the user's learning progress.
 *
 * @param buckets representation of learning buckets.
 * @param history representation of user's answer history.
 * @returns statistics about learning progress.
 * @spec.requires [SPEC TO BE DEFINED]
 */
export function computeProgress(
  buckets: BucketMap,
  history: PracticeRecord[]
): ProgressStats {
  // Collect all flashcards from all buckets into a Set
  const allCards = new Set<Flashcard>();
  const cardsInBuckets: Record<number, number> = {};
  let totalCards = 0;

  for (const [bucketId, cardSet] of buckets.entries()) {
    cardsInBuckets[bucketId] = cardSet.size;
    totalCards += cardSet.size;
    for (const card of cardSet) {
      allCards.add(card);
    }
  }

  // Validate precondition
  for (const record of history) {
    if (!allCards.has(record.card)) {
      throw new Error("PracticeRecord card not found in any bucket.");
    }
  }

  let weightedCorrect = 0;
  let weightedTotal = 0;

  for (const { isCorrect, difficulty } of history) {
    const weight =
      difficulty === AnswerDifficulty.Easy
        ? 1
        : difficulty === AnswerDifficulty.Hard
        ? 2
        : 0; // Wrong
    if (difficulty !== AnswerDifficulty.Wrong) {
      weightedTotal += weight;
      if (isCorrect) {
        weightedCorrect += weight;
      }
    }
  }

  const successRate =
    weightedTotal === 0
      ? 0
      : parseFloat((weightedCorrect / weightedTotal).toFixed(2));

  return {
    totalCards,
    cardsInBuckets,
    successRate,
  };
}
