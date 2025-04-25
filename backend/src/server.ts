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

// GET /api/practice - Get cards to practice for the current day
app.get("/api/practice", (req: Request, res: Response) => {
  try {
    const day = state.getCurrentDay();
    const bucketsMap = state.getBuckets();
    // Convert Map to Array<Set> for the practice function
    const bucketSets = logic.toBucketSets(bucketsMap);
    const cardsToPracticeSet = logic.practice(bucketSets, day);

    // Convert Set to Array for JSON response
    const cardsToPracticeArray = Array.from(cardsToPracticeSet);

    console.log(`Day ${day}: Practice ${cardsToPracticeArray.length} cards`);
    res.json({ cards: cardsToPracticeArray, day });
  } catch (error) {
    console.error("Error getting practice cards:", error);
    res.status(500).json({ message: "Error fetching practice cards" });
  }
});

// POST /api/update - Update a card's bucket after practice
app.post("/api/update", (req: Request, res: Response) => {
  try {
    const { cardFront, cardBack, difficulty } = req.body as UpdateRequest;

    // Validate difficulty
    if (!(difficulty in AnswerDifficulty)) {
      res.status(400).json({ message: "Invalid difficulty level" });
      return;
    }

    const card = state.findCard(cardFront, cardBack);
    if (!card) {
      res.status(404).json({ message: "Card not found" });
      return;
    }

    const currentBuckets = state.getBuckets();
    const previousBucket = state.findCardBucket(card);

    // Use update function
    const updatedBuckets = logic.update(currentBuckets, card, difficulty);
    state.setBuckets(updatedBuckets);

    // Add to history
    const newBucket = state.findCardBucket(card);
    const historyRecord: PracticeRecord = {
      cardFront: card.front,
      cardBack: card.back,
      timestamp: Date.now(),
      difficulty,
      previousBucket: previousBucket ?? -1,
      newBucket: newBucket ?? -1,
      card, // <-- full Flashcard object
      isCorrect: difficulty === AnswerDifficulty.Easy, // <-- or your own logic
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

// GET /api/hint - Get a hint for a card
app.get("/api/hint", (req: Request, res: Response) => {
  try {
    const { cardFront, cardBack } = req.query;

    if (typeof cardFront !== "string" || typeof cardBack !== "string") {
      res
        .status(400)
        .json({ message: "Missing cardFront or cardBack query parameter" });
      return;
    }

    const card = state.findCard(cardFront, cardBack);
    if (!card) {
      res.status(404).json({ message: "Card not found" });
      return;
    }

    // Use getHint function
    const hint = logic.getHint(card);
    console.log(`Hint requested for "${card.front}": ${hint}`);
    res.json({ hint });
  } catch (error) {
    console.error("Error getting hint:", error);
    res.status(500).json({ message: "Error getting hint" });
  }
});

// GET /api/progress - Get learning progress statistics
app.get("/api/progress", (req: Request, res: Response) => {
  try {
    const buckets = state.getBuckets();
    const history = state.getHistory();

    // Use computeProgress function
    const progress: ProgressStats = logic.computeProgress(buckets, history);

    res.json(progress);
  } catch (error) {
    console.error("Error computing progress:", error);
    res.status(500).json({ message: "Error computing progress" });
  }
});

// POST /api/day/next - Advance the simulation day
app.post("/api/day/next", (req: Request, res: Response) => {
  state.incrementDay();
  const newDay = state.getCurrentDay();
  console.log(`Advanced to Day ${newDay}`);
  res
    .status(200)
    .json({ message: `Advanced to day ${newDay}`, currentDay: newDay });
});

// POST /api/cards - Add a new card from the extension
app.post("/api/cards", (req: Request, res: Response) => {
  try {
    const { front, back, hint, tags } = req.body;

    // Validate required fields
    if (!front || !back) {
      res.status(400).json({ message: "Front and back are required" });
      return;
    }

    // Create new flashcard
    const newCard = new Flashcard(front, back, hint, tags || []);

    // Get current buckets
    const currentBuckets = state.getBuckets();

    // Add to bucket 0 (new cards)
    if (!currentBuckets.has(0)) {
      currentBuckets.set(0, new Set());
    }

    const bucket0 = currentBuckets.get(0);
    if (bucket0) {
      bucket0.add(newCard);
    }

    // Update state
    state.setBuckets(currentBuckets);

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
