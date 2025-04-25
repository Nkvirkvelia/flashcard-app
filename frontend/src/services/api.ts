import axios from "axios";
import {
  PracticeSession,
  UpdateRequest,
  AnswerDifficulty,
  ProgressStats,
  Flashcard,
} from "../types";

// Configure base URL for the backend API
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
  const payload: UpdateRequest = { cardFront, cardBack, difficulty };
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
  const response = await apiClient.post<{
    message: string;
    currentDay: number;
  }>("/day/next");
  return response.data;
};
