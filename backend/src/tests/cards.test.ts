import request from "supertest";
import { app } from "../server";
import { getBuckets, setBuckets, findCard, findCardBucket } from "../state";
import { Flashcard } from "../logic/flashcards";

describe("POST /api/cards", () => {
  beforeEach(() => {
    // Reset buckets to empty before each test
    setBuckets(new Map([[0, new Set()]]));
  });

  afterEach(() => {
    setBuckets(new Map([[0, new Set()]]));
  });

  function getAllFlashcards(): any[] {
    // Helper to get all flashcards from all buckets
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

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.front).toBe(newCard.front);
    expect(res.body.back).toBe(newCard.back);
    expect(res.body.hint).toBe(newCard.hint);
    expect(res.body.tags).toEqual(newCard.tags);

    const cards = getAllFlashcards();
    expect(cards.length).toBe(1);
    expect(cards[0].front).toBe(newCard.front);
    expect(cards[0].back).toBe(newCard.back);
    expect(cards[0].hint).toBe(newCard.hint);
    expect(cards[0].tags).toEqual(newCard.tags);
  });
});
