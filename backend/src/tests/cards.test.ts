/**
 * @file cards.test.ts
 * @description This file contains integration tests for the POST /api/cards endpoint of the flashcard web app.
 *              The tests verify the creation and validation of flashcards, including optional and required fields.
 *              It uses the Supertest library to simulate HTTP requests and interacts with a simple in-memory
 *              flashcard state organized into "buckets".
 *
 * Technologies Used:
 * - Supertest for API endpoint testing
 * - Jest for test organization and assertions
 *
 * Assumptions:
 * - Flashcards must have 'front' and 'back' fields.
 * - 'hint' and 'tags' are optional.
 * - All new cards are placed in bucket 0 by default.
 *
 */

import request from "supertest";
import { app } from "../server";
import { getBuckets, setBuckets } from "../state";

describe("POST /api/cards", () => {
  beforeEach(() => {
    // Reset buckets to empty state before each test
    setBuckets(new Map([[0, new Set()]]));
  });

  afterEach(() => {
    // Clean up after each test by resetting buckets
    setBuckets(new Map([[0, new Set()]]));
  });

  /**
   * Utility function to get all flashcards across all buckets.
   */
  function getAllFlashcards(): any[] {
    const buckets = getBuckets();
    const allCards: any[] = [];
    for (const cardSet of buckets.values()) {
      for (const card of cardSet) {
        allCards.push(card);
      }
    }
    return allCards;
  }

  it("adds new card to state with correct fields (front, back, hint, tags)", async () => {
    const newCard = {
      front: "What is the capital of France?",
      back: "Paris",
      hint: "City of Light",
      tags: ["geography", "europe"],
    };

    const res = await request(app).post("/api/cards").send(newCard);

    expect(res.status).toBe(201); // Check for successful creation
    expect(res.body.card).toHaveProperty("id");
    expect(res.body.card.front).toBe(newCard.front);
    expect(res.body.card.back).toBe(newCard.back);
    expect(res.body.card.hint).toBe(newCard.hint);
    expect(res.body.card.tags).toEqual(newCard.tags);

    const cards = getAllFlashcards();
    expect(cards.length).toBe(1); // Ensure only one card was added
    expect(cards[0].front).toBe(newCard.front);
    expect(cards[0].back).toBe(newCard.back);
    expect(cards[0].hint).toBe(newCard.hint);
    expect(cards[0].tags).toEqual(newCard.tags);
  });

  it("adds new card to bucket 0", async () => {
    const newCard = {
      front: "Define photosynthesis",
      back: "Process by which plants make food",
    };

    const res = await request(app).post("/api/cards").send(newCard);

    expect(res.status).toBe(201);

    const buckets = getBuckets();
    const bucket0 = buckets.get(0);
    expect(bucket0).toBeDefined();
    expect([...bucket0!].some((card) => card.front === newCard.front)).toBe(
      true
    );
  });

  it("returns 400 if required field 'front' is missing", async () => {
    const invalidCard = {
      back: "Something",
    };

    const res = await request(app).post("/api/cards").send(invalidCard);

    expect(res.status).toBe(400); // Validation should fail
    expect(res.body).toHaveProperty("message");
  });

  it("returns 400 if required field 'back' is missing", async () => {
    const invalidCard = {
      front: "Something",
    };

    const res = await request(app).post("/api/cards").send(invalidCard);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("handles optional field 'hint' correctly when missing", async () => {
    const newCard = {
      front: "What is H2O?",
      back: "Water",
      tags: ["science"],
    };

    const res = await request(app).post("/api/cards").send(newCard);

    expect(res.status).toBe(201);
    expect(res.body.card.hint).toBeUndefined(); // Should not crash if hint is missing

    const cards = getAllFlashcards();
    expect(cards[0].hint).toBeUndefined();
  });

  it("handles optional field 'tags' correctly when missing", async () => {
    const newCard = {
      front: "When did WW2 end?",
      back: "1945",
      hint: "Mid 20th century",
    };

    const res = await request(app).post("/api/cards").send(newCard);

    expect(res.status).toBe(201);
    expect(res.body.card.tags).toEqual([]); // Default value

    const cards = getAllFlashcards();
    expect(cards[0].tags).toEqual([]);
  });

  it("handles optional fields 'hint' and 'tags' correctly when both are present", async () => {
    const newCard = {
      front: "Who wrote Hamlet?",
      back: "Shakespeare",
      hint: "Famous playwright",
      tags: ["literature", "plays"],
    };

    const res = await request(app).post("/api/cards").send(newCard);

    expect(res.status).toBe(201);
    expect(res.body.card.hint).toBe(newCard.hint);
    expect(res.body.card.tags).toEqual(newCard.tags);

    const cards = getAllFlashcards();
    expect(cards[0].hint).toBe(newCard.hint);
    expect(cards[0].tags).toEqual(newCard.tags);
  });

  it("returns 201 status and correct success response body on success", async () => {
    const newCard = {
      front: "What is 2 + 2?",
      back: "4",
    };

    const res = await request(app).post("/api/cards").send(newCard);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("card");
    expect(res.body.card).toHaveProperty("id");
    expect(res.body.card.front).toBe(newCard.front);
    expect(res.body.card.back).toBe(newCard.back);
    expect(res.body.card.bucket).toBe(0); // Default bucket
  });

  it("returns 500 on internal server error", async () => {
    const originalSetBuckets = setBuckets;

    // Temporarily override setBuckets to simulate an error
    (setBuckets as any) = jest.fn(() => {
      throw new Error("Simulated failure");
    });

    const newCard = {
      front: "Test error",
      back: "Test",
    };

    const res = await request(app).post("/api/cards").send(newCard);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message");

    // Restore original function
    (setBuckets as any) = originalSetBuckets;
  });
});
