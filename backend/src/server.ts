import express, { Request, Response } from "express";
import cors from "cors";
import * as logic from "./logic/algorithm";
import { Flashcard, AnswerDifficulty } from "./logic/flashcards";
import * as state from "./state";
import { UpdateRequest, ProgressStats, PracticeRecord } from "./types";

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---

// GET /api/practice
app.get("/api/practice", (req: Request, res: Response) => {
  try {
    const day = state.getCurrentDay();
    const bucketsMap = state.getBuckets();
    const bucketSets = logic.toBucketSets(bucketsMap);
    const cardsToPracticeSet = logic.practice(bucketSets, day);
    const cardsToPracticeArray = Array.from(cardsToPracticeSet);

    console.log(`Day ${day}: Practice ${cardsToPracticeArray.length} cards`);
    res.json({ cards: cardsToPracticeArray, day });
  } catch (error) {
    console.error("Error getting practice cards:", error);
    res.status(500).json({ message: "Error fetching practice cards" });
  }
});

// POST /api/update
app.post("/api/update", (req: Request, res: Response) => {
  try {
    const { cardFront, cardBack, difficulty } = req.body as UpdateRequest;

    if (!(difficulty in AnswerDifficulty)) {
      return res.status(400).json({ message: "Invalid difficulty level" });
    }

    const card = state.findCard(cardFront, cardBack);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const currentBuckets = state.getBuckets();
    const previousBucket = state.findCardBucket(card);

    const updatedBuckets = logic.update(currentBuckets, card, difficulty);
    state.setBuckets(updatedBuckets);

    const newBucket = state.findCardBucket(card);
    const historyRecord: PracticeRecord = {
      cardFront: card.front,
      cardBack: card.back,
      timestamp: Date.now(),
      difficulty,
      previousBucket: previousBucket ?? -1,
      newBucket: newBucket ?? -1,
    };
    state.addHistoryRecord(historyRecord);

    console.log(
      `Updated card "${card.front}": Difficulty ${AnswerDifficulty[difficulty]}, New Bucket ${newBucket}`
    );
    res.status(200).json({ message: "Card updated successfully" });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ message: "Error updating card" });
  }
});

// GET /api/hint
app.get("/api/hint", (req: Request, res: Response) => {
  try {
    const { cardFront, cardBack } = req.query;

    if (typeof cardFront !== "string" || typeof cardBack !== "string") {
      return res
        .status(400)
        .json({ message: "Missing cardFront or cardBack query parameter" });
    }

    const card = state.findCard(cardFront, cardBack);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const hint = logic.getHint(card);
    console.log(`Hint requested for "${card.front}": ${hint}`);
    res.json({ hint });
  } catch (error) {
    console.error("Error getting hint:", error);
    res.status(500).json({ message: "Error getting hint" });
  }
});

// GET /api/progress
app.get("/api/progress", (req: Request, res: Response) => {
  try {
    const buckets = state.getBuckets();
    const history = state.getHistory();
    const progress: ProgressStats = logic.computeProgress(buckets, history);
    res.json(progress);
  } catch (error) {
    console.error("Error computing progress:", error);
    res.status(500).json({ message: "Error computing progress" });
  }
});

// POST /api/day/next
app.post("/api/day/next", (req: Request, res: Response) => {
  try {
    state.incrementDay();
    const newDay = state.getCurrentDay();
    console.log(`Advanced to Day ${newDay}`);
    res.status(200).json({
      message: `Advanced to day ${newDay}`,
      currentDay: newDay,
    });
  } catch (error) {
    console.error("Error advancing day:", error);
    res.status(500).json({ message: "Error advancing day" });
  }
});

// POST /api/cards - Add new card
app.post("/api/cards", (req: Request, res: Response) => {
  try {
    const { front, back, hint, tags } = req.body;

    if (!front || !back) {
      return res.status(400).json({ message: "Front and back are required" });
    }

    const newCard = new Flashcard(front, back, hint, tags || []);

    const buckets = state.getBuckets();
    if (!buckets.has(0)) {
      buckets.set(0, new Set());
    }

    buckets.get(0)!.add(newCard);
    state.setBuckets(buckets);

    console.log(`Added new card: "${front}"`);
    res.status(201).json({
      message: "Card added successfully",
      card: { front, back, hint, tags },
    });
  } catch (error) {
    console.error("Error adding card:", error);
    res.status(500).json({ message: "Error adding card" });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
  console.log(`Current Day: ${state.getCurrentDay()}`);
});
