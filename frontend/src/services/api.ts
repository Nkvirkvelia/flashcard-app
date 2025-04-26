import axios from "axios";
import { Flashcard, PracticeSession, ProgressStats, AnswerDifficulty } from "../types";

const API_BASE_URL = "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchPracticeCards = async (): Promise<PracticeSession> => {
  const response = await apiClient.get<PracticeSession>("/practice");
  return response.data;
};

export const submitAnswer = async (
  cardFront: string,
  cardBack: string,
  difficulty: AnswerDifficulty
): Promise<void> => {
  const payload = { cardFront, cardBack, difficulty };
  await apiClient.post("/update", payload);
};

export const fetchHint = async (card: Flashcard): Promise<string> => {
  const response = await apiClient.get<{ hint: string }>("/hint", {
    params: {
      cardFront: card.front,
      cardBack: card.back,
    },
  });
  return response.data.hint;
};

export const fetchProgress = async (): Promise<ProgressStats> => {
  const response = await apiClient.get<ProgressStats>("/progress");
  return response.data;
};

export const advanceDay = async (): Promise<{ currentDay: number }> => {
  const response = await apiClient.post<{ currentDay: number }>("/day/next");
  return response.data;
};

// Fetch all flashcards
export const fetchAllFlashcards = async (): Promise<Flashcard[]> => {
  const response = await apiClient.get<Flashcard[]>("/cards");
  return response.data;
};

// Fetch all unique tags
export const fetchTags = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>("/tags");
  return response.data;
};
